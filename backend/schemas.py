from pydantic import BaseModel
from typing import Optional


class ReceiptData(BaseModel):

    merchant: str

    amount: Optional[float]

    date: str

    category: str

    raw_text: str