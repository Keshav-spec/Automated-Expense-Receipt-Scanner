import re

from typing import Optional
from datetime import datetime

from dateutil import parser as date_parser

from backend.classifier import classify_expense


# AMOUNT EXTRACTION

def extract_amount(text: str) -> Optional[float]:
    """
    Extract receipt total amount.
    """

    text_lower = text.lower()

    # High confidence patterns
    total_patterns = [

        r'grand\s*total[^\d]*(\d{1,6}\.\d{2})',

        r'net\s*amount[^\d]*(\d{1,6}\.\d{2})',

        r'total\s*amount[^\d]*(\d{1,6}\.\d{2})',

        r'total[^\d]*(\d{1,6}\.\d{2})',

        r'rs\.?\s*(\d{1,6}\.\d{2})',

        r'₹\s*(\d{1,6}\.\d{2})'
    ]

    for pattern in total_patterns:

        matches = re.findall(
            pattern,
            text_lower,
            re.IGNORECASE
        )

        for match in matches:

            try:

                value = float(match)

                if 1 <= value <= 100000:

                    return value

            except:
                continue

    # Generic decimal numbers

    decimal_matches = re.findall(
        r'\b\d{1,6}\.\d{2}\b',
        text
    )

    valid_amounts = []

    for amount in decimal_matches:

        try:

            value = float(amount)

            if 1 <= value <= 100000:

                valid_amounts.append(value)

        except:
            continue

    if valid_amounts:

        return max(valid_amounts)

    # OCR-repaired amounts
    repaired_candidates = []

    for num in re.findall(r'\b\d{4,6}\b', text):

        try:

            value = int(num)

            # Skip years
            if 1900 <= value <= 2100:
                continue

            repaired = float(
                num[:-2] + "." + num[-2:]
            )

            if 1 <= repaired <= 100000:

                repaired_candidates.append(
                    repaired
                )

        except:
            continue

    if repaired_candidates:

        return max(repaired_candidates)

    return None


# DATE EXTRACTION

def extract_date(text: str) -> Optional[str]:
    """
    Extract receipt date.
    """

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
            text,
            re.IGNORECASE
        )

        for match in matches:

            try:

                parsed_date = date_parser.parse(
                    match,
                    dayfirst=True
                )

                return parsed_date.strftime(
                    "%Y-%m-%d"
                )

            except Exception:
                continue

    return datetime.today().strftime(
        "%Y-%m-%d"
    )


# MERCHANT EXTRACTION

def extract_merchant(text: str) -> str:
    """
    Extract merchant/store name.
    """

    lines = [

        line.strip()

        for line in text.split("\n")

        if line.strip()
    ]

    blacklist = [

        "receipt",
        "invoice",
        "date",
        "total",
        "thank",
        "gst",
        "tax"
    ]

    candidates = []

    for line in lines[:5]:

        lower = line.lower()

        if any(
            word in lower
            for word in blacklist
        ):
            continue

        if len(line) > 40:
            continue

        digit_ratio = sum(
            c.isdigit()
            for c in line
        ) / max(len(line), 1)

        if digit_ratio > 0.3:
            continue

        candidates.append(line)

    if candidates:

        return min(
            candidates,
            key=len
        )

    return "Unknown Merchant"


# CONFIDENCE SCORING

def generate_confidence(
    merchant: str,
    amount: Optional[float],
    date: str,
    raw_text: str
) -> dict:

    confidence = {}

    confidence["merchant"] = (
        "high"
        if merchant != "Unknown Merchant"
        else "low"
    )

    confidence["amount"] = (
        "high"
        if amount is not None
        else "low"
    )

    confidence["date"] = (
        "high"
        if re.search(
            r'\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}',
            raw_text
        )
        else "low"
    )

    return confidence


# MAIN PARSER

def parse_receipt(raw_text: str) -> dict:

    merchant = extract_merchant(
        raw_text
    )

    amount = extract_amount(
        raw_text
    )

    date = extract_date(
        raw_text
    )

    category = classify_expense(
        merchant,
        raw_text
    )

    confidence = generate_confidence(
        merchant,
        amount,
        date,
        raw_text
    )

    return {

        "merchant": merchant,

        "amount": amount,

        "date": date,

        "category": category,

        "confidence": confidence,

        "raw_text": raw_text
    }
