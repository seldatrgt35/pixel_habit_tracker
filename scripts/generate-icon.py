"""Regenerate the original Pip launcher icon. Requires Pillow; not used at runtime."""
from pathlib import Path
from PIL import Image, ImageDraw

assets = Path(__file__).resolve().parents[1] / "apps" / "mobile" / "assets"
image = Image.new("RGB", (40, 40), "#EAF1DF")
draw = ImageDraw.Draw(image)
shapes = [
    ("#46794A", [(19, 7), (22, 7), (22, 12), (19, 12)]),
    ("#46794A", [(21, 5), (28, 5), (28, 8), (25, 8), (25, 11), (21, 11)]),
    ("#8CB868", [(12, 7), (18, 7), (18, 9), (21, 9), (21, 13), (16, 13), (16, 11), (12, 11)]),
    ("#35624B", [(13, 13), (28, 13), (28, 16), (31, 16), (31, 19), (33, 19), (33, 29), (30, 29), (30, 32), (11, 32), (11, 29), (8, 29), (8, 19), (10, 19), (10, 16), (13, 16)]),
    ("#B8D99F", [(13, 16), (28, 16), (28, 19), (30, 19), (30, 28), (27, 28), (27, 30), (13, 30), (13, 28), (11, 28), (11, 19), (13, 19)]),
    ("#D6EABE", [(14, 17), (25, 17), (25, 20), (14, 20)]),
    ("#293D32", [(15, 21), (17, 21), (17, 24), (15, 24)]),
    ("#293D32", [(24, 21), (26, 21), (26, 24), (24, 24)]),
    ("#293D32", [(19, 25), (23, 25), (23, 26), (19, 26)]),
    ("#EBAB95", [(12, 25), (15, 25), (15, 27), (12, 27)]),
    ("#EBAB95", [(27, 25), (30, 25), (30, 27), (27, 27)]),
    ("#35624B", [(11, 32), (17, 32), (17, 34), (11, 34)]),
    ("#35624B", [(24, 32), (30, 32), (30, 34), (24, 34)]),
]
svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" shape-rendering="crispEdges"><path fill="#EAF1DF" d="M0 0h40v40H0z"/>']
for color, points in shapes:
    draw.polygon(points, fill=color)
    svg.append(f'<polygon fill="{color}" points="{" ".join(f"{x},{y}" for x, y in points)}"/>')
svg.append("</svg>")
(assets / "pip-icon.svg").write_text("\n".join(svg), encoding="utf-8")
image.resize((1024, 1024), Image.Resampling.NEAREST).save(assets / "icon.png")
image.resize((64, 64), Image.Resampling.NEAREST).save(assets / "favicon.png")
