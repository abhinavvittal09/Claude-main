#!/usr/bin/env python3
"""Validate design/tokens/tokens.json: name coverage, structure, WCAG contrast, spring math.
Exit 1 on hard failures (missing names, malformed values). Contrast failures are reported, not fatal:
they are design decisions to carry as usage rules (see design/tokens/README.md)."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); DIR = os.path.dirname(HERE)
t = json.load(open(os.path.join(DIR, "tokens.json")))
keys = [k for k in t if not k.startswith("$") and k not in ("modes", "defaultMode")]
expected = [f"color/bg/{x}" for x in "canvas surface elevated inverse".split()]
expected += [f"color/text/{x}" for x in "primary secondary tertiary onAccent inverse".split()]
expected += [f"color/accent/{x}" for x in "primary subtle pressed".split()]
for s in "success warning danger info".split(): expected += [f"color/status/{s}", f"color/status/{s}/subtle"]
expected += [f"color/border/{x}" for x in "subtle strong focus".split()]
expected += [f"color/cardArt/{i}" for i in range(1, 9)]
expected += [f"color/network/{x}" for x in "visa mastercard amex discover".split()]
expected += ["type/display/xl", "type/display/l", "type/title/l", "type/title/m", "type/title/s",
             "type/body/l", "type/body/m", "type/body/s", "type/label/m", "type/label/s", "type/mono/l", "type/mono/m"]
expected += [f"space/{i}" for i in range(1, 13)] + ["space/gutter"]
expected += [f"radius/{x}" for x in "xs s m l xl card pill".split()]
expected += [f"elevation/{i}" for i in range(4)]
expected += ["motion/fast", "motion/base", "motion/slow", "motion/spring/sheet"]
missing = [k for k in expected if k not in t]; extra = [k for k in keys if k not in expected]
hard = []
if missing: hard.append(f"missing tokens: {missing}")
for k in keys:
    v = t[k]
    if v["$type"] == "color":
        if set(v["$value"]) != {"dark", "light"}: hard.append(f"{k}: needs dark+light")
        for m, c in v["$value"].items():
            if not re.fullmatch(r"#[0-9A-Fa-f]{6}", c): hard.append(f"{k}/{m}: bad colour {c}")
if [t[f"space/{i}"]["$value"] for i in range(1, 13)] != [4 * i for i in range(1, 13)]: hard.append("space scale is not 4pt")
def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def cr(a, b):
    la, lb = lum(a), lum(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
C = lambda k, m: t[k]["$value"][m]
rows = []
for m in ("dark", "light"):
    for txt in ("primary", "secondary", "tertiary"):
        for bg in ("canvas", "surface", "elevated"):
            rows.append((m, f"text/{txt} on bg/{bg}", cr(C(f"color/text/{txt}", m), C(f"color/bg/{bg}", m)), 4.5))
    rows.append((m, "text/onAccent on accent/primary", cr(C("color/text/onAccent", m), C("color/accent/primary", m)), 4.5))
    rows.append((m, "text/onAccent on accent/pressed", cr(C("color/text/onAccent", m), C("color/accent/pressed", m)), 4.5))
    rows.append((m, "accent/primary as small text on bg/canvas", cr(C("color/accent/primary", m), C("color/bg/canvas", m)), 4.5))
    rows.append((m, "accent/primary as large text on bg/canvas", cr(C("color/accent/primary", m), C("color/bg/canvas", m)), 3.0))
    rows.append((m, "accent/primary as small text on accent/subtle", cr(C("color/accent/primary", m), C("color/accent/subtle", m)), 4.5))
    rows.append((m, "text/primary on accent/subtle", cr(C("color/text/primary", m), C("color/accent/subtle", m)), 4.5))
    for s in "success warning danger info".split():
        rows.append((m, f"status/{s} on status/{s}/subtle", cr(C(f"color/status/{s}", m), C(f"color/status/{s}/subtle", m)), 4.5))
        rows.append((m, f"status/{s} as text on bg/elevated", cr(C(f"color/status/{s}", m), C("color/bg/elevated", m)), 4.5))
    rows.append((m, "text/inverse on bg/inverse", cr(C("color/text/inverse", m), C("color/bg/inverse", m)), 4.5))
    rows.append((m, "border/focus on bg/canvas (UI 3:1)", cr(C("color/border/focus", m), C("color/bg/canvas", m)), 3.0))
    rows.append((m, "border/strong on bg/surface (UI 3:1)", cr(C("color/border/strong", m), C("color/bg/surface", m)), 3.0))
    for n in "visa mastercard amex discover".split():
        rows.append((m, f"network/{n} on bg/elevated (UI 3:1)", cr(C(f"color/network/{n}", m), C("color/bg/elevated", m)), 3.0))
for i in range(1, 9):
    g = t[f"color/cardArt/{i}"]["$value"]; name = t[f"color/cardArt/{i}"]["$description"].split(".")[0]
    rows.append(("art", f"cardArt/{i} {name}: ink on from", cr(g["ink"], g["from"]), 4.5))
    rows.append(("art", f"cardArt/{i} {name}: ink on to", cr(g["ink"], g["to"]), 4.5))
s = t["motion/spring/sheet"]["$value"]; zeta = s["damping"] / (2 * (s["stiffness"] * s["mass"]) ** 0.5)
print(f"tokens: {len(keys)}  missing: {len(missing)}  extra: {extra or 'none'}")
fails = [r for r in rows if r[2] < r[3]]
print(f"contrast pairs: {len(rows)}  failing: {len(fails)}")
for m, lbl, v, req in rows:
    if v < req or "-v" in sys.argv: print(f"  {'FAIL' if v < req else 'ok  '} {m:5s} {lbl:50s} {v:5.2f} (needs {req})")
print(f"spring dampingRatio: computed {zeta:.3f}, stated {s['dampingRatio']}")
print("font weights:", sorted({t[k]['$value']['fontWeight'] for k in keys if t[k]['$type'] == 'typography'}))
if hard:
    print("HARD FAILURES:"); [print("  " + h) for h in hard]; sys.exit(1)
