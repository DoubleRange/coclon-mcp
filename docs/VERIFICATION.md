# 接入验证

2026-11-02；仅记录实际执行证据。客户端配置适配与运行实测分开记录。

| 对象 | 配置依据 | 当前实测范围 |
| --- | --- | --- |
| Streamable HTTP | MCP 2025-11-25 | 隔离HTTP客户端：initialize、tools/list、工作、重复请求与授权失败通过；线上SDK核对待更新 |
| OAuth / PKCE | MCP 授权规范、RFC 8414 / 9728 / 7591 | 隔离SQLite与PostgreSQL：S256、回调、资源限定、并发一次性兑换、预算、撤销通过 |
| npx | GitHub v1.0.0 版本包 | Windows公开GitHub包下载与npx启动通过；Node stdio浏览器授权、real_roles与不扣费检查通过 |
| Hermes | mcp_servers 配置 | 旧 Python MCP 与直接主模型路径此前已实测；新 Node 在隔离stdio客户端验证通过，Mac SDK核对待更新 |
| DeepSeek Harness | 官方 dsh-mcp-client 与 Plugin Manager | 配置适配；未在当前 DSH 桌面版实测 |
| WorkBuddy | 官方自定义连接器 | 配置适配；未在当前 WorkBuddy 桌面版实测 |
| 豆包办公 | 豆包工作自定义连接器入口 | 配置适配；未在当前豆包客户端实测 |
| Codex / Cursor / Claude Code | 各客户端原生远程 MCP | 配置适配；本轮不声称逐客户端桌面实测 |
