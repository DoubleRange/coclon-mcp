# DeepSeek Harness 连接

官方规范核对：2026-11-09；验证版本 DSH 0.2.2-rc.1、Node 24.11.0。使用官方 MCP 客户端。插件不改变平台人格、检索、价格、权限或主 Agent 模型，不附带任何私人材料。

## 给使用者

网站原来的「复制给 Agent」入口保持不变。Agent 读取 `/agent.json` 的 `plugins.deepseekHarness`，取得当前服务器的安装包、校验值和操作指南。独立清单：`/deepseek-harness.json`。

先检查当前 profile 是否已有指向同一 COCLON 地址的 `real` / `coclon` 连接。有则复用。没有才在当前 profile 安装插件；不要另外建立一个用户不会启动的 profile。

```sh
dsh plugin --profile desktop add https://sellers-sleeping-accounting-retirement.trycloudflare.com/downloads/dsh-plugin-coclon-0.1.0.tgz
```

`desktop` 必须替换为实际正在使用的 profile；Web 默认通常为 `web`。也可在插件页面添加包地址，或让创造模式下的 Plugin Manager 按当前版本提供的 `install_bundle` 工具 schema 安装此 tarball。不要猜工具参数。先看安装结果，再看工具是否出现：`application: applied` 才是当前会话已应用；`restart-required` 需重启当前 profile；安装失败不算已连接。

工具前缀为 `mcp__coclon__`。第一次连接调用 `real_connect`，之后按需查 `real_roles` / `real_search`、报价，再 `real_work`。公开试用沿用原十次额度与上限；连接检查不发起工作，不扣次。复制清单携带试用码时，原样传给 `real_connect` 的 `code`，并按清单选择 `trial:true`，不要把码写入插件配置。

重启或切换分身不重新安装。插件沿用 `.real/mcp/<origin-hash>.json`，亦可在配置中指定已有私有 `credentialFile`。网络失败保留凭据；仅失效、撤销或新的权限需求才重新授权。试用耗尽不能自动转付费。编辑个人资料或分身需本人单独授予对应权限，插件不会发布、改价或扩大授权。

## 插件设置

可修改 `baseUrl`、稳定的 `serverName`、选填 `preferredProfession`、`credentialFile`、`nodeCommand` 和单次调用超时。超时是上限，不是预计等待时间。`preferredProfession` 只提示选择，不授予使用权。修改分身不需要重装插件。

配置变更仍走 Harness 的插件设置。手动 profile override 必须保留完整行配置：

```yaml
- id: coclon
  config:
    baseUrl: https://your-coclon-host.example
    serverName: coclon
    preferredProfession: kun-management-phd
```

不要写通用 `mcpServers` JSON。包已包含预构建 JavaScript，不需要 `prepare`、额外 Skill 或允许安装构建脚本。运行使用 Harness 自己的 Node；若桌面发行版的运行时无法作为 Node 子进程执行，在 `nodeCommand` 指定已安装的 Node >=24.9.0。

## 两种使用方式

**MCP，默认方式**：Harness 保持原模型。COCLON 分身根据任务提供方法、判断、表达与建议，Harness 使用本地文件和工具继续执行。简单任务可直接返回结果。安装插件不会下载私有 Skills 或自动调用本地工具。

**模型 API，可选方式**：设置 → 模型 → 添加模型提供商 → 自定义模型 API。Provider ID 用 `coclon`，基础 URL 为清单所在服务器的 `/v1`，协议选择 **OpenAI Chat Completions**。凭据使用 COCLON 已授权的私有访问密钥；从「获取可用模型」或 `GET /v1/models` 选择精确分身模型 ID。不得选 Responses 或 Anthropic Messages。令牌只进入 Harness 私有凭据系统，不输出到对话、URL 或 Git。

用户明确选择该模型后，COCLON 负责模型推理与分身上下文，Harness 继续负责执行工具。不要因安装 MCP 插件自动改掉主模型。独立子 Agent 的模型分配尚未在本轮验证；需要保留主模型时先使用 MCP，不宣称已经配置了 API 子 Agent。

## 维护与实测边界

包定义在 `ops/deepseek-harness/`，桥和工具从 `ops/mcp/node/` 原字节加入白名单 tarball；无第二份授权、计费实现。`scripts/export-deepseek-plugin.mjs` 导出公开源码包到连接器仓库 `deepseek-harness/`。`dsh-plugin-coclon@0.1.0` 的 MCP peer 固定为 `0.2.2-rc.1`；其余版本需通过范围和 peer 检查，不能把最新 master 文档当作已发布版本的实现。

隔离验证区分：包结构/摘要、官方 Cordis 工具注册、真实 stdio/平台 API 往返、保存凭据后的卸载重载；合成模型只验证工作与结算链路，不用于能力质量排名。本轮结果：官方 CLI 安装与配置层生效、14项工具注册、真实 stdio → 平台 API 合成任务、卸载重载后 connected/reused=true 与凭据不变；连接和分身列表不计费。三项新增回归及全部301项项目检查通过。桌面应用点击安装、真实用户任务、API独立子Agent未据此宣称通过。

## 官方依据

- [打包与安装插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish)
- [持久化插件与应用状态](https://deepseek-harness.github.io/deepseek-harness/develop/practice/dynamic-cordis)
- [官方 MCP 客户端](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/mcp/mcp-client)
- [模型 API 配置](https://deepseek-harness.github.io/deepseek-harness/guide/providers)
