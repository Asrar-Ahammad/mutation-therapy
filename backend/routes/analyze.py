from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from agents.orchestrator import run_analysis_chain
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_mutation(request: AnalyzeRequest):
    if not request.mutation:
        raise HTTPException(status_code=400, detail="Mutation string is required")
        
    try:
        result = await run_analysis_chain(request.mutation)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

