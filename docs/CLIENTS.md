# 客户端接入流程与支持状态

核查日期：2026-11-03。文档配置支持、协议测试、真实任务验证分别记录；「未确认」不等于永久不支持。C.AI提供MCP方法/判断服务和模型API，支持状态随客户端版本更新。

| 客户端 | 默认路径 | API子Agent状态与流程 |
|---|---|---|
| Hermes | MCP；已有连接与独立模型路径实测 | 原生子Agent独立provider未确认。若实际版本支持，增加独立C.AI任务实例/子Agent，传入工作区和工具，不改全局模型；否则MCP |
| OpenCode | API子Agent或MCP | 官方有独立agent.model和自定义provider；尚未完成C.AI端到端任务验证。按下方流程配置 |
| OpenClaw | API子Agent或其可用MCP接入 | 官方有子Agent模型覆盖与自定义provider；尚未完成C.AI端到端任务验证。按下方流程配置 |
| Codex | MCP | 子Agent继承父provider；独立第三方provider不按原生支持宣传。C.AI当前Chat Completions也不足以满足Responses要求。执行INSTALL中的Codex MCP流程 |
| Claude Code | MCP | 子Agent可选模型，但未从官方文档确认每子Agent独立第三方endpoint。执行INSTALL中的Claude Code MCP流程 |
| Cursor | MCP | 当前未确认原生子Agent独立C.AI provider。合并INSTALL中的MCP配置，不修改全局模型 |
| DeepSeek Harness | MCP | 用Plugin Manager/dsh-mcp-client，见INSTALL；API子Agentprovider按实际版本确认，当前不承诺 |
| WorkBuddy | MCP | 使用自定义连接器，见INSTALL；独立API子Agent未确认，不猜测配置项 |
| 豆包办公/豆包工作 | MCP（取决于实际产品连接器能力） | 先识别具体产品及版本，按INSTALL连接器流程；普通聊天App不可视为同等支持。API子Agent未确认 |
| 其他Agent | 先识别能力 | 有远程MCP/OAuth用远程；仅stdio用npx；有每Agent独立兼容provider再按MODEL配置。都没有则说明暂不支持 |

## 所有客户端的共同步骤

读取agent.json → 识别版本和能力 → 选择上述路径 → 保留已有配置 → 本人在C.AI授权 → 无费用连接检查 → 报告真实状态。API不能设置子Agentprovider时采用MCP，并明确这是请求方法与判断，而不是安装了第三方模型的原生子Agent。任何安装都不扩大分身范围、工具权限或预算。

## OpenCode API子Agent

1. 读现有opencode.json，不覆盖已有provider/agent。
2. 增加real provider：npm设为 `@ai-sdk/openai-compatible`，options.baseURL为C.AI清单中的 `/v1`；凭据用环境变量引用或客户端私有存储。
3. models中注册从 `/v1/models` 取得的精确ID，不伪造模型能力和上下文上限。
4. 新增命名子Agent，mode设为subagent，model设为 `real/实际model-id`；description解释适用任务，permission按用户当前工作范围。
5. 保留主Agent的model。检查它调用该子Agent所需的task权限。
6. 先查模型，再在用户下达任务后验证工具调用、文件回读和失败恢复。失败退回MCP并报告原因，不能标为已通过。

依据：[Agents](https://opencode.ai/docs/agents/)、[Providers](https://opencode.ai/docs/providers/)。

## OpenClaw API子Agent

1. 读取当前Gateway与Agent配置，保留已有模型和主Agent设置。
2. 在models.providers或所选Agent的models.json增加real，baseUrl为C.AI `/v1`，api设为 `openai-completions`；使用SecretRef/环境凭据。
3. 注册精确model ID并检查可用模型范围。不要选openai-responses，C.AI当前不提供该接口。
4. 仅给目标子Agent/目标调用设置 `real/实际model-id`；避免修改所有子Agent的默认模型。配置字段以当前版本官方说明为准。
5. 工具与工作区继续由OpenClaw控制。先验证模型发现；任务阶段再核对实际工具循环、权限、取消与费用。

依据：[自定义provider](https://docs.openclaw.ai/gateway/config-tools/custom-providers)、[子Agent](https://docs.openclaw.ai/tools/subagents)。

## 受限客户端

Codex：[官方子Agent继承规则](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[Responses兼容要求](https://learn.chatgpt.com/docs/enterprise/gateway-compatibility)。Claude Code：[子Agent](https://code.claude.com/docs/en/sub-agents)、[第三方网关](https://code.claude.com/docs/en/third-party-integrations)。全局网关能路由模型，不代表客户端原生允许单个子Agent换provider；本项目不以替换订阅认证、注入补丁或拦截全部模型流量作为默认安装方式。

如果今后增加独立本地执行适配器，将单列依赖、授权和验证状态；当前不宣称这条路径已提供。
