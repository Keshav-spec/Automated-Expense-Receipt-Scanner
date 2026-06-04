from backend.ocr_engine import extract_text

with open("backend\sample.png", "rb") as f:
    image_bytes = f.read()

text = extract_text(image_bytes)

print("\n=== EXTRACTED TEXT ===\n")
print(text)