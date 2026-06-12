import httpx
import xml.etree.ElementTree as ET

ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

async def fetch_evidence(gene: str, drug: str) -> dict:
    if not drug:
        return {"papers": []}
        
    term = f"{gene} {drug}"
    
    async with httpx.AsyncClient() as client:
        # 1. Search for PMIDs
        search_params = {
            "db": "pubmed",
            "term": term,
            "retmax": "3",
            "retmode": "json"
        }
        search_res = await client.get(ESEARCH_URL, params=search_params)
        search_data = search_res.json()
        
        pmids = search_data.get("esearchresult", {}).get("idlist", [])
        if not pmids:
            return {"papers": []}
            
        # 2. Fetch abstract details (titles)
        fetch_params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml"
        }
        fetch_res = await client.get(EFETCH_URL, params=fetch_params)
        
        # Parse XML
        root = ET.fromstring(fetch_res.text)
        
        papers = []
        for article in root.findall(".//PubmedArticle"):
            pmid_elem = article.find(".//PMID")
            title_elem = article.find(".//ArticleTitle")
            
            if pmid_elem is not None and title_elem is not None:
                pmid = pmid_elem.text
                papers.append({
                    "title": title_elem.text,
                    "pmid": pmid,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}"
                })
                
        return {"papers": papers}
