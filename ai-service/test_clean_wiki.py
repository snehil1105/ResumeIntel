import urllib.request
import urllib.parse
import json
import re

COMMON_PERSONAL_NAMES = {
    "mohit", "rohit", "rahul", "amit", "sumit", "ankit", "priya", "pooja", "neha", "sneha", 
    "snehil", "anjali", "deepak", "vikram", "manish", "sachin", "suresh", "ramesh", "rajesh", 
    "sharma", "verma", "gupta", "singh", "kumar", "patel", "shukla", "tripathi", "mishra", 
    "joshi", "tiwari", "yadav", "choudhary", "bose", "das", "chatterjee", "banerjee", "nair", 
    "alex", "john", "david", "michael", "sarah", "emily", "james", "robert", "william", "mary"
}

ALIAS_MAP = {
    "lnt": "Larsen & Toubro",
    "l&t": "Larsen & Toubro",
    "lti": "LTIMindtree",
    "ltimindtree": "LTIMindtree",
    "ltts": "L&T Technology Services",
    "tcs": "Tata Consultancy Services",
    "infy": "Infosys",
    "hcl": "HCLTech",
    "wipro": "Wipro",
    "cts": "Cognizant",
    "fb": "Meta Platforms",
    "msft": "Microsoft",
    "amzn": "Amazon",
    "goog": "Google"
}

def is_personal_name_query(query: str) -> bool:
    cleaned = query.strip().lower()
    # Remove common corporate suffixes
    stripped = re.sub(r'\b(limited|ltd|pvt|private|inc|corp|corporation|technologies|solutions|services|systems|group)\b', '', cleaned).strip()
    words = stripped.split()
    if len(words) > 0 and all(w in COMMON_PERSONAL_NAMES for w in words):
        return True
    return False

def fetch_wiki_company(company_name: str):
    cleaned = company_name.strip()
    if is_personal_name_query(cleaned):
        return None

    canonical = ALIAS_MAP.get(cleaned.lower(), cleaned)
    
    # Try exact page summary first
    for candidate in [canonical, f"{canonical} (company)"]:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(candidate)}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ResumeIntel/1.0 (info@resumeintel.ai)"})
            with urllib.request.urlopen(req, timeout=4) as r:
                data = json.loads(r.read().decode())
                desc = data.get("description", "").lower()
                extract = data.get("extract", "")
                # Ensure it's not a person
                if any(p in desc for p in ["businessman", "actor", "singer", "player", "politician", "born", "cricketer"]):
                    continue
                if any(w in desc or w in extract[:120].lower() for w in ["company", "conglomerate", "corporation", "enterprise", "firm", "platform", "services", "technologies", "software"]):
                    return {
                        "name": data.get("title"),
                        "description": data.get("description"),
                        "extract": extract,
                        "url": data.get("content_urls", {}).get("desktop", {}).get("page", "")
                    }
        except Exception:
            pass

    # Search Wikipedia
    try:
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(canonical + ' company')}&format=json"
        req = urllib.request.Request(search_url, headers={"User-Agent": "ResumeIntel/1.0 (info@resumeintel.ai)"})
        with urllib.request.urlopen(req, timeout=4) as r:
            s_data = json.loads(r.read().decode())
            items = s_data.get("query", {}).get("search", [])
            for it in items[:3]:
                title = it.get("title", "")
                snippet = it.get("snippet", "").lower()
                if any(w in snippet for w in ["company", "corporation", "conglomerate", "software", "technologies", "enterprise"]):
                    sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
                    req2 = urllib.request.Request(sum_url, headers={"User-Agent": "ResumeIntel/1.0 (info@resumeintel.ai)"})
                    with urllib.request.urlopen(req2, timeout=4) as r2:
                        p_data = json.loads(r2.read().decode())
                        desc = p_data.get("description", "").lower()
                        extract = p_data.get("extract", "")
                        if any(p in desc for p in ["businessman", "actor", "singer", "player", "politician", "born", "cricketer"]):
                            continue
                        if any(w in desc or w in extract[:120].lower() for w in ["company", "conglomerate", "corporation", "enterprise", "firm", "platform", "services", "technologies", "software"]):
                            return {
                                "name": p_data.get("title"),
                                "description": p_data.get("description"),
                                "extract": extract,
                                "url": p_data.get("content_urls", {}).get("desktop", {}).get("page", "")
                            }
    except Exception as e:
        print("Error:", e)

    return None

test_cases = ["lnt", "L&T", "mohit limited", "mohit", "databricks", "zomato", "swiggy", "tcs", "fakecorp"]
for tc in test_cases:
    res = fetch_wiki_company(tc)
    if res:
        print(f"[{tc}] => VERIFIED COMPANY: {res['name']}")
        print(f"   Desc: {res['description']}")
        print(f"   Snippet: {res['extract'][:100]}...")
    else:
        print(f"[{tc}] => NOT A KNOWN COMPANY")
