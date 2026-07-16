"""多轮对话、RAG 和历史 Memory 的上下文边界。"""

def build_follow_up_context(state: XiaolingState, question: str) -> dict:
    return {
        "current_event": {
            "facts": state["extracted_facts"],
            "evidence": state["evidence"],
            "risk": state["risk_level"],
        },
        "approved_knowledge": [
            citation for citation in state["knowledge_citations"]
            if citation["status"] == "published" and citation["authorized"]
        ],
        "historical_memory": state["historical_matches"],
        "follow_up_question": question,
    }


# 当前事件证据优先；知识必须已发布、有权限、有版本；历史案例用于参考，不直接复制结论。
