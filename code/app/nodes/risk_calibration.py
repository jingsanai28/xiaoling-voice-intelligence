from __future__ import annotations

from typing import Any

from app.events import add_event
from app.state import RiskTriageState


RISK_ORDER = {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "unknown": 4}
VALID_RISK_LEVELS = set(RISK_ORDER)

# 下面这些关键词不是“最终生产规则”，而是 MVP 阶段可解释、可评估的风险边界。
# 它们来自评估集和多模型 Bad Case：模型容易把普通曝光判太高，也容易漏掉核心链路风险。
PUBLIC_PLATFORM_KEYWORDS = ("小红书", "微博", "曝光", "公开平台", "质疑", "误导宣传", "投诉", "差评", "传播", "扩散", "评论区", "截图")
HIGH_BRAND_KEYWORDS = ("媒体", "热搜", "群体", "维权", "安全", "违法", "大规模", "集中报道")
CUSTOMER_SERVICE_KEYWORDS = ("不归我们管", "无法处理", "你自己", "推责", "态度差", "截图", "售后", "客服", "投诉", "诱导")
COMPENSATION_KEYWORDS = ("赔偿", "承诺", "认责")
CORE_OPERATION_KEYWORDS = ("无法登录", "支付失败", "闪退", "数据丢失", "安全", "大面积")
OPERATION_EXPERIENCE_KEYWORDS = ("付款", "支付方式", "下载 App", "下载", "App", "不友好")
WEAK_FEEDBACK_KEYWORDS = ("不太喜欢", "希望", "换主题", "颜色", "建议")
FEEDBACK_VOLUME_KEYWORDS = ("很多", "高频", "大量", "多位", "评论里")


def risk_calibration(state: RiskTriageState) -> RiskTriageState:
    """在人工复核前校准风险等级。

    业务 Agent 或 LLM 可以提出风险等级，但不能直接决定最终升级边界。
    这个系统节点负责把几类稳定产品规则收回来：
    - 普通曝光/投诉/赔偿承诺不自动变成 P0/P1；
    - 媒体、热搜、群体维权、安全等高传播信号统一校准为 P1；
    - 支付失败、闪退、无法登录等核心链路问题统一校准为 P1；
    - 单条偏好反馈保持 P3 和低置信度，提醒补充样本。
    """
    text = state.get("raw_input", "")
    selected_agents = set(state.get("selected_agents", []))
    current_level = normalize_risk_level(state.get("risk_level", "unknown"))
    current_confidence = float(state.get("confidence", 0.0) or 0.0)
    changes: list[dict[str, Any]] = []

    has_public_signal = has_any(text, PUBLIC_PLATFORM_KEYWORDS)
    has_high_brand_signal = has_any(text, HIGH_BRAND_KEYWORDS)
    has_customer_signal = has_any(text, CUSTOMER_SERVICE_KEYWORDS)
    has_compensation_signal = has_any(text, COMPENSATION_KEYWORDS)
    has_core_operation_signal = has_any(text, CORE_OPERATION_KEYWORDS)
    has_operation_experience_signal = has_any(text, OPERATION_EXPERIENCE_KEYWORDS)
    has_feedback_volume_signal = has_any(text, FEEDBACK_VOLUME_KEYWORDS)
    is_weak_operation_signal = (
        "operation_feedback" in selected_agents
        and has_any(text, WEAK_FEEDBACK_KEYWORDS)
        and not has_core_operation_signal
        and not has_feedback_volume_signal
        and not has_public_signal
        and not has_customer_signal
    )

    calibrated_level = current_level
    calibrated_confidence = current_confidence

    # 混合高风险：公开传播 + 客服冲突 + 核心产品问题，优先级高于单一场景。
    if has_public_signal and has_customer_signal and has_core_operation_signal:
        calibrated_level = set_exact_level(
            calibrated_level,
            "P1",
            "公开传播、客服冲突与核心链路问题同时出现，系统校准为 P1。",
            changes,
        )
        calibrated_confidence = max(calibrated_confidence, 0.76)
    # 核心链路问题直接影响业务转化或基本使用，至少 P1。
    elif has_core_operation_signal:
        calibrated_level = set_exact_level(
            calibrated_level,
            "P1",
            "涉及支付、登录、闪退或数据丢失等核心链路问题，系统校准为 P1。",
            changes,
        )
        calibrated_confidence = max(calibrated_confidence, 0.76)
    # 高传播品牌风险校准为 P1；没有真实重大事故证据时，不让模型自由推到 P0。
    elif has_high_brand_signal:
        calibrated_level = set_exact_level(
            calibrated_level,
            "P1",
            "涉及媒体、热搜、群体维权、安全或违法等高传播风险信号，系统校准为 P1。",
            changes,
        )
        calibrated_confidence = max(calibrated_confidence, 0.76)
    # 单条偏好反馈不是紧急问题，但因为证据少，保持低置信度让 Human Review/报告提示补样本。
    elif is_weak_operation_signal:
        calibrated_level = set_exact_level(
            calibrated_level,
            "P3",
            "单条偏好类反馈缺少规模和核心链路影响，系统校准为 P3。",
            changes,
        )
        calibrated_confidence = min(max(calibrated_confidence, 0.52), 0.55)
    # 普通曝光、客服冲突、赔偿承诺统一收敛到 P2。
    # 是否复核不在这里决定，而是交给后面的 Human Review Gate。
    elif has_public_signal or has_customer_signal or has_compensation_signal or has_operation_experience_signal:
        if risk_rank(calibrated_level) < risk_rank("P2"):
            calibrated_level = set_exact_level(
                calibrated_level,
                "P2",
                "普通公开曝光、客服冲突、服务体验问题或赔偿承诺不自动等同 P0/P1，系统校准为 P2；是否复核交由 Human Review Gate 判断。",
                changes,
            )
            calibrated_confidence = min(max(calibrated_confidence, 0.66), 0.72)
        elif calibrated_level in {"unknown", "P3"}:
            calibrated_level = set_exact_level(
                calibrated_level,
                "P2",
                "发现公开曝光、客服冲突、服务体验问题或赔偿承诺信号，系统补齐风险等级为 P2。",
                changes,
            )
            calibrated_confidence = max(calibrated_confidence, 0.66)

    state["risk_level"] = calibrated_level
    state["confidence"] = calibrated_confidence
    if changes:
        state.setdefault("risk_reasons", []).extend(str(change["reason"]) for change in changes)
    state["current_node"] = "risk_calibration"
    add_event(
        state,
        "risk_calibration",
        "calibrated" if changes else "no_change",
        "已完成风险等级系统校准。",
        {
            "changes": changes,
            "input_risk_level": current_level,
            "output_risk_level": calibrated_level,
            "input_confidence": current_confidence,
            "output_confidence": calibrated_confidence,
        },
    )
    return state


def has_any(text: str, keywords: tuple[str, ...]) -> bool:
    return any(keyword in text for keyword in keywords)


def normalize_risk_level(level: str) -> str:
    return level if level in VALID_RISK_LEVELS else "unknown"


def risk_rank(level: str) -> int:
    """风险排序数字越小，风险越高：P0 < P1 < P2 < P3 < unknown。"""
    return RISK_ORDER.get(level, RISK_ORDER["unknown"])


def set_exact_level(current_level: str, target_level: str, reason: str, changes: list[dict[str, Any]]) -> str:
    """直接设置目标风险等级，并记录校准原因，方便 trace 回放。"""
    if current_level != target_level:
        changes.append({"from": current_level, "to": target_level, "reason": reason})
    return target_level
