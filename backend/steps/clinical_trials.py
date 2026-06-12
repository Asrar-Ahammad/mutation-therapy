import urllib.request
import urllib.parse
import json
import logging
import asyncio

async def fetch_clinical_trials(disease: str, drug: str) -> dict:
    url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        "query.cond": disease,
        "query.intr": drug,
        "filter.overallStatus": "RECRUITING",
        "pageSize": "5",  # Top 5 trials
        "fields": "NCTId,BriefTitle,Phase,StudyFirstSubmitDate"
    }
    
    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }
    
    def fetch():
        req = urllib.request.Request(full_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10.0) as response:
            return json.loads(response.read().decode())
    
    try:
        data = await asyncio.to_thread(fetch)
        
        trials = []
        for study in data.get("studies", []):
            protocol = study.get("protocolSection", {})
            ident = protocol.get("identificationModule", {})
            design = protocol.get("designModule", {})
            
            nct_id = ident.get("nctId", "Unknown")
            title = ident.get("briefTitle", "Unknown Title")
            phases = design.get("phases", ["Unknown Phase"])
            
            trials.append({
                "nct_id": nct_id,
                "title": title,
                "phase": ", ".join(phases),
                "url": f"https://clinicaltrials.gov/study/{nct_id}"
            })
            
        return {"trials": trials, "query": {"disease": disease, "drug": drug}}
    except Exception as e:
        logging.error(f"Error fetching clinical trials: {e}")
        return {"trials": [], "query": {"disease": disease, "drug": drug}, "error": str(e)}
