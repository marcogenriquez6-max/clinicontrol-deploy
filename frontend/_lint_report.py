import json, sys
data = json.load(sys.stdin)
files = {}
for f in data:
    fp = f["filePath"].replace(chr(92), "/")
    parts = fp.split("frontend/src/")
    short = parts[-1] if len(parts) > 1 else fp
    msgs = [m for m in f["messages"] if m.get("ruleId") == "@typescript-eslint/no-explicit-any"]
    if msgs:
        files[short] = len(msgs)
for k,v in sorted(files.items(), key=lambda x:-x[1]):
    print(f"{v:4d} {k}")
