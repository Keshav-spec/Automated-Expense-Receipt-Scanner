from backend.parser import (
extract_amount,
extract_date,
extract_merchant
)

def test_amount_extraction():


text = "Grand Total: Rs. 450.00"

assert extract_amount(text) == 450.00


def test_date_extraction():


text = "Date: 12/05/2024"

assert extract_date(text) == "2024-05-12"


def test_merchant_extraction():


text = """
RELIANCE FRESH
123 Main Street
Date: 12/05/2024
"""

assert extract_merchant(text) == "RELIANCE FRESH"

