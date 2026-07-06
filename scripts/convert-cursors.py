"""Convert the set7 Wii cursor pack (.cur / .ani) to 32x32 PNGs.

- .cur  -> single PNG (same basename)
- .ani  -> one PNG per frame (basename-f00.png, -f01.png, ...)
- Emits public/cursors/cursors.json with hotspot + frame metadata,
  consumed by the custom JS cursor layer.

Run:  python scripts/convert-cursors.py
"""

import io
import json
import struct
from pathlib import Path

from PIL import Image

CURSOR_DIR = Path(__file__).resolve().parent.parent / "public" / "cursors"
SIZE = 32


def read_cur_hotspot(data: bytes) -> tuple[int, int]:
    """Hotspot lives in the ICONDIRENTRY of a .cur (fields 4-7 after the 6-byte header)."""
    if len(data) < 14 or struct.unpack("<HH", data[2:6])[0:1] != (2,):
        return (0, 0)
    hx, hy = struct.unpack("<HH", data[10:14])
    return (hx, hy)


def cur_bytes_to_png(data: bytes, out_path: Path) -> tuple[int, int]:
    hotspot = read_cur_hotspot(data)
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGBA")
    src_w, src_h = img.size
    if img.size != (SIZE, SIZE):
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
    # rescale hotspot with the image
    hx = round(hotspot[0] * SIZE / src_w)
    hy = round(hotspot[1] * SIZE / src_h)
    img.save(out_path)
    return (hx, hy)


def ani_frames(data: bytes) -> list[bytes]:
    """Minimal RIFF walker: collect every 'icon' chunk (each is a full .cur blob)."""
    frames = []
    if data[:4] != b"RIFF":
        return frames
    pos = 12  # RIFF + size + 'ACON'
    while pos + 8 <= len(data):
        chunk_id = data[pos:pos + 4]
        (chunk_len,) = struct.unpack("<I", data[pos + 4:pos + 8])
        body = data[pos + 8:pos + 8 + chunk_len]
        if chunk_id == b"LIST" and body[:4] == b"fram":
            sub = 4
            while sub + 8 <= len(body):
                sub_id = body[sub:sub + 4]
                (sub_len,) = struct.unpack("<I", body[sub + 4:sub + 8])
                if sub_id == b"icon":
                    frames.append(body[sub + 8:sub + 8 + sub_len])
                sub += 8 + sub_len + (sub_len & 1)
        pos += 8 + chunk_len + (chunk_len & 1)
    return frames


def main() -> None:
    manifest = {}
    for cur in sorted(CURSOR_DIR.glob("*.cur")):
        out = CURSOR_DIR / (cur.stem + ".png")
        hx, hy = cur_bytes_to_png(cur.read_bytes(), out)
        manifest[cur.stem] = {"src": cur.name, "png": out.name, "hotspot": [hx, hy]}
        print(f"cur  {cur.name} -> {out.name} hotspot=({hx},{hy})")

    for ani in sorted(CURSOR_DIR.glob("*.ani")):
        frames = ani_frames(ani.read_bytes())
        frame_files, hotspot = [], [0, 0]
        for i, frame in enumerate(frames):
            out = CURSOR_DIR / f"{ani.stem}-f{i:02d}.png"
            hx, hy = cur_bytes_to_png(frame, out)
            hotspot = [hx, hy]
            frame_files.append(out.name)
        manifest[ani.stem] = {
            "src": ani.name,
            "frames": frame_files,
            "hotspot": hotspot,
            "fps": 12,
        }
        print(f"ani  {ani.name} -> {len(frame_files)} frames")

    (CURSOR_DIR / "cursors.json").write_text(json.dumps(manifest, indent=2))
    print(f"wrote cursors.json with {len(manifest)} entries")


if __name__ == "__main__":
    main()
