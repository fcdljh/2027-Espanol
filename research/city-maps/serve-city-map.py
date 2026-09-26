#!/usr/bin/env python3
"""Serve the map on localhost so browser CORS rules allow remote map tiles."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PAGE_PATH = "/research/city-maps/city-atlas.html"
handler = partial(SimpleHTTPRequestHandler, directory=str(PROJECT_ROOT))
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
url = f"http://127.0.0.1:{server.server_port}{PAGE_PATH}"

print(f"地图服务运行中：{url}")
print("服务根目录为项目根目录，以保证研究记录与计划链接可用；保持终端窗口打开，按 Ctrl+C 停止服务。")
Timer(0.7, webbrowser.open_new_tab, args=(url,)).start()

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n地图服务已停止。")
finally:
    server.server_close()
