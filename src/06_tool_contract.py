"""工具层契约：工具返回来源和权限信息，Agent 不直接拼接数据库。"""

def retrieve_knowledge(query: str, user_id: str, agent_name: str) -> list[dict]:
    documents = repository.search(query)
    return [
        {
            "document_id": doc.id,
            "title": doc.title,
            "version": doc.version,
            "snippet": doc.snippet,
            "authorized": policy.can_read(user_id, agent_name, doc),
            "status": doc.status,
        }
        for doc in documents
        if doc.status == "published"
    ]


def match_historical_events(facts: list[dict]) -> list[dict]:
    # Memory 是参考证据，不替代当前事件的判断。
    return event_index.similar(facts, limit=3)
