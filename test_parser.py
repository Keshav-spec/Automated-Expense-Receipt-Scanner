from backend.ocr_engine import extract_text
from backend.parser import parse_receipt

with open("backend/sample.png", "rb") as f:

    image_bytes = f.read()

# OCR extraction
raw_text = extract_text(image_bytes)

print("\n=== RAW OCR TEXT ===\n")
print(raw_text)

# Structured parsing
parsed_data = parse_receipt(raw_text)

print("\n=== PARSED RECEIPT ===\n")

for key, value in parsed_data.items():
    print(f"{key}: {value}")


sample_text = """
DOMINOS PIZZA
Total: Rs. 450.00
"""

from backend.parser import parse_receipt

parsed = parse_receipt(sample_text)

print(parsed)
