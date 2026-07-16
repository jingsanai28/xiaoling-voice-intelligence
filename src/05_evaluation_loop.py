"""评测与 Bad Case 回流的简化示意。"""

def evaluate(candidate, split):
    assert split in {"dev_iteration", "holdout_validation"}
    assert split != "holdout_validation" or not candidate["tuning_allowed"]

    result = run_xiaoling(candidate["raw_input_zh"])
    return {
        "routing": exact(result["task_type"], candidate["expected_task_type"]),
        "agent_selection": exact(result["selected_agents"], candidate["expected_agents"]),
        "risk": exact(result["risk_level"], candidate["expected_risk_level"]),
        "review": exact(result["needs_human_review"], candidate["expected_needs_human_review"]),
        "trace_complete": has_auditable_events(result),
    }


def close_bad_case(case, fix, regression):
    # 只有开发集允许修改；锁定验证集只用于最终回归。
    case["root_cause"] = classify(case)
    case["fix"] = fix
    case["regression"] = regression
    case["status"] = "fixed" if regression["passed"] else "needs_more_work"
