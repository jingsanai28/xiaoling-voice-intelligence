# Evaluation

本目录保存项目的首批评估样例。

这些样例不是为了证明规则版 Agent 很聪明，而是为了建立持续迭代闭环：

```text
测试集 -> 运行评估 -> 发现 Bad Case -> 调整路由/规则/Prompt/Memory -> 再评估
```

当前评估维度：

- 任务路由是否正确；
- 调用 Agent 是否正确；
- 风险等级是否符合预期；
- 是否触发人工复核；
- 最终报告是否包含关键解释信息；
- 是否匹配到预期历史事件；
- 是否生成结构化人工复核包；
- 是否留下足够的可回放事件。

评分口径见：

- `evals/METRICS.md`

运行：

```bash
.venv/bin/python -m evals.run_evals
```

真实案例诊断评估：

```bash
.venv/bin/python -m evals.run_real_case_evals
```

`run_real_case_evals` 使用 `evals/real_cases.json`，从 `data/real_case_backlog.json` 中挑选代表性公开案例进入诊断。它允许失败，因为目的不是证明系统已经完美，而是找出下一轮应该改路由、风险校准、人工复核还是报告解释。
