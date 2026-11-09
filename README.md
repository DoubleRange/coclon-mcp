# COCLON · C.AI MCP

通过 MCP 调用 C.AI 分身。宿主 Agent 负责整体任务，C.AI 提供已授权分身的判断、表达、方法与工作结果。

## 给 Agent 的入口

读取 [service.json](./service.json)，访问其中的 `agentEntry`。该地址提供当前服务地址、指定分身、远程 MCP 和本地连接方法。按当前客户端选择连接方式，保留原有配置。

详细安装步骤、各软件配置与兼容状态：[INSTALL.md](./docs/INSTALL.md)。

## DeepSeek Harness

提供原生可安装插件：[安装与模型 API 连接](docs/DEEPSEEK-HARNESS.md)。读取当前服务 `/deepseek-harness.json` 获得版本包及 SHA-256。公开代码位于 [deepseek-harness/](deepseek-harness/)，不包含私人资料。

## 两种连接

- **远程 MCP**：向支持 Streamable HTTP 的客户端添加 `/mcp` 地址。支持 OAuth 的客户端会打开 C.AI 网页，用户登录并批准分身、预算与期限。
- **npx 本地连接器**：客户端启动版本化Node.js程序；新客户端通过real_connect领取十次受限试用，无需网页登录。只有用户明确选择账号模式时才请求网页授权。适用于 stdio 客户端，不需要 Python 或额外 Skill。

`npx` 是程序启动方式，MCP 是通信协议，两者并不冲突。本包通过 C.AI 同源版本包分发，源码在 GitHub 按版本公开。Agent 可核对 `/agent.json` 中的 SHA-256；它不是 npm 注册表上的同名包。

## 安装

Node.js 20.11 或以上。把 `REAL_ORIGIN` 换成 service.json 的 `origin`：

```sh
npx --yes --package=REAL_ORIGIN/downloads/coclon-mcp-1.5.0.tgz coclon-mcp --url REAL_ORIGIN
```

命令运行后等待 MCP 客户端通过标准输入发消息，这是正常行为。`--help` 查看参数。Windows 可在配置里使用 `npx.cmd` 的实际绝对路径。

## 授权与工作

公开试用：real_connect → real_roles → real_work。复制码让网页和Agent共用十次成功任务；失败、取消释放，状态查询与重试不重复记次。平台补贴正常报价，用户cost为0。仅限公开、API开启、报价≤5积分的分身，4轮/8工具及有界上下文。试用不包括宿主和外部工具本身的费用。

需要账号、私人分身或编辑资料时，显式real_connect({account:true})；有有效账号授权就复用，没有才打开一个网页选择范围、预算和期限。real_connect({trial:true,code:...})可明确切到试用，原付费凭据保留。试用失败或耗尽不自动转付费。

连接和读取分身不扣积分。工作使用平台同一套报价、预算和结算规则。发现全站分身不代表获得调用权限；重新授权由用户操作。授权可在 C.AI「连接授权」中撤销。

`real_work` 可携带宿主已经读取的文件材料；需要进一步操作时返回 `requires_action`。宿主只执行当前任务允许的工具操作，再通过 `real_continue` 回传真实结果。重试复用同一 `request_key`，成功结算一次。

## 代码范围

公开内容：Node.js stdio 连接器、工具定义、安装说明与配置示例。没有账号密钥、私人资料、分身知识库或模型配置。

本地授权凭据保存在用户目录 `.real/mcp/` 中，按 C.AI 服务地址隔离。可用 `REAL_CONNECTOR_CONFIG` 指定私有文件；不要提交凭据。

## 许可证

MIT，见 [LICENSE](./LICENSE)。

## API 主人格

若希望C.AI分身成为宿主的主模型，使用首页的API主人格模式。模型整合人格、Skills和知识，宿主保留工具执行。按[主模型接入指南](./docs/MODEL.md)配置；客户端需要支持自定义模型。MCP协作仍保留宿主原模型。

## 个人资料

可在C.AI网页单独授权查看或编辑本人资料草稿。默认不允许；旧连接不会自动扩权。工具：real_profile_read、real_profile_update、real_profile_restore。先读revision，再用唯一operation_key提交本人要求的修改；可恢复、不自动发布。该权限不包括原始人格、知识库、密钥或其他账号，且不赋予任何分身调用权限。

用途与接入能力：[客户端流程与支持状态](docs/CLIENTS.md)。API优先用于宿主子Agent，不支持时明确使用MCP方法服务。

品牌：COCLON，简称C.AI。1.5.0增加十次有限试用；real-mcp别名、原工具名、原账号授权、配置路径与历史下载兼容保留。不声称已发布npm注册表同名包。
