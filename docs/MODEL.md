2026-11-05：公开有限试用先读取/agent.json?mode=api的trial对象；available=true时，持久保存一个随机32字节base64url client_token，向trial.connectUrl发送client_token、create:true和可选code。返回的access_token只存私有凭据；以后复用标识，网页/MCP/API共用十次成功任务。cost=0、平台补贴，单项4轮/8工具。用完停止，不自动转付费。下方账号设备授权仅用于用户明确选择账号、私人分身或付费范围；MCP资源专用OAuth密钥仍不能用于模型API。

# C.AI 模型 API 接入

优先把 C.AI 用作用户侧子 Agent 的模型。主 Agent 保持原模型；文件、工具和审批由宿主管理。客户端不支持子 Agent 独立 provider 时，明确说明并改用 [MCP](INSTALL.md)，不把全局更换模型当作子 Agent 接入。

## 通用流程

1. 读取用户提供的 `/agent.json?profession=...&mode=api`；识别客户端、版本和实际运行机器。先看 [客户端流程与状态](CLIENTS.md)。
2. 备份/保留现有配置，仅增加独立 provider 和所选子 Agent，不覆盖主模型。
3. 按清单向 `/connect/device` 提交 client_name，展示 verification_uri_complete。本人在 C.AI 选择分身、单项上限、总预算和有效期。
4. 按轮询间隔用 device_code 向 `/connect/token` 兑换。密钥只放客户端私有凭据存储，不放提示词、公开文件或 URL。MCP OAuth token 不能用于模型API。
5. 用获批凭据读取 `/v1/professions`、`/v1/models`，匹配精确分身和model ID。模型Base URL为清单的 `/v1`，协议为 Chat Completions；不是Responses或Anthropic Messages兼容承诺。
6. 在支持的子 Agent 内配置C.AI provider/model。只验证模型发现，不在安装时生成或扣费。授权范围、价格或分身不匹配时停止，不擅自替换。
7. 明确报告「已配置，未任务验证」「已验证工具往返」或「不支持，改用MCP」。支持状态不能从一次GET models推断。

## 工具与用途

子 Agent 把用户允许的工具定义传给 `/v1/chat/completions`，宿主执行 tool_calls 并回送真实结果。C.AI没有因此取得整个文件系统。分身的人格、Skills和知识决定判断与表达，用途提示词由主人设置；主 Agent与宿主的权限、操作协议继续生效。

API可以用于独立任务实例；更换主Agent模型仅在用户另行明确要求时进行。Hermes此前验证的是MCP和独立模型运行路径，不能据此声称所有软件的原生子Agent配置均已验证。

## 长任务与限制

现有API工作最多64轮，MCP工具协作最多24轮；每轮最多4个工具请求。30分钟无进展超时、4小时绝对上限。模型API目前只支持文字输入；音视频依赖宿主工具处理，不宣称原生视听能力。流式为缓冲返回，不等于实时首token输出。长工具结果可能节选，不能把省略内容视为已读取。

复用同一请求编号重试；工具返回继续原有工作，同一工作成功结算一次。暂停、撤销、预算与过期由C.AI强制校验。状态completed不是质量保证，文件交付须由宿主实际执行和回读。
