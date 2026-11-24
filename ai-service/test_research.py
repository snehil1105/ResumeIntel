import urllib.request
import urllib.parse
import json
import re

def search_company_web(company_name: str):
    cleaned = company_name.strip()
    # Normalize common abbreviations
    alias_map = {
        "lnt": "Larsen & Toubro",
        "l&t": "Larsen & Toubro",
        "lti": "LTIMindtree",
        "ltimindtree": "LTIMindtree",
        "tcs": "Tata Consultancy Services",
        "hcl": "HCLTech",
        "fb": "Meta Platforms",
        "meta": "Meta Platforms",
        "msft": "Microsoft",
        "amzn": "Amazon",
        "goog": "Google",
        "infy": "Infosys",
        "wipro": "Wipro",
        "cts": "Cognizant"
    }
    canonical_name = alias_map.get(cleaned.lower(), cleaned)
    
    # 1. Search Wikipedia Summary API
    wiki_info = None
    try:
        # Search page title
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(canonical_name + ' company')}&format=json"
        req = urllib.request.Request(search_url, headers={"User-Agent": "ResumeIntel/1.0 (info@resumeintel.ai)"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            search_items = data.get("query", {}).get("search", [])
            for item in search_items[:3]:
                title = item.get("title", "")
                snippet = item.get("snippet", "").lower()
                # Must be a company or business
                if any(w in snippet for w in ["company", "corporation", "multinational", "conglomerate", "software", "technology", "consulting", "enterprise"]):
                    # Fetch summary
                    sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
                    req2 = urllib.request.Request(sum_url, headers={"User-Agent": "ResumeIntel/1.0 (info@resumeintel.ai)"})
                    with urllib.request.urlopen(req2, timeout=5) as r2:
                        page_data = json.loads(r2.read().decode())
                        desc = page_data.get("description", "").lower()
                        extract = page_data.get("extract", "")
                        # Verify this page describes a company/organization
                        if any(w in desc or w in extract[:150].lower() for w in ["company", "corporation", "conglomerate", "enterprise", "firm", "business", "software", "technology"]):
                            wiki_info = {
                                "official_name": page_data.get("title"),
                                "description": page_data.get("description", ""),
                                "extract": extract,
                                "url": page_data.get("content_urls", {}).get("desktop", {}).get("page", "")
                            }
                            break
    except Exception as e:
        print(f"Wiki search error for {company_name}: {e}")

    return {
        "query": company_name,
        "is_known": wiki_info is not None,
        "info": wiki_info
    }

for query in ["lnt", "L&T", "mohit limited", "mohit", "databricks", "zomato", "fakecorp", "asdkjhasd"]:
    res = search_company_web(query)
    print(f"Query '{query}': is_known={res['is_known']}")
    if res['info']:
        print(f"  Name: {res['info']['official_name']}")
        print(f"  Desc: {res['info']['description']}")
        print(f"  Extract: {res['info']['extract'][:120]}...")
