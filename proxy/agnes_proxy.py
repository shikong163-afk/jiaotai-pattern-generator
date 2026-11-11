#!/usr/bin/env python3
"""Agnes image proxy + static site server.

API key stays on the server (.env), never in the browser or git.
Open http://127.0.0.1:8787/process.html for Agnes-backed generation.
"""

from __future__ import annotations

import json
import mimetypes
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
SITE_ROOT = ROOT.parent
ENV_PATH = ROOT / ".env"
AGNES_URL = "https://api.agnes-ai.cn/v1/images/generations"
MODEL = "agnes-image-2.5-flash"
HOST = os.environ.get("AGNES_PROXY_HOST", "127.0.0.1")
PORT = int(os.environ.get("AGNES_PROXY_PORT", "8787"))
MAX_PROMPT = 2000
RATE_LIMIT = 8
RATE_WINDOW = 60


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


def origin_allowed(origin: str | None) -> bool:
    if not origin or origin == "null":
        return True
    if origin == "https://shikong163-afk.github.io":
        return True
    if origin.startswith("http://127.0.0.1:") or origin.startswith("http://localhost:"):
        return True
    if origin in {"http://127.0.0.1", "http://localhost"}:
        return True
    return False


def cors_headers(origin: str | None) -> dict[str, str]:
    if origin_allowed(origin) and origin and origin != "null":
        allow = origin
    else:
        allow = "https://shikong163-afk.github.io"
    return {
        "Access-Control-Allow-Origin": allow,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Bypass-Tunnel-Reminder",
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


def normalize_size_ratio(size: str, ratio: str) -> tuple[str, str]:
    if size not in {"1K", "2K", "3K", "4K", "1024x1024", "1024x768"}:
        size = "1K"
    if ratio not in {"1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"}:
        ratio = "1:1"
    return size, ratio


def call_agnes(prompt: str, size: str, ratio: str) -> dict:
    size, ratio = normalize_size_ratio(size, ratio)
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
    with urllib.request.urlopen(req, timeout=180) as resp:
        upstream = json.loads(resp.read().decode("utf-8"))
    url = (upstream.get("data") or [{}])[0].get("url")
    if not url:
        raise RuntimeError("empty_image")
    return {"url": url, "model": MODEL, "provider": "agnes"}


def safe_site_path(url_path: str) -> Path | None:
    if "?" in url_path:
        url_path = url_path.split("?", 1)[0]
    if url_path in ("", "/"):
        url_path = "/index.html"
    rel = urllib.parse.unquote(url_path.lstrip("/"))
    if not rel or ".." in rel.replace("\\", "/").split("/"):
        return None
    candidate = (SITE_ROOT / rel).resolve()
    try:
        candidate.relative_to(SITE_ROOT.resolve())
    except ValueError:
        return None
    if not candidate.is_file():
        return None
    return candidate


class Handler(BaseHTTPRequestHandler):
    server_version = "JiaotaiAgnesProxy/1.2"

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def _send_json(self, code: int, payload: dict, origin: str | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        for k, v in cors_headers(origin).items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path) -> None:
        data = path.read_bytes()
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        origin = self.headers.get("Origin")
        self.send_response(204)
        for k, v in cors_headers(origin).items():
            self.send_header(k, v)
        self.end_headers()

    def _handle_generate(self, prompt: str, size: str, ratio: str, origin: str | None) -> None:
        if not API_KEY:
            self._send_json(503, {"error": "server_misconfigured"}, origin)
            return
        ip = self.client_address[0]
        if not rate_ok(ip):
            self._send_json(429, {"error": "rate_limited", "retry_after": RATE_WINDOW}, origin)
            return
        prompt = (prompt or "").strip()
        if not prompt or len(prompt) > MAX_PROMPT:
            self._send_json(400, {"error": "invalid_prompt"}, origin)
            return
        try:
            result = call_agnes(prompt, size or "1K", ratio or "1:1")
            self._send_json(200, result, origin)
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")[:300]
            self._send_json(502, {"error": "upstream_error", "status": e.code, "detail": detail}, origin)
        except Exception as e:
            self._send_json(502, {"error": "upstream_unreachable", "detail": type(e).__name__}, origin)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        origin = self.headers.get("Origin")

        if path in ("/health", "/api/health"):
            self._send_json(
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

        if path in ("/generate", "/v1/images/generations", "/api/generate"):
            qs = parse_qs(parsed.query)
            prompt = urllib.parse.unquote_plus((qs.get("prompt") or [""])[0])
            size = (qs.get("size") or ["1K"])[0]
            ratio = (qs.get("ratio") or ["1:1"])[0]
            self._handle_generate(prompt, size, ratio, origin)
            return

        file_path = safe_site_path(path)
        if file_path is None:
            self._send_json(404, {"error": "not_found"}, origin)
            return
        self._send_file(file_path)

    def do_POST(self) -> None:
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if path not in ("/v1/images/generations", "/generate", "/api/generate"):
            self._send_json(404, {"error": "not_found"}, origin)
            return
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 20000:
            self._send_json(400, {"error": "bad_request"}, origin)
            return
        try:
            raw = self.rfile.read(length)
            data = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send_json(400, {"error": "invalid_json"}, origin)
            return
        self._handle_generate(
            str(data.get("prompt") or ""),
            str(data.get("size") or "1K"),
            str(data.get("ratio") or "1:1"),
            origin,
        )


def main() -> None:
    if not API_KEY:
        print("Missing AGNES_API_KEY. Put it in proxy/.env (gitignored) or the environment.")
        raise SystemExit(1)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Agnes proxy + site: http://{HOST}:{PORT}/")
    print(f"Process page:       http://{HOST}:{PORT}/process.html")
    print("Key stays server-side only. Stop with Ctrl+C.")
    server.serve_forever()


if __name__ == "__main__":
    main()
