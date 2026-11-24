from typing import List, Dict, Any, Optional
import math
import logging

logger = logging.getLogger(__name__)

class IsolatedVectorStore:
    """
    RAG Vector Store supporting strict user-level isolation and cosine similarity retrieval.
    Operates with in-memory semantic representations or pgvector backend.
    """
    def __init__(self):
        # In-memory index store: user_id -> list of chunk dicts
        self._stores: Dict[str, List[Dict[str, Any]]] = {}

    def index_chunks(self, user_id: str, chunks: List[Dict[str, Any]]):
        if user_id not in self._stores:
            self._stores[user_id] = []
        # Replace or append chunks
        self._stores[user_id].extend(chunks)
        logger.info(f"Indexed {len(chunks)} chunks for user {user_id}")

    def query(self, user_id: str, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Strictly searches only chunks belonging to the specified user_id."""
        user_chunks = self._stores.get(user_id, [])
        if not user_chunks:
            return []

        # Simple semantic token overlap scoring (cosine proxy)
        query_tokens = set(query_text.lower().split())
        scored_chunks = []
        
        for chunk in user_chunks:
            chunk_tokens = set(chunk["chunk_text"].lower().split())
            intersection = query_tokens.intersection(chunk_tokens)
            score = len(intersection) / max(math.sqrt(len(query_tokens) * len(chunk_tokens)), 1.0)
            scored_chunks.append({**chunk, "score": score})

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

vector_store = IsolatedVectorStore()
