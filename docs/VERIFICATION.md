# 接入验证

2026-11-02；仅记录实际执行证据。客户端配置适配与运行实测分开记录。

| 对象 | 配置依据 | 当前实测范围 |
| --- | --- | --- |
| Streamable HTTP | MCP 2025-11-25 | 隔离HTTP测试通过；Mac mini上使用Hermes的MCP SDK，经公网OAuth凭据完成initialize、9个tools、resources及一次真实职业工作，积分0 |
| OAuth / PKCE | MCP 授权规范、RFC 8414 / 9728 / 7591 | 隔离SQLite/PostgreSQL校验通过；公网授权码兑换通过，撤销后返回401；原钱包和既有连接不变 |
| npx | GitHub v1.0.1 版本包 | Windows GitHub v1.0.0下载与启动通过；Windows同源v1.0.1包启动通过；Mac新缓存下载同源v1.0.1，经Hermes MCP SDK完成stdio握手、9个工具和1个受限职业读取 |
| Hermes | mcp_servers 配置 | 旧 Python MCP 与直接主模型路径此前已实测；新Node连接器在Mac的Hermes MCP SDK验证通过；本轮未改动用户原Hermes全局配置 |
| DeepSeek Harness | 官方 dsh-mcp-client 与 Plugin Manager | 配置适配；未在当前 DSH 桌面版实测 |
| WorkBuddy | 官方自定义连接器 | 配置适配；未在当前 WorkBuddy 桌面版实测 |
| 豆包办公 | 豆包工作自定义连接器入口 | 配置适配；未在当前豆包客户端实测 |
| Codex / Cursor / Claude Code | 各客户端原生远程 MCP | 配置适配；本轮不声称逐客户端桌面实测 |

公网下载GitHub归档在Mac网络耗时较长，因此默认改为REAL同源版本包；GitHub保留源码、文档和版本。`/agent.json`给出包SHA-256。实际桌面软件安装界面尚未逐项操作，不将SDK测试等同于所有客户端已实测。

本轮平台检查119项通过；数据库升级验证使用隔离PostgreSQL 17。测试调用为免费职业，私有凭据不留在本仓库。
