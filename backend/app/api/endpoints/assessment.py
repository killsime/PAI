from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import AssessmentService

router = APIRouter()

class AssessmentRequest(BaseModel):
    depression: int
    anxiety: int
    stress: int
    user_id: int | None = None

@router.post("/submit")
async def submit_assessment(request: AssessmentRequest):
    try:
        result = AssessmentService.submit_assessment(
            request.depression, request.anxiety, request.stress, request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
