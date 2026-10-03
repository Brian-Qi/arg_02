# -*- coding: utf-8 -*-
"""出图原档 -> 站点用 WebP。

与第一部的差别：本作是**浅色**论坛，所以带透明通道的图合成到白底（第一部是深色底）。

依赖： pip install pillow
用法：
  python scripts/to-webp.py [原图目录] [输出目录] [原图备份目录]
默认：
  原图目录 _raw_img        输出目录 public/img        备份目录 _raw_orig

行为：
  - 把 <原图目录> 下的 png/jpg/jpeg 转成同名 .webp 放进 <输出目录>
  - 输出目录里已存在同名 .webp 时**不覆盖**，只把原图挪去备份（方便重跑）
  - 原图一律移入 <备份目录>，保持 _raw_img 干净
"""
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "_raw_img")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "public", "img")
BAK = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, "_raw_orig")

for d in (SRC, OUT, BAK):
    os.makedirs(d, exist_ok=True)

from PIL import Image  # noqa: E402

BG = (255, 255, 255)  # 浅色论坛：白底
QUALITY = 82

before = after = 0
converted = []
skipped = []
failed = []

for fn in sorted(os.listdir(SRC)):
    if not fn.lower().endswith((".png", ".jpg", ".jpeg")):
        continue
    p = os.path.join(SRC, fn)
    stem = os.path.splitext(fn)[0]
    out = os.path.join(OUT, stem + ".webp")

    if os.path.exists(out):
        shutil.move(p, os.path.join(BAK, fn))
        skipped.append(fn)
        continue

    try:
        im = Image.open(p)
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, BG)
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        im.save(out, "WEBP", quality=QUALITY, method=6)
        b, a = os.path.getsize(p), os.path.getsize(out)
        before += b
        after += a
        converted.append((fn, os.path.basename(out), b // 1024, a // 1024))
        shutil.move(p, os.path.join(BAK, fn))
    except Exception as e:  # noqa: BLE001
        failed.append((fn, str(e)))

print("转换 %d 张" % len(converted))
for c in converted:
    print("  %-32s -> %-32s %5dKB -> %4dKB" % c)
if skipped:
    print("已存在同名 webp，跳过 %d 张（原图已移入备份）" % len(skipped))
for f in failed:
    print("FAIL", f[0], f[1])
if converted:
    print("原图合计 %.1f MB -> WebP %.1f MB" % (before / 1048576, after / 1048576))
print("输出目录:", OUT)
print("原图备份:", BAK)
