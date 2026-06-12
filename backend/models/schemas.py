from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union

class AnalyzeRequest(BaseModel):
    mutation: str

class StepData(BaseModel):
    step: Union[int, str]
    label: str
    data: Dict[str, Any]

class AnalyzeResponse(BaseModel):
    chain: List[StepData]
    summary: str
