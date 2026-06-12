import httpx
import asyncio

OPEN_TARGETS_URL = "https://api.platform.opentargets.org/api/v4/graphql"

def trim_open_targets(raw: dict, mygene_summary: str = "", uniprot_id: str = "", map_location: str = "", genomic_pos: dict = None) -> dict:
    target = raw.get("data", {}).get("target", {})
    if not target:
        return {
            "gene_function": mygene_summary,
            "diseases": [],
            "drugs": [],
            "uniprot_id": uniprot_id,
            "map_location": map_location,
            "genomic_pos": genomic_pos or {}
        }
        
    return {
        "gene_function": mygene_summary if mygene_summary else target.get("approvedName", ""),
        "uniprot_id": uniprot_id,
        "map_location": map_location,
        "genomic_pos": genomic_pos or {},
        "diseases": [
            r["disease"]["name"]
            for r in target.get("associatedDiseases", {}).get("rows", [])[:5]
        ],
        "drugs": [
            {
                "name": r["drug"]["name"],
                "mechanism": r.get("mechanismOfAction", "")
            }
            for r in target.get("knownDrugs", {}).get("rows", [])[:8]
        ]
    }

async def lookup_gene(gene: str) -> dict:
    search_query = """
    query search($queryString: String!) {
      search(queryString: $queryString, entityNames: ["target"]) {
        hits {
          id
          name
        }
      }
    }
    """
    
    async with httpx.AsyncClient() as client:
        # Run Open Targets search and MyGene query in parallel
        task_search = client.post(
            OPEN_TARGETS_URL, 
            json={"query": search_query, "variables": {"queryString": gene}}
        )
        mygene_url = f"https://mygene.info/v3/query?q={gene}&fields=summary,uniprot,map_location,genomic_pos_hg19,genomic_pos&species=human"
        task_mygene = client.get(mygene_url)
        
        search_res, mygene_res = await asyncio.gather(task_search, task_mygene)
        
        search_data = search_res.json()
        hits = search_data.get("data", {}).get("search", {}).get("hits", [])
        
        target_data = {}
        if hits:
            ensembl_id = hits[0]["id"]
            target_query = """
            query targetData($ensemblId: String!) {
              target(ensemblId: $ensemblId) {
                approvedName
                associatedDiseases {
                  rows { disease { name } }
                }
                knownDrugs {
                  rows {
                    drug { name }
                    mechanismOfAction
                  }
                }
              }
            }
            """
            target_res = await client.post(
                OPEN_TARGETS_URL,
                json={"query": target_query, "variables": {"ensemblId": ensembl_id}}
            )
            target_data = target_res.json()
            
        mygene_summary = ""
        uniprot_id = ""
        map_location = ""
        genomic_pos = {}
        try:
            mygene_data = mygene_res.json()
            if mygene_data.get("hits") and len(mygene_data["hits"]) > 0:
                hit = mygene_data["hits"][0]
                mygene_summary = hit.get("summary", "")
                map_location = hit.get("map_location", "")
                
                gpos = hit.get("genomic_pos_hg19", hit.get("genomic_pos", {}))
                if isinstance(gpos, list) and len(gpos) > 0:
                    gpos = gpos[0]
                if isinstance(gpos, dict):
                    genomic_pos = {
                        "chr": gpos.get("chr", ""),
                        "start": gpos.get("start"),
                        "end": gpos.get("end"),
                        "strand": gpos.get("strand")
                    }
                
                uniprot = hit.get("uniprot", {})
                if isinstance(uniprot, dict):
                    swiss_prot = uniprot.get("Swiss-Prot")
                    if isinstance(swiss_prot, str):
                        uniprot_id = swiss_prot
                    elif isinstance(swiss_prot, list) and len(swiss_prot) > 0:
                        uniprot_id = swiss_prot[0]
        except Exception as e:
            pass
            
        return trim_open_targets(target_data, mygene_summary, uniprot_id, map_location, genomic_pos)
