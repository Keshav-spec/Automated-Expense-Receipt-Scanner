import re
from typing import Optional
from datetime import datetime
from dateutil import parser as date_parser
from backend.classifier import classify_expense


def clean_text(text: str) -> str:
    """
    Clean OCR noise from extracted text.
    """

    # Replace common OCR mistakes
    replacements = {
        "O": "0",
        "l": "1",
        "|": "1",
    }

    cleaned = text

    for old, new in replacements.items():
        cleaned = cleaned.replace(old, new)

    return cleaned



def extract_amount(text: str) -> Optional[float]:
    """
    Extract total amount from receipt text intelligently.
    """

    text_lower = text.lower()

    # STEP 1:
    # Try finding proper decimal amounts first
    decimal_matches = re.findall(
        r'\b\d{1,6}\.\d{2}\b',
        text
    )

    decimal_amounts = []

    for amt in decimal_matches:

        try:
            value = float(amt)

            # Reasonable receipt range
            if 1 <= value <= 100000:
                decimal_amounts.append(value)

        except:
            continue

    # Prefer totals near "total"
    total_pattern = r'total[^\d]{0,20}(\d{1,6}\.\d{2})'

    total_matches = re.findall(
        total_pattern,
        text_lower
    )

    total_amounts = []

    for amt in total_matches:

        try:
            value = float(amt)

            if 1 <= value <= 100000:
                total_amounts.append(value)

        except:
            continue

    # Best case:
    if total_amounts:
        return max(total_amounts)

    # Otherwise largest decimal
    if decimal_amounts:
        return max(decimal_amounts)

    # STEP 2:
    # Fallback OCR repair logic
    broken_numbers = re.findall(
        r'\b\d{4,6}\b',
        text
    )

    repaired_amounts = []

    for num in broken_numbers:

        try:

            # Example:
            # 84280 -> 84.80
            repaired = float(num[:-2] + "." + num[-2:])

            if 1 <= repaired <= 100000:
                repaired_amounts.append(repaired)

        except:
            continue

    if repaired_amounts:
        return max(repaired_amounts)

    return None



def extract_date(text: str) -> Optional[str]:
    """
    Extract receipt date.
    """

    text_lower = text.lower()

    patterns = [

        # 12/05/2024
        r'\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b',

        # 12 May 2024
        r'\b\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}\b',

        # May 12 2024
        r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b',
    ]

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text_lower,
            re.IGNORECASE
        )

        for match in matches:

            try:
                parsed_date = date_parser.parse(
                    match,
                    fuzzy=True
                )

                return parsed_date.strftime('%Y-%m-%d')

            except:
                continue

    return datetime.today().strftime('%Y-%m-%d')



def extract_merchant(text: str) -> str:
    """
    Extract merchant/store name more intelligently.
    """

    lines = [
        line.strip()
        for line in text.split('\n')
        if line.strip()
    ]

    header_lines = lines[:5]

    blacklist = [
        "receipt",
        "invoice",
        "tax",
        "bill",
        "date",
        "total",
        "cash",
        "thank",
        "balance",
        "sales"
    ]

    candidates = []

    for line in header_lines:

        lower = line.lower()

        # Skip blacklisted keywords
        if any(word in lower for word in blacklist):
            continue

        # Skip very long lines
        if len(line) > 40:
            continue

        # Skip mostly numeric
        digit_ratio = sum(
            c.isdigit() for c in line
        ) / max(len(line), 1)

        if digit_ratio > 0.3:
            continue

        # Prefer uppercase/title-style names
        words = line.split()

        if 1 <= len(words) <= 5:
            candidates.append(line)

    if candidates:

        # Pick shortest reasonable candidate
        return min(candidates, key=len)

    return "Unknown Merchant"

def parse_receipt(raw_text: str) -> dict:
    """
    Main parser function.
    """
    
    amount = extract_amount(raw_text)

    date = extract_date(raw_text)

    merchant = extract_merchant(raw_text)

    category = classify_expense(
    merchant,
    raw_text
    )
    
    return {
        "merchant": merchant,
        "amount": amount,
        "date": date,
        "category": category,
        "raw_text": raw_text
    }


