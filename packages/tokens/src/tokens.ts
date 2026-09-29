// GENERATED FILE. Do not edit. Source: design/tokens/tokens.json. Regenerate: pnpm tokens:generate
export type Mode = 'dark' | 'light';
export const defaultMode: Mode = "dark";

export const colors = {
  "dark": {
    "bg": {
      "canvas": "#0B0B0C",
      "surface": "#151517",
      "elevated": "#1E1E21",
      "inverse": "#F4F1EA"
    },
    "text": {
      "primary": "#F4F1EA",
      "secondary": "#ABA79F",
      "tertiary": "#8A867F",
      "onAccent": "#06140B",
      "inverse": "#0B0B0C"
    },
    "accent": {
      "primary": "#3DF58A",
      "subtle": "#123322",
      "pressed": "#2AD472"
    },
    "status": {
      "success": {
        "base": "#5EE3C1",
        "subtle": "#0F2E27"
      },
      "warning": {
        "base": "#FFB547",
        "subtle": "#33250D"
      },
      "danger": {
        "base": "#FF6B6B",
        "subtle": "#361616"
      },
      "info": {
        "base": "#7AB8FF",
        "subtle": "#132436"
      }
    },
    "border": {
      "subtle": "#26262A",
      "strong": "#3A3A40",
      "focus": "#7AB8FF"
    }
  },
  "light": {
    "bg": {
      "canvas": "#F6F3EC",
      "surface": "#FFFDF8",
      "elevated": "#FFFFFF",
      "inverse": "#141416"
    },
    "text": {
      "primary": "#141416",
      "secondary": "#55534E",
      "tertiary": "#6B6862",
      "onAccent": "#06140B",
      "inverse": "#F6F3EC"
    },
    "accent": {
      "primary": "#12A150",
      "subtle": "#EAF8EF",
      "pressed": "#0F9447"
    },
    "status": {
      "success": {
        "base": "#0E7C66",
        "subtle": "#E3F4EF"
      },
      "warning": {
        "base": "#955600",
        "subtle": "#FBF0DC"
      },
      "danger": {
        "base": "#BA2C29",
        "subtle": "#FBE6E4"
      },
      "info": {
        "base": "#1F63C7",
        "subtle": "#E4EEFB"
      }
    },
    "border": {
      "subtle": "#E6E1D6",
      "strong": "#CFC8BA",
      "focus": "#1F63C7"
    }
  }
} as const;
export type Colors = (typeof colors)['dark'];

/** Muted network hints for the CardVisual glyph. Never a brand fill. */
export const network = {
  "dark": {
    "visa": "#6F7FAE",
    "mastercard": "#AE7F6F",
    "amex": "#6FA0AE",
    "discover": "#AE9A6F"
  },
  "light": {
    "visa": "#5B6B9A",
    "mastercard": "#9A6B5B",
    "amex": "#4F7D8A",
    "discover": "#8A7650"
  }
} as const;

/** 8 user-selectable card colours: 135° gradient, 6% grain, and the ink colour that passes AA on both ends. */
export const cardArt = [
  {
    "id": 1,
    "name": "Ink",
    "from": "#1E3A8A",
    "to": "#3B5BDB",
    "angle": 135,
    "ink": "#FFFFFF",
    "grainOpacity": 0.06
  },
  {
    "id": 2,
    "name": "Graphite",
    "from": "#26262B",
    "to": "#4A4A53",
    "angle": 135,
    "ink": "#FFFFFF",
    "grainOpacity": 0.06
  },
  {
    "id": 3,
    "name": "Brass",
    "from": "#B8893A",
    "to": "#E3BC6A",
    "angle": 135,
    "ink": "#1A1206",
    "grainOpacity": 0.06
  },
  {
    "id": 4,
    "name": "Oxblood",
    "from": "#6B1E2E",
    "to": "#A33A4E",
    "angle": 135,
    "ink": "#FFFFFF",
    "grainOpacity": 0.06
  },
  {
    "id": 5,
    "name": "Teal",
    "from": "#0F5C5C",
    "to": "#1A7D74",
    "angle": 135,
    "ink": "#FFFFFF",
    "grainOpacity": 0.06
  },
  {
    "id": 6,
    "name": "Plum",
    "from": "#4A2458",
    "to": "#7A3C8C",
    "angle": 135,
    "ink": "#FFFFFF",
    "grainOpacity": 0.06
  },
  {
    "id": 7,
    "name": "Tangerine",
    "from": "#D9622B",
    "to": "#F29255",
    "angle": 135,
    "ink": "#1A0A02",
    "grainOpacity": 0.06
  },
  {
    "id": 8,
    "name": "Sand",
    "from": "#D8D2C4",
    "to": "#EFEAE0",
    "angle": 135,
    "ink": "#1A1814",
    "grainOpacity": 0.06
  }
] as const;
export type CardArtId = (typeof cardArt)[number]['id'];

/**
 * Text styles as React Native style fragments. fontFamily is the expo-font asset key (undefined = system font).
 * fontWeight is rounded to hundreds; designWeight keeps the original value.
 */
export const typography = {
  "display": {
    "xl": {
      "fontFamily": "InterTight-Bold",
      "fontSize": 56,
      "lineHeight": 60,
      "fontWeight": "700",
      "letterSpacing": -1.5,
      "tabularNums": true,
      "designWeight": 700,
      "dynamicType": {
        "textStyle": "largeTitle-relative",
        "scales": true,
        "maxSize": 72,
        "note": "Winning return figure. Caps at 72pt; above AX1 wraps to two lines before shrinking"
      }
    },
    "l": {
      "fontFamily": "InterTight-Bold",
      "fontSize": 40,
      "lineHeight": 44,
      "fontWeight": "700",
      "letterSpacing": -1,
      "tabularNums": true,
      "designWeight": 700,
      "dynamicType": {
        "textStyle": "largeTitle-relative",
        "scales": true,
        "maxSize": 56
      }
    }
  },
  "title": {
    "l": {
      "fontFamily": "InterTight-SemiBold",
      "fontSize": 30,
      "lineHeight": 36,
      "fontWeight": "600",
      "letterSpacing": -0.6,
      "tabularNums": true,
      "designWeight": 650,
      "dynamicType": {
        "textStyle": "largeTitle",
        "scales": true
      }
    },
    "m": {
      "fontFamily": "InterTight-SemiBold",
      "fontSize": 22,
      "lineHeight": 28,
      "fontWeight": "600",
      "letterSpacing": -0.3,
      "tabularNums": true,
      "designWeight": 600,
      "dynamicType": {
        "textStyle": "title2",
        "scales": true
      }
    },
    "s": {
      "fontFamily": "InterTight-SemiBold",
      "fontSize": 17,
      "lineHeight": 22,
      "fontWeight": "600",
      "letterSpacing": -0.2,
      "tabularNums": true,
      "designWeight": 600,
      "dynamicType": {
        "textStyle": "headline",
        "scales": true
      }
    }
  },
  "body": {
    "l": {
      "fontSize": 17,
      "lineHeight": 24,
      "fontWeight": "400",
      "letterSpacing": 0,
      "tabularNums": false,
      "designWeight": 400,
      "dynamicType": {
        "textStyle": "body",
        "scales": true
      }
    },
    "m": {
      "fontSize": 15,
      "lineHeight": 20,
      "fontWeight": "400",
      "letterSpacing": 0,
      "tabularNums": false,
      "designWeight": 400,
      "dynamicType": {
        "textStyle": "subheadline",
        "scales": true
      }
    },
    "s": {
      "fontSize": 13,
      "lineHeight": 18,
      "fontWeight": "400",
      "letterSpacing": 0,
      "tabularNums": false,
      "designWeight": 400,
      "dynamicType": {
        "textStyle": "footnote",
        "scales": true
      }
    }
  },
  "label": {
    "m": {
      "fontSize": 15,
      "lineHeight": 20,
      "fontWeight": "600",
      "letterSpacing": 0,
      "tabularNums": false,
      "designWeight": 590,
      "dynamicType": {
        "textStyle": "callout-semibold",
        "scales": true
      }
    },
    "s": {
      "fontSize": 12,
      "lineHeight": 16,
      "fontWeight": "600",
      "letterSpacing": 0.2,
      "tabularNums": false,
      "designWeight": 590,
      "dynamicType": {
        "textStyle": "caption1-semibold",
        "scales": true,
        "note": "Chips. At AX sizes chips wrap to full-width rows"
      }
    }
  },
  "mono": {
    "l": {
      "fontFamily": "JetBrainsMono-Medium",
      "fontSize": 20,
      "lineHeight": 24,
      "fontWeight": "500",
      "letterSpacing": -0.2,
      "tabularNums": true,
      "designWeight": 500,
      "dynamicType": {
        "textStyle": "title3",
        "scales": true,
        "note": "Money and rates, tabular"
      }
    },
    "m": {
      "fontFamily": "JetBrainsMono-Medium",
      "fontSize": 15,
      "lineHeight": 20,
      "fontWeight": "500",
      "letterSpacing": 0,
      "tabularNums": true,
      "designWeight": 500,
      "dynamicType": {
        "textStyle": "subheadline",
        "scales": true
      }
    }
  }
} as const;

export const space = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "gutter": 16
} as const;
export const radius = {
  "xs": 6,
  "s": 10,
  "m": 14,
  "l": 20,
  "xl": 28,
  "card": 16,
  "pill": 999
} as const;

/** boxShadow strings for React Native 0.76+ (new architecture). Join with ', ' or pass the array. */
export const elevation = {
  "dark": {
    "0": [],
    "1": [
      "0 1 0 0 #FFFFFF0D inset",
      "0 1 2 0 #00000066"
    ],
    "2": [
      "0 1 0 0 #FFFFFF12 inset",
      "0 8 24 0 #00000080"
    ],
    "3": [
      "0 1 0 0 #FFFFFF14 inset",
      "0 16 40 0 #00000099"
    ]
  },
  "light": {
    "0": [],
    "1": [
      "0 1 2 0 #1414160F",
      "0 0 0 1 #1414160A"
    ],
    "2": [
      "0 6 20 0 #1414161A",
      "0 1 2 0 #1414160F"
    ],
    "3": [
      "0 16 40 0 #14141629",
      "0 2 6 0 #14141614"
    ]
  }
} as const;

export const motion = { ...{
  "fast": 120,
  "base": 200,
  "slow": 320,
  "spring": {
    "sheet": {
      "stiffness": 420,
      "damping": 42,
      "mass": 1,
      "dampingRatio": 1.02
    }
  }
}, easing: {
  "standard": [
    0.2,
    0,
    0,
    1
  ],
  "settle": [
    0.16,
    1,
    0.3,
    1
  ]
} } as const;

/** Font files the app must load with expo-font, keyed by fontFamily above. Files live in design/fonts (variable TTFs). */
export const fontAssets = [
  "InterTight-Bold",
  "InterTight-SemiBold",
  "JetBrainsMono-Medium"
] as const;
