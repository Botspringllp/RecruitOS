with open("PRD.txt", "r", encoding="cp1252", errors="ignore") as f:
    lines = f.readlines()

print("--- LINES 50 TO 180 ---")
for i in range(49, 180):
    if i < len(lines):
        print(f"Line {i+1}: {lines[i].strip()}")
