#!/usr/bin/env python3
"""Agnes image proxy — API key stays on the server, never in the browser or git."""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
AGNES_URL = "https://api.agnes-ai.cn/v1/images/generations"
MODEL = "agnes-image-2.5-flash"
HOST = os.environ.get("AGNES_PROXY_HOST", "127.0.0.1")
PORT = int(os.environ.get("AGNES_PROXY_PORT", "8787"))
MAX_PROMPT = 2000
RATE_LIMIT = 8  # requests
RATE_WINDOW = 60  # seconds
ALLOWED_ORIGINS = {
    "https://shikong163-afk.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8787",
    "http://localhost:8787",
    "null",  # file:// local open
}


def load_env() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_env()
API_KEY = os.environ.get("AGNES_API_KEY", "").strip()
hits: dict[str, deque[float]] = defaultdict(deque)


def cors_headers(origin: str | None) -> dict[str, str]:
    allowed = origin if origin in ALLOWED_ORIGINS else "https://shikong163-afk.github.io"
    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    }


def rate_ok(ip: str) -> bool:
    now = time.time()
    q = hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return False
    q.append(now)
    return True


class Handler(BaseHTTPRequestHandler):
    server_version = "JiaotaiAgnesProxy/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def _send(self, code: int, payload: dict, origin: str | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        for k, v in cors_headers(origin).items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        origin = self.headers.get("Origin")
        self.send_response(204)
        for k, v in cors_headers(origin).items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        origin = self.headers.get("Origin")
        if path in ("/", "/health"):
            self._send(
                200,
                {
                    "ok": True,
                    "service": "jiaotai-agnes-proxy",
                    "model": MODEL,
                    "key_configured": bool(API_KEY),
                },
                origin,
            )
            return
        self._send(404, {"error": "not_found"}, origin)

    def do_POST(self) -> None:
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if path not in ("/v1/images/generations", "/generate"):
            self._send(404, {"error": "not_found"}, origin)
            return

        if not API_KEY:
            self._send(503, {"error": "server_misconfigured"}, origin)
            return

        ip = self.client_address[0]
        if not rate_ok(ip):
            self._send(429, {"error": "rate_limited", "retry_after": RATE_WINDOW}, origin)
            return

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 20000:
            self._send(400, {"error": "bad_request"}, origin)
            return

        try:
            raw = self.rfile.read(length)
            data = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send(400, {"error": "invalid_json"}, origin)
            return

        prompt = str(data.get("prompt") or "").strip()
        if not prompt or len(prompt) > MAX_PROMPT:
            self._send(400, {"error": "invalid_prompt"}, origin)
            return

        size = str(data.get("size") or "1K")
        if size not in {"1K", "2K", "3K", "4K", "1024x1024", "1024x768"}:
            size = "1K"
        ratio = str(data.get("ratio") or "1:1")
        if ratio not in {"1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"}:
            ratio = "1:1"

        payload = {
            "model": MODEL,
            "prompt": prompt,
            "size": size,
            "ratio": ratio,
            "extra_body": {"response_format": "url"},
        }
        req = urllib.request.Request(
            AGNES_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                upstream = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")[:300]
            self._send(502, {"error": "upstream_error", "status": e.code, "detail": detail}, origin)
            return
        except Exception as e:
            self._send(502, {"error": "upstream_unreachable", "detail": type(e).__name__}, origin)
            return

        url = None
        try:
            url = (upstream.get("data") or [{}])[0].get("url")
        except Exception:
            url = None
        if not url:
            self._send(502, {"error": "empty_image"}, origin)
            return

        self._send(
            200,
            {
                "url": url,
                "model": MODEL,
                "provider": "agnes",
            },
            origin,
        )


def main() -> None:
    if not API_KEY:
        print("Missing AGNES_API_KEY. Put it in proxy/.env (gitignored) or the environment.")
        raise SystemExit(1)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Agnes proxy listening on http://{HOST}:{PORT}")
    print("Key is server-side only. Stop with Ctrl+C.")
    server.serve_forever()


if __name__ == "__main__":
    main()
