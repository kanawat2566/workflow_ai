from typing import Literal

from pydantic import BaseModel, Field


class CommandRequest(BaseModel):
    user_id: str = Field(alias="userId")
    request: str
    use_case: str | None = Field(default=None, alias="useCase")
    source: Literal["telegram", "web"] | None = "web"

    class Config:
        allow_population_by_field_name = True


class CommandResponse(BaseModel):
    run_id: str = Field(alias="runId")

    class Config:
        allow_population_by_field_name = True


class ApprovalRequest(BaseModel):
    comment: str | None = None


class FeedbackRequest(BaseModel):
    rating: Literal["good", "bad"]
    notes: str | None = None
