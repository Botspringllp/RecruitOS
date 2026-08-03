import re

def parse_prd():
    # Try different encodings
    for encoding in ["utf-8", "cp1252", "latin-1"]:
        try:
            with open("PRD.txt", "r", encoding=encoding, errors="ignore") as f:
                content = f.read()
            print(f"Successfully read using encoding: {encoding}")
            break
        except Exception as e:
            print(f"Failed with {encoding}: {e}")
            
    print(f"Total characters in PRD.txt: {len(content)}")
    
    # Find headings
    lines = content.split("\n")
    headings = []
    for idx, line in enumerate(lines):
        if re.match(r'^#{1,4}\s+\w+', line) or re.match(r'^(Zone|Feature|Phase)\s+\d+', line, re.IGNORECASE) or re.match(r'^\d+\.\s+[A-Z]', line):
            headings.append((idx + 1, line))
            
    print("\n--- Document Headings (First 50) ---")
    for line_num, h in headings[:50]:
        print(f"Line {line_num}: {h.strip()}")
        
    # Search for CV parsing details
    print("\n--- Search Results for 'parsing' or 'cv' ---")
    count = 0
    for idx, line in enumerate(lines):
        if any(w in line.lower() for w in ["parsing", "parser", "cv", "resume", "duplicate"]):
            start = max(0, idx - 2)
            end = min(len(lines), idx + 3)
            print(f"Line {idx+1}:")
            for j in range(start, end):
                prefix = ">>" if j == idx else "  "
                print(f"{prefix}{j+1}: {lines[j].strip()}")
            print("-" * 30)
            count += 1
            if count >= 30: # limit output size
                print("... truncated list ...")
                break

if __name__ == "__main__":
    parse_prd()
