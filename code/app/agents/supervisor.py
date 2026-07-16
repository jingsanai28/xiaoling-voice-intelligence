from __future__ import annotations

from app.events import add_event
from app.llm_apply import apply_supervisor_output
from app.llm_runtime import maybe_get_llm_output
from app.state import RiskTriageState, TaskType


BRAND_KEYWORDS = (
    "小红书",
    "微博",
    "热搜",
    "舆情",
    "媒体",
    "扩散",
    "曝光",
    "公开平台",
    "评论区",
    "品牌",
    "公关",
    "投诉平台",
)
CUSTOMER_SERVICE_KEYWORDS = (
    "客服",
    "话术",
    "回复",
    "售后",
    "承诺",
    "推责",
    "态度",
    "赔偿",
    "工单",
    "投诉",
    # Banking77 的中文样本常直接描述卡片配送问题，不一定会出现“客服”二字。
    "卡片配送",
    "配送状态",
    "追踪我的卡",
    "追踪我卡",
    "追踪寄给我的卡",
    "卡的配送",
    "卡还没",
    "卡片还没",
    "等我的卡",
    "等我的新卡",
    "收到卡",
    "新卡还没",
    "订卡",
    "寄出我的卡",
)
OPERATION_KEYWORDS = (
    "bug",
    "卡顿",
    "闪退",
    "无法登录",
    "支付失败",
    "付款",
    "支付方式",
    "下载 App",
    "下载",
    "App",
    "不友好",
    "需求",
    "建议",
    "高频",
    "反馈",
    "体验",
)
DATA_SECURITY_OPERATION_KEYWORDS = ("信息泄露", "账号密码", "个人资料", "数据安全", "网站")


def supervisor_agent(state: RiskTriageState) -> RiskTriageState:
    """判断这条输入应该交给哪些业务 Agent。

    Supervisor 只做“分诊/路由”，不直接生成最终结论。
    如果启用 LLM，就先尝试 LLM 路由；失败时再使用关键词规则版 fallback。
    """
    llm_output = maybe_get_llm_output(state, "supervisor")
    if llm_output:
        state = apply_supervisor_output(state, llm_output)
        add_event(state, "supervisor", "routed", "Supervisor 已完成 LLM 路由。", {"task_type": state["task_type"], "selected_agents": state["selected_agents"]})
        return state
    if state.get("llm_enabled") and state.get("llm_failure_policy") == "fail":
        return state
    text = state.get("raw_input", "").lower()
    selected_agents: list[str] = []

    # 规则版 MVP：关键词命中哪个领域，就选择对应 Agent。
    # 真实生产中可以把这里升级为更复杂的分类器或更短的路由 Prompt。
    if any(keyword in text for keyword in BRAND_KEYWORDS):
        selected_agents.append("brand_risk")
    if any(keyword in text for keyword in CUSTOMER_SERVICE_KEYWORDS) or is_card_delivery_signal(text):
        selected_agents.append("customer_service_qa")
    if any(keyword in text for keyword in OPERATION_KEYWORDS) or is_data_security_operation_signal(text):
        selected_agents.append("operation_feedback")

    if not selected_agents:
        # 没有明显品牌/客服信号时，默认进入运营反馈。
        # 因为大多数模糊用户声音至少可以作为产品/体验反馈沉淀。
        selected_agents.append("operation_feedback")

    task_type = infer_task_type(selected_agents)
    state["task_type"] = task_type
    state["selected_agents"] = selected_agents
    state["current_node"] = "supervisor"

    add_event(
        state,
        "supervisor",
        "routed",
        "Supervisor 已完成任务路由。",
        {"task_type": task_type, "selected_agents": selected_agents},
    )
    return state


def is_data_security_operation_signal(text: str) -> bool:
    """数据安全类反馈既是品牌风险，也是产品/运营安全问题。"""
    return "安全" in text and any(keyword in text for keyword in DATA_SECURITY_OPERATION_KEYWORDS)


def is_card_delivery_signal(text: str) -> bool:
    """识别中文“卡片配送”语义，避免依赖某一种固定翻译。"""
    delivery_terms = ("到", "收到", "寄", "配送", "追踪", "包裹", "等", "哪里", "应用", "关联", "显示")
    return "卡" in text and any(term in text for term in delivery_terms)


def infer_task_type(selected_agents: list[str]) -> TaskType:
    """把 Agent 组合翻译成主任务类型。

    真实案例显示：客服投诉常常需要运营协作，但主任务仍可能是客服质检。
    只有品牌、客服、运营等多个主场景同时成立时，才标为 mixed。
    """
    if len(selected_agents) == 1:
        return selected_agents[0]  # type: ignore[return-value]
    if selected_agents == ["customer_service_qa", "operation_feedback"]:
        return "customer_service_qa"
    return "mixed"
