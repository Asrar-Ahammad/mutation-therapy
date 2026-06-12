import json
import os
from openai import AsyncOpenAI
from prompts.reasoning import SYNTHESIS_SYSTEM_PROMPT, build_synthesis_prompt

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def run_synthesis(therapy_rationale: str, skeptic_critique: str, skeptic_resistance: list) -> dict:
    user_prompt = build_synthesis_prompt(therapy_rationale, skeptic_critique, skeptic_resistance)
    
    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYNTHESIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    return json.loads(response.choices[0].message.content)
