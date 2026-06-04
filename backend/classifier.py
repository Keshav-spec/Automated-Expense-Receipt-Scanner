
import re

from sympy import python



CATEGORY_KEYWORDS = {

    "Food & Dining": [
        "restaurant", "cafe", "pizza", "burger",
        "biryani", "hotel", "food", "kitchen",
        "bakery", "sweets", "dhaba", "canteen",
        "zomato", "swiggy", "dominos",
        "mcdonalds", "kfc", "subway",
        "chai", "tea", "coffee", "juice",
        "snacks", "tiffin"
    ],

    "Groceries": [
        "grocery", "supermarket", "mart",
        "reliance", "dmart", "bigbasket",
        "blinkit", "zepto", "vegetables",
        "fruits", "milk", "bread",
        "rice", "oil", "masala",
        "provision"
    ],

    "Transport": [
        "petrol", "diesel", "fuel",
        "pump", "auto", "rickshaw",
        "taxi", "uber", "ola",
        "bus", "train", "metro",
        "parking", "toll",
        "irctc", "redbus"
    ],

    "Healthcare": [
        "medical", "pharmacy",
        "chemist", "hospital",
        "clinic", "doctor",
        "medicine", "drug",
        "health", "diagnostic",
        "lab", "apollo",
        "medplus"
    ],

    "Shopping": [
        "mall", "fashion",
        "clothes", "shirt",
        "shoes", "footwear",
        "amazon", "flipkart",
        "myntra", "retail",
        "electronics", "mobile",
        "laptop", "accessories"
    ],

    "Utilities": [
        "electricity", "electric",
        "water", "gas",
        "internet", "wifi",
        "broadband", "airtel",
        "jio", "bsnl",
        "recharge", "bill",
        "telephone"
    ],

    "Education": [
        "book", "stationery",
        "pen", "notebook",
        "school", "college",
        "university", "tuition",
        "coaching", "course",
        "library"
    ],

    "Entertainment": [
        "cinema", "movie",
        "pvr", "inox",
        "game", "netflix",
        "spotify", "theatre",
        "concert", "event",
        "ticket"
    ]
}


def clean_text(text: str) -> str:
    """
    Normalize OCR text for matching.
    """

    text = text.lower()

    # Remove symbols
    text = re.sub(r'[^a-z0-9\s]', ' ', text)

    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


def classify_expense(
    merchant: str,
    raw_text: str
) -> str:
    """
    Classify receipt into category.
    """

    combined_text = clean_text(
        merchant + " " + raw_text
    )

    

    category_scores: dict[str, int] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():

        score = 0

        for keyword in keywords:

            if keyword in combined_text:

                if keyword in merchant.lower():
                    score += 3
                else:
                    score += 1

        if score > 0:
            category_scores[category] = score


    if category_scores:

        return max(category_scores.items(), key=lambda x: x[1])[0]

    return "Other"