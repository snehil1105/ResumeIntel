from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
import logging
from datetime import datetime
import urllib.parse
from app.core.config import settings
from app.models.company import ResearchSource, SourceType, ConfidenceLevel

logger = logging.getLogger(__name__)

class BaseSearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Executes search and returns structured search results with title, url, and snippet."""
        pass

class TavilySearchProvider(BaseSearchProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.tavily.com/search"

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    self.endpoint,
                    json={
                        "api_key": self.api_key,
                        "query": query,
                        "search_depth": "advanced",
                        "max_results": max_results,
                        "include_answer": True
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    for item in data.get("results", []):
                        results.append({
                            "title": item.get("title", "Public Web Document"),
                            "url": item.get("url", ""),
                            "snippet": item.get("content", ""),
                            "published_date": item.get("published_date")
                        })
                    return results
        except Exception as e:
            logger.warning(f"Tavily search failed: {e}")
        return []

class DuckDuckGoSearchProvider(BaseSearchProvider):
    """
    Public web search using DuckDuckGo Instant Answers API.
    Verifies if an entity is an actual recognized company or corporate body.
    """
    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        results = []
        try:
            encoded = urllib.parse.quote(query)
            url = f"https://api.duckduckgo.com/?q={encoded}&format=json&no_html=1"
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                if resp.status_code == 200:
                    data = resp.json()
                    abstract = data.get("AbstractText", "")
                    heading = data.get("Heading", "")
                    entity = data.get("Entity", "").lower()
                    doc_type = data.get("Type", "")

                    # Check if DuckDuckGo confirms entity is a company / business
                    is_company_entity = (
                        entity == "company" or 
                        any(w in abstract.lower() for w in ["company", "corporation", "inc.", "ltd", "technologies", "headquartered", "provider of", "multinational"])
                    )

                    if is_company_entity and data.get("AbstractURL"):
                        results.append({
                            "title": heading or query,
                            "url": data.get("AbstractURL"),
                            "snippet": abstract,
                            "published_date": "2024-2026",
                            "is_company": True
                        })

                    for topic in data.get("RelatedTopics", [])[:max_results]:
                        if isinstance(topic, dict) and "Text" in topic and "FirstURL" in topic:
                            txt = topic.get("Text", "")
                            if any(w in txt.lower() for w in ["company", "software", "tech", "cloud", "services", "corporation"]):
                                results.append({
                                    "title": txt[:70] + "...",
                                    "url": topic.get("FirstURL"),
                                    "snippet": txt,
                                    "published_date": None,
                                    "is_company": True
                                })
        except Exception as e:
            logger.warning(f"DuckDuckGo search error for '{query}': {e}")
        return results

class CuratedCompanyKnowledgebaseProvider(BaseSearchProvider):
    """
    Authoritative public research repository for verified tech companies,
    engineering blogs, and official career pages.
    """
    KNOWLEDGE_BASE = {
        "google": {
            "business_model": "Multinational technology conglomerate focused on search, cloud computing (GCP), software, hardware, and artificial intelligence.",
            "engineering_culture": "Emphasis on large-scale distributed systems, code readability, high test coverage, blameless post-mortems, and design docs.",
            "hiring_values": "General cognitive ability, role-related knowledge, leadership, and 'Googleyness' (intellectual humility, collaboration, doing the right thing).",
            "tech_stack": ["Java", "C++", "Python", "Go", "Kubernetes", "Borg", "Spanner", "TensorFlow", "gRPC", "Bazel"],
            "sources": [
                {
                    "title": "Google Engineering Practices Documentation",
                    "url": "https://google.github.io/eng-practices/",
                    "source_type": SourceType.OFFICIAL_DOCS,
                    "finding": "Google mandates rigorous code review processes, maintainability over cleverness, and comprehensive unit tests.",
                    "is_official": True
                },
                {
                    "title": "Google Research & Engineering Blog",
                    "url": "https://research.google/blog/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Heavy utilization of distributed systems, high-performance C++, Java microservices, and specialized AI infrastructure.",
                    "is_official": True
                },
                {
                    "title": "Google Careers: Hiring Process and Guides",
                    "url": "https://careers.google.com/how-we-hire/",
                    "source_type": SourceType.OFFICIAL_CAREERS,
                    "finding": "Evaluation centers on data structures, algorithmic efficiency, system design scalability, and clear structured communication.",
                    "is_official": True
                }
            ]
        },
        "microsoft": {
            "business_model": "Global provider of enterprise cloud services (Azure), productivity software (Office 365), developer tools (GitHub, VS Code), and AI systems.",
            "engineering_culture": "Growth mindset, continuous learning, customer empathy, open source adoption, and robust enterprise security standards.",
            "hiring_values": "Collaboration, learning agility, technical depth, problem-solving under ambiguity, and cultural alignment with inclusion.",
            "tech_stack": ["C#", ".NET Core", "Java", "TypeScript", "Python", "Azure", "Cosmos DB", "Kubernetes", "SQL Server"],
            "sources": [
                {
                    "title": "Microsoft Engineering at Scale Blog",
                    "url": "https://devblogs.microsoft.com/engineering-at-scale/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Extensive use of Azure microservices, resilient event streaming, and enterprise multi-region redundancy.",
                    "is_official": True
                },
                {
                    "title": "Microsoft Careers Portal",
                    "url": "https://careers.microsoft.com/",
                    "source_type": SourceType.OFFICIAL_CAREERS,
                    "finding": "Values candidates with solid object-oriented fundamentals, cloud architectural intuition, and team collaboration skills.",
                    "is_official": True
                }
            ]
        },
        "amazon": {
            "business_model": "E-commerce, cloud computing infrastructure (AWS), digital streaming, and logistics automation.",
            "engineering_culture": "Two-pizza teams, customer obsession, operational excellence, high ownership, and deep metrics-driven architecture.",
            "hiring_values": "Amazon Leadership Principles: Customer Obsession, Ownership, Bias for Action, Dive Deep, and Delivering Results.",
            "tech_stack": ["Java", "AWS (Lambda, DynamoDB, S3, ECS)", "Python", "Go", "Docker", "Microservices"],
            "sources": [
                {
                    "title": "Amazon Builder's Library - Architectural Patterns",
                    "url": "https://aws.amazon.com/builders-library/",
                    "source_type": SourceType.OFFICIAL_DOCS,
                    "finding": "Decomposition into autonomous microservices with decoupled datastores and strict SLA monitoring.",
                    "is_official": True
                },
                {
                    "title": "Amazon Jobs - Leadership Principles in Engineering",
                    "url": "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
                    "source_type": SourceType.OFFICIAL_CAREERS,
                    "finding": "Interviews and resume evaluations specifically look for demonstrated ownership, measurable impact, and STAR format examples.",
                    "is_official": True
                }
            ]
        },
        "meta": {
            "business_model": "Social technology platforms (Facebook, Instagram, WhatsApp), VR/AR headsets, and open-source AI models (Llama).",
            "engineering_culture": "Move fast, focus on long-term impact, continuous integration with live production canary testing.",
            "hiring_values": "Be bold, build awesome things, open communication, and high-impact execution.",
            "tech_stack": ["Python", "PyTorch", "C++", "Hack", "React", "GraphQL", "RocksDB"],
            "sources": [
                {
                    "title": "Meta Engineering Tech Blog",
                    "url": "https://engineering.fb.com/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Large-scale distributed infrastructure, automated deployment pipelines, and AI recommendation systems.",
                    "is_official": True
                },
                {
                    "title": "Meta Careers - Engineering Culture",
                    "url": "https://www.metacareers.com/",
                    "source_type": SourceType.OFFICIAL_CAREERS,
                    "finding": "Interviews test algorithmic speed, product architectural intuition, and ownership under ambiguity.",
                    "is_official": True
                }
            ]
        },
        "apple": {
            "business_model": "Consumer electronics hardware (iPhone, Mac, iPad), software platforms (iOS, macOS), and digital subscription services.",
            "engineering_culture": "Perfectionism, functional organizational alignment, craftsmanship, deep hardware-software co-design.",
            "hiring_values": "Attention to detail, user privacy, aesthetic polish, and uncompromised technical excellence.",
            "tech_stack": ["Swift", "Objective-C", "C++", "Python", "Java", "Kubernetes"],
            "sources": [
                {
                    "title": "Apple Machine Learning Research",
                    "url": "https://machinelearning.apple.com/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "On-device intelligence, privacy-preserving machine learning, and high-efficiency systems code.",
                    "is_official": True
                }
            ]
        },
        "netflix": {
            "business_model": "Global entertainment streaming platform, digital content production studio, and gaming ecosystem.",
            "engineering_culture": "Freedom and Responsibility, high talent density, Chaos Engineering, context not control.",
            "hiring_values": "Selflessness, high performance, candor, curiosity, and courage.",
            "tech_stack": ["Java", "Spring Cloud", "Kafka", "AWS", "Node.js", "Spinnaker"],
            "sources": [
                {
                    "title": "Netflix TechBlog",
                    "url": "https://netflixtechblog.com/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Resilient cloud microservices, chaos injection testing, and high-throughput real-time video delivery.",
                    "is_official": True
                }
            ]
        },
        "stripe": {
            "business_model": "Global financial infrastructure and developer payment APIs for internet businesses.",
            "engineering_culture": "API craftsmanship, backward compatibility, idempotency, automated integration testing, and developer empathy.",
            "hiring_values": "Users first, rigor, intellectual honesty, and high-velocity shipping.",
            "tech_stack": ["Ruby / Sorbet", "Java", "Go", "Kafka", "PostgreSQL", "AWS"],
            "sources": [
                {
                    "title": "Stripe Engineering Blog",
                    "url": "https://stripe.com/blog/engineering",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Strict transactional consistency, multi-region database replication, and zero-downtime database migrations.",
                    "is_official": True
                }
            ]
        },
        "uber": {
            "business_model": "Global mobility platform, ride-hailing, food delivery (Uber Eats), and freight logistics.",
            "engineering_culture": "Real-time dispatch optimization, geospatial indexing (H3), microservice resilience, and high concurrency.",
            "hiring_values": "Customer obsession, building globally with local relevance, and relentless technical execution.",
            "tech_stack": ["Go", "Java", "Python", "Kafka", "H3", "Apache Pinot", "MySQL"],
            "sources": [
                {
                    "title": "Uber Engineering Publications",
                    "url": "https://www.uber.com/blog/engineering/",
                    "source_type": SourceType.ENGINEERING_BLOG,
                    "finding": "Low-latency distributed dispatching, event-driven streaming, and large-scale geospatial compute.",
                    "is_official": True
                }
            ]
        }
    }

    def __init__(self):
        self.ddg = DuckDuckGoSearchProvider()

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        for company_key, data in self.KNOWLEDGE_BASE.items():
            if company_key in query_lower:
                results = []
                for s in data["sources"]:
                    results.append({
                        "title": s["title"],
                        "url": s["url"],
                        "snippet": s["finding"],
                        "published_date": "2024-2026",
                        "is_company": True
                    })
                return results

        # Try live DuckDuckGo query to verify whether entity is a real company
        ddg_results = await self.ddg.search(query, max_results=max_results)
        if ddg_results:
            return ddg_results

        # Do NOT invent fictitious company entries for unknown entities!
        return []

def get_search_provider() -> BaseSearchProvider:
    if settings.TAVILY_API_KEY:
        logger.info("Using Tavily Search Provider")
        return TavilySearchProvider(settings.TAVILY_API_KEY)
    else:
        logger.info("Using Curated Knowledgebase + DuckDuckGo Provider")
        return CuratedCompanyKnowledgebaseProvider()
