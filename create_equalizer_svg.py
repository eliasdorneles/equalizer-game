#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def band_filter(x, freq, freq_unit):
    width = 18
    y_offset = 22
    print(f"""
  <rect x="{x + 2}" y="22" width="{width}" height="{height_band_filter}" fill="#808080" />
  <text x="{x + 2 + 7 * int(1/len(freq))}" y="8" fill="#efefef" font-family="sans-serif" font-size="9">
    {freq}
    <tspan x="{x + 3 + 6 * int(1/len(freq_unit))}" dy="10">{freq_unit}</tspan>
  </text>
""")


width_eq = 230
height_eq = 117
height_band_filter = 90
position_zero = height_band_filter / 2 + 22

frequencies = [
    ("32", "Hz"),
    ("63", "Hz"),
    ("125", "Hz"),
    ("250", "Hz"),
    ("500", "Hz"),
    ("1", "kHz"),
    ("2", "kHz"),
    ("4", "kHz"),
    ("8", "kHz"),
    ("16", "kHz"),
]


def draw_equalizer():
    print(f"""<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width_eq}" height="{height_eq}">
    """)

    # TODO: it would be best to do this programatically from JS
    print('<style> .clickable { cursor: pointer; }</style>')
    print('<g id="eq-container">')

    for i, (freq, unit) in enumerate(frequencies):
        band_filter(i * 20 + 20, freq, unit)

    print(f"""
      <text x="8" y="26" fill="#efefef" font-family="sans-serif" font-size="9">
        12
        <tspan x="8" dy="10">dB</tspan>
      </text>
      <text x="10" y="68" fill="#efefef" font-family="sans-serif" font-size="9">0</text>
      <text x="5" y="{height_band_filter + 14}" fill="#efefef" font-family="sans-serif" font-size="9">
        -12
        <tspan x="8" dy="10">dB</tspan>
      </text>
      <line x1="22" x2="220" y1="{position_zero}" y2="{position_zero}" stroke="#efefef" stroke-width="1"  stroke-dasharray="6,2" />
    """)

    for i, (freq, unit) in enumerate(frequencies):
        x = i * 20 + 20
        gain = 0
        y_pos = position_zero - gain * (height_band_filter / 2 / 12) - 5
        print(f"""
          <rect id="band-filter-{i + 1}" class="band-filter" x="{x + 2}" y="{y_pos}" width="{18}" height="10" fill="#bbc42a" stroke-width="0.5" stroke="#3b5400" />
          """)

    print('</g>')
    print(f"""
    </svg>
    """)

draw_equalizer()
