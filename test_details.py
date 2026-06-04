from backend.ocr_engine import extract_text_with_details

with open("backend/sample.png", "rb") as f:
    image_bytes = f.read()

results = extract_text_with_details(image_bytes)

print("\n=== OCR DETAILS ===\n")

for item in results:

    bbox, text, confidence = item

    print(f"TEXT: {text}")
    print(f"CONFIDENCE: {confidence:.2f}")
    print(f"BOX: {bbox}")

    print("-" * 50)
