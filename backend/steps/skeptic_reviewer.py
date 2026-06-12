import json
import os
from openai import AsyncOpenAI
from prompts.reasoning import SKEPTIC_SYSTEM_PROMPT, build_skeptic_prompt

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def run_skeptic_review(gene: str, mutation_type: str, mechanism: str, therapy_class: str, drugs: list) -> dict:
    user_prompt = build_skeptic_prompt(gene, mutation_type, mechanism, therapy_class, drugs)
    
    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SKEPTIC_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    return json.loads(response.choices[0].message.content)
