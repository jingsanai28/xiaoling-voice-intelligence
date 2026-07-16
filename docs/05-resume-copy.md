# 05｜简历可直接使用的表达

## 项目名称

**小聆｜客户声音智能分析平台**

## 一句话版本

基于 LangGraph 构建客户声音智能分析平台，从高噪声的评论、客服、投诉和社媒反馈中提炼风险与业务信号，支持 Multi-Agent 路由、多轮对话、RAG 知识引用、Memory、人工复核和评测迭代。

## 简历项目描述

负责从 0 到 1 设计并实现“小聆”客户声音智能分析平台，面向品牌、客服、运营和产品团队解决反馈噪声高、风险判断不可复盘、责任团队不清和企业知识无法沉淀的问题。

- 使用 LangGraph 编排 `Input Gate -> Permission Check -> Supervisor -> 业务 Agent -> Knowledge Retrieval -> Memory Match -> Risk Calibration -> Human Review -> Final Report` 工作流；
- 将业务判断拆分为 Supervisor、品牌舆情、客服质检和运营反馈 Agent，将权限、上下文边界、风险校准、人工复核和 Trace 保留为可测试的系统节点；
- 设计事件级上下文和多轮对话机制，支持围绕同一事件追问证据、优先级、历史案例、责任团队，补充图片证据并添加任务；
- 设计 SQLite-backed RAG 知识库，覆盖知识空间、文档审核发布、权限过滤、检索测试、版本引用和反馈记录；
- 建立 700 条迭代集 + 300 条锁定验证集、Bad Case 队列和多 Agent 评测标准，对路由、风险、证据、复核、Memory、RAG、对话一致性和 Trace 进行回归；
- 通过多模型对比识别模型边界，将高风险判断沉淀为 Risk Calibration 与 Human Review Gate，避免模型直接执行认责、赔偿和对外回应。

## 面试口述版

我做的不是一个“输入一句话就返回一段文本”的聊天 Demo，而是一个围绕客户声音进行分析、解释、复核和沉淀的 Agent 产品。我的核心取舍是：不确定的业务判断交给 Agent，权限、风险边界、人工复核和审计交给系统节点；再用真实案例、Bad Case 和锁定验证集推动迭代。

## GitHub 简介

`LangGraph-based customer voice intelligence platform with multi-agent routing, context management, RAG knowledge base, human review, traceability, and evaluation-driven iteration.`

## 能力关键词

`LangGraph` `Multi-Agent` `Supervisor` `RAG` `Memory` `Human-in-the-loop` `Context Management` `Harness Engineering` `Bad Case` `Evaluation` `Tool Calling` `Risk Calibration` `Product Design`
