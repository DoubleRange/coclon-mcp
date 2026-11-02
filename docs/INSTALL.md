# REAL 接入指南

供用户和 Agent 共同读取。版本：1.0.1，2026-11-02。

## 自动接入

1. 读取仓库根目录 `service.json`，或用户提供的 REAL `/agent.json?profession=...`。
2. 识别实际客户端和运行系统。优先使用原生远程 MCP 与 OAuth；客户端缺少 OAuth、仅支持 stdio 时使用下方 npx 连接器。
3. 合并已有 MCP 配置。解析实际可执行路径，不覆盖其他连接，不安装职业 Skill，不切换主模型。
4. 让用户在 REAL 页面登录并选择职业、单项上限、总预算和有效期。`preferredProfession` 仅是选择提示，不是授权。
5. 连接后验证 `ping`、`tools/list`、`real_roles`；安装验证不调用 `real_work`，不产生费用。
6. 用户提供任务后，搜索已授权职业并调用。不存在或未授权时说明情况，不擅自替换职业或扩大范围。

## 远程 MCP

传输：Streamable HTTP；地址为当前服务 `origin` 加 `/mcp`。

OAuth：授权码 + PKCE S256，公开客户端动态注册；资源元信息 `/.well-known/oauth-protected-resource/mcp`，授权服务器元信息 `/.well-known/oauth-authorization-server`。回调地址须事先注册。账号、职业、报价上限、预算和有效期由 REAL 授权页确认。

OAuth 连接密钥限定 MCP 资源，不能拿来切换 `/v1` 主模型。到期重新登录授权；用户可在 REAL 撤销。当前不发 refresh token。

不支持 OAuth 的远程客户端可在 REAL「连接授权」创建受限连接，将密钥存入客户端私有 Headers：`Authorization: Bearer YOUR_PRIVATE_KEY`。不要把密钥放在 URL、提示词、公开配置或 GitHub。也可以改用 npx，免手动填密钥。

## npx

以下配置的 `REAL_ORIGIN` 均替换为用户提供的服务地址；可选在 args 最后添加 `--profession`、职业 slug。Node.js >=20.11；Windows 的 command 可使用实际 `npx.cmd` 路径。

```json
{
  "mcpServers": {
    "real": {
      "command": "npx",
      "args": ["--yes", "--package=REAL_ORIGIN/downloads/real-mcp-1.0.1.tgz", "real-mcp", "--url", "REAL_ORIGIN"]
    }
  }
}
```

连接器仅在运行机器上提供 stdio；先调用 `real_connect`，把返回的授权 URL 给用户，等用户批准后再次调用。始终保留用户所选范围和预算。

## Hermes

在 Hermes MCP 配置中增加以下条目；配置根层为 `mcp_servers`，不是 `mcpServers`。具体文件路径与重载方式以用户正在运行的 Hermes 版本为准。

```yaml
mcp_servers:
  real:
    command: npx
    args: [--yes, '--package=REAL_ORIGIN/downloads/real-mcp-1.0.1.tgz', real-mcp, --url, REAL_ORIGIN]
    timeout: 150
    connect_timeout: 30
    enabled: true
```

## DeepSeek Harness

使用 Creator 模式的 Plugin Manager。官方插件为 `@deepseek-ai/dsh-mcp-client`，不是在 DSH 中写一个通用 `mcpServers` JSON。按当前版本的官方 Plugin Manager 接口安装配置 bundle，检查结果为 `application: applied`，再验证运行工具。

配置条目示意：

```yaml
- insert:
    - id: real-mcp
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: real
        transport: stdio
        command: npx
        args: [--yes, '--package=REAL_ORIGIN/downloads/real-mcp-1.0.1.tgz', real-mcp, --url, REAL_ORIGIN]
        env: {}
        cwd: !!js process.cwd()
```

DSH 原生支持 `transport: streamable-http`、`url`、`headers`。其远程 OAuth 能力随版本变化，未确认当前版本能完成登录时优先用上述 npx 方式。DSH 的真实模型工具名带命名空间，如 `mcp__real__real_roles`。

官方资料：[持久插件](https://deepseek-harness.github.io/deepseek-harness/en/develop/practice/dynamic-cordis)、[MCP 示例](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory)。

## WorkBuddy

打开「连接器 → 自定义连接器」（旧版为「插件 → MCP 服务器」）。原生远程连接选 Streamable HTTP，地址填 REAL `/mcp`，按支持的 OAuth 流程授权。

```json
{"mcpServers":{"real":{"type":"streamableHttp","url":"REAL_ORIGIN/mcp"}}}
```

若版本要求 Headers 而未提供 OAuth，使用自己创建的受限密钥，或改用上述 npx 的 stdio 配置。用户级配置通常为 `~/.workbuddy/mcp.json`；Agent 应先确认实际版本与现有配置。

官方连接器包：`examples/workbuddy/`。这是可导入/按官方流程提交的源码，尚未在 WorkBuddy 官方市场上架。

官方资料：[连接器](https://open.workbuddy.cn/docs/connector)、[MCP 配置](https://staging.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide)。

## 豆包办公

适用豆包电脑版的「豆包工作」，需当前版本开放「技能 / 插件 · 连接器 · 伙伴 → 新建自定义连接器」。普通网页聊天入口不能替代连接器配置。

- 有 HTTP / Streamable HTTP 入口：填 REAL `/mcp`，使用客户端提供的 OAuth；若只支持 Headers，填写本人的受限连接密钥。
- 有 STDIO 入口：使用本指南 npx 配置，首次调用 `real_connect` 完成浏览器授权。
- 没有自定义连接器入口：先更新或确认账号开放情况；不要虚构已经安装完成。

豆包官方页面未提供可稳定引用的公开字段规范。本节依据已公开的实际集成入口提供兼容方式，尚未在用户当前豆包客户端逐步实测。功能入口与字段以当前客户端为准。

集成方实例：[禅道接入豆包工作](https://www.zentao.net/zentao-ai-doubao.html)。

## Codex

原生远程：

```sh
codex mcp add real --url REAL_ORIGIN/mcp
codex mcp login real
```

支持 OAuth 的版本按 REAL 页面批准连接。也可通过 `codex mcp add real -- npx --yes --package=REAL_ORIGIN/downloads/real-mcp-1.0.1.tgz real-mcp --url REAL_ORIGIN` 使用本地连接器。

## Cursor

原生远程配置：`{"mcpServers":{"real":{"url":"REAL_ORIGIN/mcp"}}}`。支持的版本会提示浏览器登录；也可使用上方 stdio JSON。合并用户或项目现有配置，不覆盖其他服务器。

## Claude Code

```sh
claude mcp add --transport http real REAL_ORIGIN/mcp
```

在 MCP 管理界面完成授权。也可添加上方 npx stdio 命令。

## 验证范围

本仓库提供协议和配置兼容性；逐客户端验证结果在 [VERIFICATION.md](./VERIFICATION.md) 中记录。不要把标准协议测试写成所有桌面客户端已经实测。

## 调用规则

- `real_roles` / `real_search`：按用户任务挑选已授权职业；公开发现不等于可调用。
- `real_work`：必要文件由宿主读取成 `materials`；报价不超过用户批准的单项上限，预算在平台强制校验。
- `requires_action`：仅执行当前任务已允许的工具操作，使用 `real_continue` 回传真实结果。
- 重试：同一任务使用同一 `request_key`，避免新建重复工作。
- 中断：`real_status` 恢复，`real_cancel` 释放待处理工作的预留积分。
- 主模型：MCP 是委托职业，宿主保留原模型；REAL `/v1` 是另一条职业主模型接入方式，不能在安装 MCP 时擅自切换。
