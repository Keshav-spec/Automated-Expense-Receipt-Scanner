from backend.parser import (
    extract_amount,
    extract_date,
    extract_merchant,
    parse_receipt
)


def test_amount_extraction():

    text = "Grand Total: Rs. 450.00"

    assert extract_amount(text) == 450.00


def test_amount_extraction_with_currency_symbol():

    text = "TOTAL ₹1250.50"

    assert extract_amount(text) == 1250.50


def test_date_extraction_ddmmyyyy():

    text = "Date: 12/05/2024"

    assert extract_date(text) == "2024-05-12"


def test_date_extraction_dash_format():

    text = "Invoice Date: 25-12-2025"

    assert extract_date(text) == "2025-12-25"


def test_merchant_extraction():

    text = """
    RELIANCE FRESH
    123 Main Street
    Date: 12/05/2024
    """

    merchant = extract_merchant(text)

    assert merchant == "RELIANCE FRESH"


def test_parse_receipt_complete():

    text = """
    DOMINOS PIZZA

    Date: 15/06/2025

    Grand Total: Rs. 450.00
    """

    result = parse_receipt(text)

    assert result["merchant"] == "DOMINOS PIZZA"

    assert result["amount"] == 450.00

    assert result["date"] == "2025-06-15"

    assert result["category"] == "Food & Dining"


def test_unknown_category():

    text = """
    RANDOM COMPANY
    Total: Rs. 100.00
    """

    result = parse_receipt(text)

    assert result["category"] == "Other"


def test_missing_amount():

    text = """
    DOMINOS PIZZA
    Date: 15/06/2025
    """

    result = parse_receipt(text)

    assert result["amount"] is None