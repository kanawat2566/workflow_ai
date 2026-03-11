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


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TodoItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool = False
