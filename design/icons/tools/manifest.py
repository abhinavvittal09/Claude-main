#!/usr/bin/env python3
"""Regenerate design/icons/manifest.json from the SVG files. Run from anywhere."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.dirname(HERE)
GROUPS = {
  "tab": ["ask", "wallet", "perks", "activity"],
  "category": ["dining", "groceries", "gas", "online", "travel", "drugstore", "warehouse", "streaming", "transit", "everything"],
  "reason": ["earn", "offer", "credit", "sub", "protection", "warning", "constraint", "cap", "globe", "tie"],
  "status": ["excluded", "frozen", "offline", "activate", "info", "cash"],
  "network": ["network-visa", "network-mastercard", "network-amex", "network-discover"],
  "ui": ["search", "mic", "location", "clock", "chevron-left", "chevron-right", "chevron-down", "chevron-up",
         "close", "check", "plus", "minus", "more", "edit", "trash", "external", "share", "flag",
         "avatar", "reorder", "refresh", "bell", "calendar", "sparkline", "widget"],
}
NOTES = {
  "activity": ["Filled variant uses rounded-rect bars instead of the outline's line bars, because lines have no area to tint. Designer decision in drop 2."],
}
files = sorted(f for f in os.listdir(DIR) if f.endswith(".svg"))
names = {re.sub(r"^icon-|\.svg$", "", f) for f in files}
base = sorted(n for n in names if not n.endswith("-filled"))
icons = []
for n in base:
    g = next((k for k, v in GROUPS.items() if n in v), None)
    if g is None:
        raise SystemExit(f"ungrouped icon: {n} (add it to GROUPS)")
    e = {"name": n, "group": g, "file": f"icon-{n}.svg", "filled": f"icon-{n}-filled.svg" if f"{n}-filled" in names else None}
    if n in NOTES: e["notes"] = NOTES[n]
    icons.append(e)
orphans = sorted(n for n in names if n.endswith("-filled") and n[:-7] not in names)
if orphans: raise SystemExit(f"filled variants without outline: {orphans}")
manifest = {"grid": 24, "strokeWidth": 1.75, "color": "currentColor", "filledTint": 0.22,
            "source": "Claude Design kit, drops 1 and 2", "count": len(icons), "groups": list(GROUPS), "icons": icons}
with open(os.path.join(DIR, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2); fh.write("\n")
print(f"{len(icons)} base icons, {sum(1 for i in icons if i['filled'])} filled; " + ", ".join(f"{g}={sum(1 for i in icons if i['group']==g)}" for g in GROUPS))
