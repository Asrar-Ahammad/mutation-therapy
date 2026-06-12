import re

def classify_mutation(mutation_str: str) -> dict:
    # Basic regex to extract gene and mutation details
    # Example inputs: "BRCA1 c.5266dupC", "EGFR p.L858R", "TP53 p.R175H"
    
    parts = mutation_str.split(" ")
    if len(parts) != 2:
        return {
            "gene": mutation_str,
            "mutation_type": "unknown",
            "position": "unknown",
            "change": "unknown",
            "amino_acid_position": None
        }
        
    gene = parts[0]
    mutation_detail = parts[1]
    
    mutation_type = "unknown"
    position = "unknown"
    change = "unknown"
    amino_acid_position = None
    
    if "dup" in mutation_detail:
        mutation_type = "frameshift"
        match = re.search(r'(\d+)', mutation_detail)
        if match:
            position = match.group(1)
            # coding DNA position → approximate protein position
            amino_acid_position = int(position) // 3
        change = mutation_detail.split(position)[-1] if position != "unknown" else "unknown"
    elif "p." in mutation_detail:
        # e.g., p.L858R
        match = re.search(r'p\.([A-Za-z]+)(\d+)([A-Za-z]+)', mutation_detail)
        if match:
            mutation_type = "missense"
            position = match.group(2)
            change = f"{match.group(1)} to {match.group(3)}"
            amino_acid_position = int(position)
    elif "c." in mutation_detail:
        # coding DNA notation e.g. c.2573T>G
        match = re.search(r'c\.(\d+)', mutation_detail)
        if match:
            position = match.group(1)
            amino_acid_position = int(position) // 3
            
    return {
        "gene": gene,
        "mutation_type": mutation_type,
        "position": str(position),
        "change": change,
        "amino_acid_position": amino_acid_position
    }

