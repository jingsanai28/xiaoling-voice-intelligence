# 产品界面截图

本目录收录 Xiaoling Voice Intelligence 的脱敏产品截图。README 使用 Markdown 原图并由 GitHub 响应式缩放，不假设固定浏览器或显示器尺寸。

## 截图清单

| 文件名 | 页面/状态 | 截图重点 | 建议取景 |
| --- | --- | --- | --- |
| `01-workbench.png` | 客户声音工作台 | 真实事件、优先处理队列、Agent 分布与 VoiceBench 状态 | 核心分析 |
| `02-analysis-progress.png` | 新建分析进行中 | 分析计划、执行进度和结果延迟展示 | 核心分析 |
| `03-analysis-result-review.png` | 分析完成与复核 | 多轮对话、事件预览、证据和对话内人工复核 | 核心分析 |
| `04-task-center.png` | 任务中心 | 待处理、处理中、已完成和已归档任务 | 事件处置 |
| `05-event-detail.png` | 事件详情 | 核心信号、证据、Agent 链路和下一步行动 | 事件处置 |
| `06-human-review.png` | 人工复核队列 | 高风险事件与回到原对话复核入口 | 事件处置 |
| `07-knowledge-overview.png` | 知识概览 | 产品知识、SOP、合规规则和历史案例空间 | 知识与 RAG |
| `08-retrieval-test.png` | 检索测试 | 查询条件、命中文档、引用片段与相关性反馈 | 知识与 RAG |
| `09-knowledge-review.png` | 发布审核 | 知识生命周期、审核人与生效日期 | 知识与 RAG |
| `10-event-history.png` | 分析记录 | 事件搜索、状态筛选、历史匹配与知识引用 | 事件处置 |
| `11-permissions.png` | 权限管理 | 角色切换、资源范围、动作权限与安全原则 | 权限治理 |
| `12-evaluation-overview.png` | 评估概览 | 1000 条评测资产、五模型横评和迭代边界 | 评测迭代 |
| `13-voicebench-cases.png` | VoiceBench 案例 | 700/300 分区、中文案例、人工标注与单条测试 | 评测迭代 |
| `14-bad-cases.png` | Bad Case | 模型错误、预期差异和规则回归入口 | 评测迭代 |

## 安全检查

- [x] 14 张截图均能看清页面标题、关键数据和主要操作；
- [x] 截图内容使用演示数据，不包含 API Key、Cookie、真实客户姓名、电话或订单号；
- [x] 截图与公开仓库的产品、Agent、知识库和评测口径一致；
- [x] 分析详情覆盖“输入 -> Agent 链路 -> 证据 -> 风险 -> 人工复核”的关系。
