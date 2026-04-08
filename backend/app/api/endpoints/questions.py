from fastapi import APIRouter, HTTPException
from app.services import PaperService

router = APIRouter()

@router.get("/random")
async def get_random_questions():
    try:
        questions = PaperService.get_random_questions()
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dass")
async def get_dass_questions():
    try:
        questions = PaperService.get_dass_questions()
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
