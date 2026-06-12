import json
import asyncio
import httpx
from openai import AsyncOpenAI
from config import MODEL, OPENAI_API_KEY
from prompts.reasoning import SYSTEM_PROMPT, build_user_prompt

async def run_reasoning(
    gene: str, 
    mutation_type: str, 
    position: str, 
    gene_function: str, 
    diseases: list, 
    drugs: list
) -> dict:
    if not OPENAI_API_KEY:
        # Fallback for when API key is missing (e.g. initial dev without key)
        return {
            "mechanism": "API key missing, cannot run inference.",
            "pathway_affected": "Unknown",
            "effect_type": "Unknown",
            "consequence": "Unknown",
            "therapy_class": "Unknown",
            "drugs": [],
            "rationale": "Missing API key.",
            "confidence": "low"
        }
        
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    user_prompt = build_user_prompt(
        gene, mutation_type, position, gene_function, diseases, drugs
    )
    
    response = await client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}


async def fetch_single_drug_details(client: httpx.AsyncClient, drug: str) -> tuple:
    fda_data = {}
    try:
        clean_drug = drug.strip().upper()
        search_query = f'openfda.brand_name:"{clean_drug}" OR openfda.generic_name:"{clean_drug}" OR openfda.substance_name:"{clean_drug}"'
        url = "https://api.fda.gov/drug/label.json"
        res = await client.get(url, params={"search": search_query, "limit": 1})
        if res.status_code == 200:
            data = res.json()
            results = data.get("results", [])
            if results:
                fda_data = results[0]
    except Exception as e:
        print(f"openFDA fetch error for {drug}: {e}")
        
    fda_context = ""
    if fda_data:
        def get_text(field):
            val = fda_data.get(field, "")
            if isinstance(val, list):
                return " ".join(val)
            return str(val)
        
        fda_context = f"""
Source: US FDA Approved Drug Labeling for {drug}
Description/Class: {get_text('description')}
Mechanism of Action: {get_text('mechanism_of_action')}
Adverse Reactions: {get_text('adverse_reactions')}
Warnings and Cautions: {get_text('warnings_and_cautions')}
Dosage and Administration: {get_text('dosage_and_administration')}
Contraindications: {get_text('contraindications')}
Drug Interactions: {get_text('drug_interactions')}
Clinical Studies/Evidence: {get_text('clinical_studies')}
"""

    details = await _summarize_drug_details_with_llm(drug, fda_context)
    return drug, details


async def fetch_drug_details(drugs: list) -> dict:
    if not drugs:
        return {"drug_details": {}}
        
    async with httpx.AsyncClient() as client:
        tasks = [fetch_single_drug_details(client, drug) for drug in drugs]
        results = await asyncio.gather(*tasks)
        
        drug_details = {drug: details for drug, details in results if details}
        return {"drug_details": drug_details}


async def _summarize_drug_details_with_llm(drug: str, fda_context: str) -> dict:
    if not OPENAI_API_KEY:
        return {}
        
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """
You are a clinical pharmacologist.
Summarize drug clinical details into a clean, concise structured JSON format.
Keep each field description short and specific (1-2 sentences maximum).
Do NOT include any markdown formatting. Return ONLY valid JSON.
"""

    user_prompt = f"""
Drug: {drug}

{fda_context if fda_context else "Note: No FDA labeling data found. Use your own clinical knowledge base."}

Please output a JSON object with exactly these 8 fields:
1. class: Drug class (e.g., Small molecule EGFR tyrosine kinase inhibitor)
2. mechanism: Specific mechanism of action (1-2 sentences)
3. adverse_effects: List of 3-4 key common or severe adverse effects (keep them brief, e.g., ["Diarrhea", "Rash"])
4. cautions: Key clinical warnings or precautions (1-2 sentences)
5. dosage: Standard dosage and route for oncology or its primary indication (e.g., 80 mg orally once daily)
6. contraindications: Primary absolute or relative contraindications (1-2 sentences)
7. interactions: Key drug interactions, such as CYP3A4 inhibitors/inducers (1-2 sentences)
8. clinical_evidence: Key clinical evidence or trial results supporting its use (1-2 sentences)

JSON Schema to return:
{{
  "class": "",
  "mechanism": "",
  "adverse_effects": ["", "", ""],
  "cautions": "",
  "dosage": "",
  "contraindications": "",
  "interactions": "",
  "clinical_evidence": ""
}}
"""

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"LLM drug summarization error for {drug}: {e}")
        return {}


