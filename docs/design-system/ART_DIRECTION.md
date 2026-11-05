# Original pixel art

Pip uses an integer 32×32 drawing grid: mint body, asymmetrical stem, two leaves, expressive square eyes and apricot cheeks. A small soil island, stepping-stone path and leaf silhouettes form a reusable garden scene. Draw with SVG rectangles and polygon paths. Shared limited palette and pixel density hold the scenes together.

Habit icons share a 24×24 grid and pine outline. Decorative scenes are hidden from screen readers; companion encouragement is normal text. Animation modifies transforms/expressions, not layout. Respect reduced motion and stop unnecessary loops when off-screen. Runtime illustrations are original SVG artwork; no third-party game characters are used.

`python scripts/generate-icon.py` regenerates the original launcher SVG and crisp PNG exports using Pillow. This is an optional art-authoring step, not a runtime dependency. Palette luminance determines black/white calendar numbers so text remains readable on intermediate progress colors in both themes.
