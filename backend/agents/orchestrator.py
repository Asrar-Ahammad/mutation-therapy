import asyncio
from steps.classifier import classify_mutation
from steps.gene_lookup import lookup_gene
from steps.reasoning_engine import run_reasoning, fetch_drug_details
from steps.evidence_fetcher import fetch_evidence
from steps.input_parser import parse_input
from steps.skeptic_reviewer import run_skeptic_review
from steps.tumor_board_synthesis import run_synthesis
from steps.clinical_trials import fetch_clinical_trials

async def run_analysis_chain(mutation_str: str) -> dict:
    chain = []
    
    # NEW: pre-process any input format
    parsed = await parse_input(mutation_str)
    
    # Step 1: Classifier receives normalized notation
    class_data = classify_mutation(parsed["notation"])
    
    # carry input_mode + extraction_confidence into chain response
    class_data["input_mode"] = parsed["input_mode"]
    class_data["extraction_confidence"] = parsed["extraction_confidence"]
    class_data["original_input"] = parsed["original_input"]
    
    chain.append({
        "step": 1,
        "label": "Mutation Classification",
        "data": class_data
    })
    
    # Step 2: Gene Lookup
    gene = class_data["gene"]
    gene_data = await lookup_gene(gene)
    chain.append({
        "step": 2,
        "label": "Gene Function & Pathway",
        "data": gene_data
    })
    
    # Step 3 & 4: Reasoning Engine (Mechanism + Therapy Mapping)
    reasoning_data = await run_reasoning(
        gene=gene,
        mutation_type=class_data["mutation_type"],
        position=class_data["position"],
        gene_function=gene_data["gene_function"],
        diseases=gene_data["diseases"],
        drugs=gene_data["drugs"]
    )
    
    # Split the result into Step 3 and Step 4 for the frontend
    mechanism_data = {
        "mechanism": reasoning_data.get("mechanism", ""),
        "pathway_affected": reasoning_data.get("pathway_affected", ""),
        "effect_type": reasoning_data.get("effect_type", ""),
        "consequence": reasoning_data.get("consequence", "")
    }
    chain.append({
        "step": 3,
        "label": "Mechanism",
        "data": mechanism_data
    })
    
    recommended_drugs = reasoning_data.get("drugs", [])
    top_drug = recommended_drugs[0] if recommended_drugs else ""
    
    # Extract top disease from gene lookup (fallback to Cancer)
    diseases = gene_data.get("diseases", [])
    top_disease = diseases[0] if diseases else "Cancer"

    # Kick off parallel tasks
    task_drug_details = fetch_drug_details(recommended_drugs)
    task_skeptic = run_skeptic_review(
        gene=gene,
        mutation_type=class_data["mutation_type"],
        mechanism=mechanism_data["mechanism"],
        therapy_class=reasoning_data.get("therapy_class", ""),
        drugs=recommended_drugs
    )
    task_evidence = fetch_evidence(gene, top_drug)
    task_trials = fetch_clinical_trials(disease=top_disease, drug=top_drug)

    # Concurrently gather independent results
    drug_details_res, skeptic_data, evidence_data, trials_data = await asyncio.gather(
        task_drug_details,
        task_skeptic,
        task_evidence,
        task_trials
    )

    # 1. Step 4: Therapy Recommendation
    therapy_data = {
        "therapy_class": reasoning_data.get("therapy_class", ""),
        "drugs": recommended_drugs,
        "drug_details": drug_details_res.get("drug_details", {}),
        "rationale": reasoning_data.get("rationale", ""),
        "confidence": reasoning_data.get("confidence", "")
    }
    chain.append({
        "step": 4,
        "label": "Therapy Recommendation",
        "data": therapy_data
    })

    # 2. Step 4b: Skeptic Review
    chain.append({
        "step": "4b",
        "label": "Skeptic Review",
        "data": skeptic_data
    })

    # 3. Step 4c: Synthesis Consensus
    synthesis_data = await run_synthesis(
        therapy_rationale=therapy_data["rationale"],
        skeptic_critique=skeptic_data["critique"],
        skeptic_resistance=skeptic_data["resistance_mechanisms"]
    )
    chain.append({
        "step": "4c",
        "label": "Tumor Board Consensus",
        "data": synthesis_data
    })

    # 4. Step 5: Supporting Evidence
    chain.append({
        "step": 5,
        "label": "Supporting Evidence",
        "data": evidence_data
    })

    # 5. Step 6: Live Clinical Trials
    chain.append({
        "step": 6,
        "label": "Live Clinical Trials",
        "data": trials_data
    })

    # Build summary using Synthesis data
    summary = synthesis_data.get("consensus_rationale", "Analysis complete.")
    summary += f" Final Recommendation: {synthesis_data.get('final_recommendation', top_drug)} (Confidence: {synthesis_data.get('final_confidence', 'low')})"

    return {
        "chain": chain,
        "summary": summary
    }
