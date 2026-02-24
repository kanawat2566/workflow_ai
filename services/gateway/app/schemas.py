from pydantic import BaseModel
from typing import Optional, Literal


class CommandRequest(BaseModel):
    userId: str
    request: str
    useCase: Optional[str] = None
    source: Optional[Literal["telegram", "web"]] = "web"


class CommandResponse(BaseModel):
    runId: str


class ApprovalRequest(BaseModel):
    comment: Optional[str] = None


class FeedbackRequest(BaseModel):
    rating: Literal["good", "bad"]
    notes: Optional[str] = None
