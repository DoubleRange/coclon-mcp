# 接入验证

2026-11-02；仅记录实际执行证据。当前验证进行中，发布前更新。

| 对象 | 配置依据 | 当前实测范围 |
| --- | --- | --- |
| Streamable HTTP | MCP 2025-11-25 | 待本次协议客户端核对 |
| OAuth / PKCE | MCP 授权规范、RFC 8414 / 9728 / 7591 | 待本次授权与撤销核对 |
| npx | GitHub v1.0.0 版本包 | 待公开包下载与启动核对 |
| Hermes | mcp_servers 配置 | 旧 Python MCP 与直接主模型路径此前已实测；新 Node 连接器待验证 |
| DeepSeek Harness | 官方 dsh-mcp-client 与 Plugin Manager | 配置适配；未在当前 DSH 桌面版实测 |
| WorkBuddy | 官方自定义连接器 | 配置适配；未在当前 WorkBuddy 桌面版实测 |
| 豆包办公 | 豆包工作自定义连接器入口 | 配置适配；未在当前豆包客户端实测 |
| Codex / Cursor / Claude Code | 各客户端原生远程 MCP | 配置适配；本轮不声称逐客户端桌面实测 |
