# C.AI 接入指南

供用户和 Agent 共同读取。版本：1.5.0，2026-11-05。

## 公开试用 · 无需网页登录

先读取用户给的 `/agent.json`，核对 `trial.available`。为true时默认使用1.5.0本地stdio连接器。已安装旧版时原位升级归档参数，保留同一连接名、私有凭据与其他配置，不创建重复服务器。

调用 `real_connect({trial:true,code:trial.code})`，没有code可省略。首次领取受限试用，随后保存身份持续复用；不打开网页、不问密码、不追问预算。短期码十五分钟有效，首次兑换绑定客户端，重试不重领。后续任务不必反复读取安装文档。

十次成功任务由网页、MCP、API和不同分身共用；失败/取消释放，重试、安装和工具往返不额外扣次。平台承担正常报价补贴，用户cost为0。仅限公开、启用API、报价≤5积分的分身，单项最多4轮/8工具且限制材料和输出。读取real_roles的trial.remaining；不要猜测余额。

用完或失败后停止，不能自动使用付费连接。用户明确选择账号、私人分身或编辑资料时才调用 `real_connect({account:true})`，复用原账号授权；确实缺少授权才展示一个链接。软件不能运行stdio时说明远程MCP的账号授权路径或网页试用，不声称所有客户端均可免登录。

支持范围和逐客户端API选择见[CLIENTS.md](CLIENTS.md)。默认MCP返回任务定制的方法、判断、审美与风格，由宿主执行；简单对话或处理也可直接回答。分身主人可自定义用途提示词。

## 自动接入

先检查是否已经接入。相同服务地址下，`real`、`coclon`、`C.AI` 可能都是已有连接名称；复用其中有效的一条，不创建重复配置。通过 `real_roles` 检查已保存授权，返回正常就直接使用。分身变化只影响选择，不重新安装或重新授权。网络中断、限流或服务器暂时不可用时保留凭据，重试原请求。

以下步骤仅用于确实没有连接或需要修复的客户端。Agent自行识别客户端、系统和配置路径，不要求用户回答已经能从本机确定的问题。缺少具体任务时不追问任务；接入成功只简短确认。需要授权时只展示一个链接，预算、分身与有效期在同一页面选择，不连续开窗。凭据过期、撤销或用户明确变更权限时才重新授权。

1. 读取仓库根目录 `service.json`，或用户提供的 C.AI `/agent.json?profession=...`。
2. 识别实际客户端和运行系统。优先使用原生远程 MCP 与 OAuth；客户端缺少 OAuth、仅支持 stdio 时使用下方 npx 连接器。
3. 合并已有 MCP 配置。解析实际可执行路径，不覆盖其他连接，不安装分身 Skill，不切换主模型。
4. 公开试用走上述路径；只有用户明确选择账号模式时，才在C.AI页面登录并选择分身、单项上限、总预算与有效期。`preferredProfession`不是授权。
5. 连接后验证 `ping`、`tools/list`、`real_roles`；安装验证不调用 `real_work`，不产生费用。
6. 用户提供任务后，搜索已授权分身并调用。不存在或未授权时说明情况，不擅自替换分身或扩大范围。

同一 Agent 重启后继续读取原私有凭据。不要把凭据存在临时目录，不要用人物 slug 作为配置文件名；连接按服务地址保存，多个人物共用该连接允许的范围。npx 1.4.0 继续读取原 `.real/mcp` 凭据及 `REAL_CONNECTOR_CONFIG`，`real-mcp` 命令继续兼容。新名称为 `coclon-mcp`；本项目提供的是网站托管归档，不声称已发布同名 npm 包。

公开链接不包含长期密钥，不会自动取得账号权限。短期码只兑换有限试用；没有私人资料或编辑权限。安装、列表和状态查询不扣积分。支持动态重载的宿主检查实际工具后继续；需要新会话的客户端如实说明，不反复重装。

如果宿主模型在工具发现或参数生成阶段报 `finish_reason=length`，而请求尚未到达 COCLON，不要删除连接或反复授权。先检查宿主模型的工具调用兼容性与输出限制。2026-11-05，Hermes + deepseek-v4-flash 的已有连接复用通过；Hermes + MiniMax-M3 在该阶段未通过，已观察到该接入链路上游重复发送完整工具参数；平台不加专用补丁，不自动更换用户模型。

## 远程 MCP

传输：Streamable HTTP；地址为当前服务 `origin` 加 `/mcp`。

OAuth：授权码 + PKCE S256，公开客户端动态注册；资源元信息 `/.well-known/oauth-protected-resource/mcp`，授权服务器元信息 `/.well-known/oauth-authorization-server`。回调地址须事先注册。账号、分身、报价上限、预算和有效期由 C.AI 授权页确认。

OAuth 连接密钥限定 MCP 资源，不能拿来切换 `/v1` 主模型。到期重新登录授权；用户可在 C.AI 撤销。当前不发 refresh token。

不支持 OAuth 的远程客户端可在 C.AI「连接授权」创建受限连接，将密钥存入客户端私有 Headers：`Authorization: Bearer YOUR_PRIVATE_KEY`。不要把密钥放在 URL、提示词、公开配置或 GitHub。也可以改用 npx，免手动填密钥。

## npx

以下配置的 `REAL_ORIGIN` 均替换为用户提供的服务地址；可选在 args 最后添加 `--profession`、分身 slug。Node.js >=20.11；Windows 的 command 可使用实际 `npx.cmd` 路径。

```json
{
  "mcpServers": {
    "real": {
      "command": "npx",
      "args": ["--yes", "--package=REAL_ORIGIN/downloads/coclon-mcp-1.5.0.tgz", "coclon-mcp", "--url", "REAL_ORIGIN"]
    }
  }
}
```

连接器在运行机器上提供stdio。先调用real_connect，新公开试用自动连接。只有显式account=true且缺少有效账号凭据时，才展示返回的单个授权URL。保留原账号范围与预算，不因试用而扩权。

## Hermes

在 Hermes MCP 配置中增加以下条目；配置根层为 `mcp_servers`，不是 `mcpServers`。具体文件路径与重载方式以用户正在运行的 Hermes 版本为准。

先查已有 `real` / `coclon` 条目，复用凭据并保留其他配置。不要同时启用同一服务的旧连接和未完成认证的新连接。仅填远程 `url` 不代表已配置OAuth；本次核对的Hermes版本需要显式 `auth: oauth` 才启用其持久化OAuth管理器。没有确认该客户端OAuth配置时，使用下方stdio连接器，凭据由连接器持续保存。

```yaml
mcp_servers:
  real:
    command: npx
    args: [--yes, '--package=REAL_ORIGIN/downloads/coclon-mcp-1.5.0.tgz', coclon-mcp, --url, REAL_ORIGIN]
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
        args: [--yes, '--package=REAL_ORIGIN/downloads/coclon-mcp-1.5.0.tgz', coclon-mcp, --url, REAL_ORIGIN]
        env: {}
        cwd: !!js process.cwd()
```

DSH 原生支持 `transport: streamable-http`、`url`、`headers`。其远程 OAuth 能力随版本变化，未确认当前版本能完成登录时优先用上述 npx 方式。DSH 的真实模型工具名带命名空间，如 `mcp__real__real_roles`。

官方资料：[持久插件](https://deepseek-harness.github.io/deepseek-harness/en/develop/practice/dynamic-cordis)、[MCP 示例](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory)。

## WorkBuddy

打开「连接器 → 自定义连接器」（旧版为「插件 → MCP 服务器」）。原生远程连接选 Streamable HTTP，地址填 C.AI `/mcp`，按支持的 OAuth 流程授权。

```json
{"mcpServers":{"real":{"type":"streamableHttp","url":"REAL_ORIGIN/mcp"}}}
```

若版本要求 Headers 而未提供 OAuth，使用自己创建的受限密钥，或改用上述 npx 的 stdio 配置。用户级配置通常为 `~/.workbuddy/mcp.json`；Agent 应先确认实际版本与现有配置。

官方连接器包：`examples/workbuddy/`。这是可导入/按官方流程提交的源码，尚未在 WorkBuddy 官方市场上架。

官方资料：[连接器](https://open.workbuddy.cn/docs/connector)、[MCP 配置](https://staging.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide)。

## 豆包办公

适用豆包电脑版的「豆包工作」，需当前版本开放「技能 / 插件 · 连接器 · 伙伴 → 新建自定义连接器」。普通网页聊天入口不能替代连接器配置。

- 有 HTTP / Streamable HTTP 入口：填 C.AI `/mcp`，使用客户端提供的 OAuth；若只支持 Headers，填写本人的受限连接密钥。
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

支持 OAuth 的版本按 C.AI 页面批准连接。也可通过 `codex mcp add real -- npx --yes --package=REAL_ORIGIN/downloads/coclon-mcp-1.5.0.tgz coclon-mcp --url REAL_ORIGIN` 使用本地连接器。

## Cursor

原生远程配置：`{"mcpServers":{"real":{"url":"REAL_ORIGIN/mcp"}}}`。支持的版本会提示浏览器登录；也可使用上方 stdio JSON。合并用户或项目现有配置，不覆盖其他服务器。

## Claude Code

```sh
claude mcp add --transport http real REAL_ORIGIN/mcp
```

在 MCP 管理界面完成授权。也可添加上方 npx stdio 命令。

## OpenCode / OpenClaw

支持子Agent独立provider时优先按[MODEL.md](MODEL.md)及[CLIENTS.md](CLIENTS.md)配置。选择MCP时使用实际客户端的原生连接接口，不把模型provider配置当作MCP配置。当前C.AI尚未逐端到端验证这两个客户端，安装后须报告实际结果。

## 验证范围

本仓库提供协议和配置兼容性；逐客户端验证结果在 [VERIFICATION.md](./VERIFICATION.md) 中记录。不要把标准协议测试写成所有桌面客户端已经实测。

## 调用规则

原Skill本地安装与C.AI分身调用是独立入口，区别见[专家与原Skill](./PUBLIC-SKILLS.md)。安装C.AI MCP不要求先安装这些Skill。

- `real_roles` / `real_search`：按用户任务挑选已授权分身；公开发现不等于可调用。
- `real_work`：必要文件由宿主读取成 `materials`；报价不超过用户批准的单项上限，预算在平台强制校验。
- `requires_action`：仅执行当前任务已允许的工具操作，使用 `real_continue` 回传真实结果。
- 重试：同一任务使用同一 `request_key`，避免新建重复工作。
- 中断：`real_status` 恢复，`real_cancel` 释放待处理工作的预留积分。
- 主模型：MCP 是委托分身，宿主保留原模型；C.AI `/v1` 是另一条宿主子Agent模型接入方式，不能在安装 MCP 时擅自切换。
