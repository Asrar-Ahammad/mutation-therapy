import re
import json
import os
from openai import OpenAI
from config import MODEL_MINI  # always use mini here — simple extraction task

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# HGVS patterns:
# coding:   BRCA1 c.5266dupC  /  EGFR c.2573T>G
# protein:  BRCA1 p.Gln1756fs  /  TP53 p.R175H
# simple:   BRCA1 frameshift
HGVS_PATTERN = re.compile(
    r'^[A-Z][A-Z0-9]+\s+[cp]\.[A-Za-z0-9_>*+\-]+$'
)

PARTIAL_PATTERN = re.compile(
    r'^([A-Z][A-Z0-9]+)\s+(frameshift|missense|nonsense|deletion|insertion|'
    r'duplication|amplification|splice|truncat|activat|inhibit)',
    re.IGNORECASE
)


def is_hgvs(text: str) -> bool:
    return bool(HGVS_PATTERN.match(text.strip()))


def is_partial_notation(text: str) -> bool:
    return bool(PARTIAL_PATTERN.match(text.strip()))


async def parse_input(raw_input: str) -> dict:
    """
    Returns:
    {
      "gene": "BRCA1",
      "mutation_type": "frameshift",
      "notation": "BRCA1 c.5266dupC",   # reconstructed or original
      "input_mode": "hgvs" | "partial" | "natural_language",
      "original_input": raw_input,
      "extraction_confidence": "high" | "medium" | "low"
    }
    """
    text = raw_input.strip()

    # Case 1: already HGVS — pass through, no LLM needed
    if is_hgvs(text):
        parts = text.split()
        return {
            "gene": parts[0],
            "mutation_type": None,      # classifier.py will determine this
            "notation": text,
            "input_mode": "hgvs",
            "original_input": raw_input,
            "extraction_confidence": "high"
        }

    # Case 2: partial notation e.g. "BRCA1 frameshift"
    if is_partial_notation(text):
        match = PARTIAL_PATTERN.match(text)
        gene = match.group(1).upper()
        return {
            "gene": gene,
            "mutation_type": _normalize_type(match.group(2)),
            "notation": text,
            "input_mode": "partial",
            "original_input": raw_input,
            "extraction_confidence": "high"
        }

    # Case 3: plain English — LLM extraction
    return await _extract_with_llm(text)


def _normalize_type(raw: str) -> str:
    mapping = {
        "frameshift": "frameshift",
        "missense":   "missense",
        "nonsense":   "nonsense",
        "truncat":    "frameshift",
        "deletion":   "deletion",
        "insertion":  "insertion",
        "duplication":"duplication",
        "splice":     "splice_variant",
        "activat":    "activating",
        "amplification": "amplification",
    }
    for key, val in mapping.items():
        if key in raw.lower():
            return val
    return raw.lower()


async def _extract_with_llm(text: str) -> dict:
    system_prompt = """
You are a biomedical entity extractor.
Extract mutation information from plain English text.
Return ONLY valid JSON. No markdown. No explanation.

Rules:
- gene: official HGNC gene symbol in uppercase (e.g. BRCA1, TP53, EGFR)
- mutation_type: one of: frameshift | missense | nonsense | deletion |
  insertion | duplication | splice_variant | amplification | activating |
  loss_of_function | unknown
- notation: reconstruct best-guess HGVS if possible, else return gene + mutation_type
- confidence: "high" if gene clearly stated, "medium" if inferred, "low" if guessing

If gene cannot be determined, return gene: null.
"""

    user_prompt = f"""
Extract mutation information from this text:
"{text}"

Return JSON:
{{
  "gene": "",
  "mutation_type": "",
  "notation": "",
  "confidence": ""
}}
"""

    response = client.chat.completions.create(
        model=MODEL_MINI,  # cheap — simple NER task
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=0  # deterministic extraction
    )

    extracted = json.loads(response.choices[0].message.content)

    # guard: if LLM returns null gene, raise so orchestrator can return error
    if not extracted.get("gene"):
        raise ValueError(
            f"Could not identify a gene from input: '{text}'. "
            "Please specify a gene name (e.g. BRCA1, EGFR, TP53)."
        )

    return {
        "gene": extracted["gene"].upper(),
        "mutation_type": extracted.get("mutation_type", "unknown"),
        "notation": extracted.get("notation", f"{extracted['gene']} {extracted.get('mutation_type','')}").strip(),
        "input_mode": "natural_language",
        "original_input": text,
        "extraction_confidence": extracted.get("confidence", "medium")
    }
