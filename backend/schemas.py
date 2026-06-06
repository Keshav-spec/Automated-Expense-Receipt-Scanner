from pydantic import BaseModel
from typing import Optional


class GoogleAuthRequest(BaseModel):

    id_token: str


class ReceiptData(BaseModel):

    merchant: str

    amount: Optional[float]

    date: str

    category: str

    raw_text: str