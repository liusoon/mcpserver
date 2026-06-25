# MEMORY.md — mcpserver 项目上下文

> Evolver / Cursor hooks 会在会话启动时读取本文件（前 200 行）。保持简洁，只记录长期有效的项目事实。

## 项目概览

- **仓库**: `liusoon/mcpserver`
- **定位**: EvoMap GEP 协议参考与 MCP 集成工作区
- **主要用途**: 为 Cursor Agent 提供 EvoMap A2A 协议文档，并托管本地 GEP 资产脚手架

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `SKILL.md` | EvoMap A2A 协议完整参考（Layer 1–3、端点、Evolver 说明） |
| `assets/gep/genes.json` | 本地 Gene 池（4 genes：scaffold + starter + 足球彩票） |
| `assets/gep/capsules.json` | 本地 Capsule 存储（3 capsules） |
| `assets/gep/events.jsonl` | 进化事件追加日志 |
| `memory/` | Evolver 运行时记忆目录（`MEMORY.md` 除外均被 git 忽略） |
| `scripts/setup-hooks.sh` | 一键安装 Cursor Evolver hooks |
| `scripts/list-gep-assets.js` | 列出本地 Gene/Capsule 摘要（供匹配与审计） |
| `scripts/validate-gep-events.js` | 校验 `events.jsonl` 格式与质量门槛 |
| `scripts/append-gep-event.js` | 向 `events.jsonl` 追加 EvolutionEvent |

## EvoMap / Evolver 集成

- **Hub**: `https://evomap.ai`，协议 GEP-A2A v1.0.0
- **凭证位置**: `~/.evomap/node_id` + `~/.evomap/node_secret`（勿写入 git 或聊天）
- **Cursor hooks**: 通过 `evolver setup-hooks --platform=cursor` 写入 `~/.cursor/hooks.json` 与 `~/.cursor/hooks/`
  - `sessionStart` → 注入近期成功进化结果
  - `afterFileEdit` → 检测改进信号（错误、性能、能力缺口等）
  - `stop` → 记录 git diff 与任务结果到进化记忆图
- **Evolver 要求**: 必须在 git 仓库内运行；用于 rollback、blast radius、diff 捕获

## MCP 工具（evomap 服务器）

已配置的 MCP 工具包括：

- `gep_evolve` / `gep_recall` / `gep_record_outcome` — 进化与记忆
- `gep_publish_bundle` / `gep_publish_skill` / `gep_load_skill` — 资产发布与加载
- `gep_list_genes` / `gep_search_community` — 基因发现
- `gep_identity` / `gep_status` / `gep_audit` — 身份与审计
- `gep_export` / `gep_install_gene` / `gep_revoke` — 导出、安装、撤销

MCP 资源：`GEP_Protocol_Specification`、`Gene_Pool`、`Evolution_Capsules`。

## GEP 资产约定

- `asset_id` = `sha256:` + 对资产 JSON（不含 `asset_id` 字段、键排序）的哈希
- 发布 bundle 需包含 Gene + Capsule + EvolutionEvent 三件套
- 质量门槛：`outcome.score >= 0.7`，且 `blast_radius.files > 0`、`blast_radius.lines > 0`
- 发布前先用 `POST /a2a/validate` 做 dry run

## 开发约定

- 遵循现有文件风格；最小化 diff，不做无关重构
- `memory/` 下运行时文件（进化图、日志等）不入库；仅 `MEMORY.md` 可跟踪
- 对 EvoMap 的网络操作需用户明确授权（见 `SKILL.md` Layer 映射表）
- 回复用户时使用简体中文

## 当前状态（2026-06-25）

- GEP 资产池：4 genes、3 capsules、1+ events；`node scripts/list-gep-assets.js` 可查看摘要
- `gene_gep_events_scaffold` 已 solidify；`gene_gep_innovate_from_opportunity` 新增 `list-gep-assets` 工具（含 events 计数）
- Cursor Evolver hooks 已通过 `setup-hooks` 安装
- EvoMap 凭证已保存于 `~/.evomap/`（node_id: `node_4fa84af88322992f`；secret 仅存本地文件）
- Node 已绑定 EvoMap 账号（premium，1673 credits，creator Lv3）
- 已从 Hub 拉取免费 starter Genes：`gene_gep_innovate_from_opportunity`、`gene_gep_repair_from_errors`（含对应 Capsule）
- Heartbeat 后台循环运行中（`scripts/evomap-heartbeat-loop.sh`，每 5 分钟）
- 已拉取足球彩票分析 bundle（Gene `sha256:f01bb8...` + Capsule `sha256:25670375...`，消耗约 5.2 credits）
