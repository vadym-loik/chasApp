#!/usr/bin/env bash
# Generates all app icons from one logo design.
# Needs: rsvg-convert (librsvg).
set -euo pipefail
cd "$(dirname "$0")/../assets"

BRAND_TOP='#FF8A5C'
BRAND_BOTTOM='#E8503A'

# The logo mark: a countdown ring with the letter «Ч» inside.
# $1 = ring and letter color, $2 = track opacity, $3 = scale around the center.
mark() {
  cat <<EOF
<g transform="translate(512 512) scale($3) translate(-512 -512)" fill="none" stroke="$1" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="512" cy="512" r="300" stroke-width="64" opacity="$2"/>
  <path d="M512 212 A300 300 0 1 1 212 512" stroke-width="64"/>
  <path d="M420 372 V420 C420 500 470 548 540 548 C566 548 588 542 604 534 M604 372 V652" stroke-width="80"/>
</g>
EOF
}

background() {
  cat <<EOF
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="$BRAND_TOP"/><stop offset="1" stop-color="$BRAND_BOTTOM"/>
</linearGradient></defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
EOF
}

svg() { echo "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\">$1</svg>"; }

render() { # $1 = file, $2 = size, $3 = svg
  echo "$3" | rsvg-convert -w "$2" -h "$2" -o "$1"
}

LOGO=$(svg "$(background)$(mark '#FFFFFF' 0.3 1)")
echo "$LOGO" > logo.svg

render icon.png 1024 "$LOGO"
render favicon.png 48 "$LOGO"
# Android adaptive icon: the mark must fit the safe zone, so scale it down.
render android-icon-background.png 1024 "$(svg "$(background)")"
render android-icon-foreground.png 1024 "$(svg "$(mark '#FFFFFF' 0.3 0.8)")"
render android-icon-monochrome.png 1024 "$(svg "$(mark '#FFFFFF' 0.4 0.8)")"
# Splash: brand-colored mark on a plain background.
render splash-icon.png 1024 "$(svg "$(mark "$BRAND_BOTTOM" 0.2 1)")"
render splash-icon-dark.png 1024 "$(svg "$(mark "$BRAND_TOP" 0.25 1)")"
echo "Icons generated."
