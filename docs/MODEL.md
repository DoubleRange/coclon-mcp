# REAL 作为 Agent 主模型

用户在首页选择「API 主人格」后，复制的 `/agent.json?profession=...&mode=api` 提供本指南和当前接口地址。此路径让 REAL 整合人格、职业 Skills 与知识，作为宿主的模型来源；由宿主继续管理文件、浏览器及其他获授权工具。

## 适用条件

宿主需要支持自定义 OpenAI 兼容模型来源及模型ID。Hermes 这条原生模型路径此前已验证。其他软件按实际版本确认，不能把“支持 MCP”视为“支持更换主模型”；不支持时告知用户，不假装配置成功。

## 配置步骤

1. 读取用户给出的 Agent 清单，确认 `mode=api` 和指定职业。保留已有提供者，能用独立模型配置时单独建立 REAL 配置。
2. POST `client_name` 至清单中的 `/connect/device`，把 `verification_uri_complete` 交给用户。用户在 REAL 登录并明确批准职业、单项费用上限、总预算及有效期。可追加 `profession` 选择提示，不得自行授权。
3. 用户批准后按返回的轮询间隔 POST `/connect/token`，`grant_type` 为 `urn:ietf:params:oauth:grant-type:device_code`，携带 `device_code`。不要向用户索要密码，不在对话或公开文件中显示 access_token。
4. 用该 token 请求 `/v1/professions`，按用户选择的 slug 或职业ID找到授权角色；再请求 `/v1/models`，使用该角色对应的精确 `model` ID。没有匹配时停止配置并说明，不替换为其他人格。
5. 配置 provider base URL 为清单中的 `/v1`，API key 为私有保存的连接凭据，模型使用上一步的精确ID。支持的客户端可显示 REAL 职业名以便用户识别。
6. 安装阶段只验证模型发现，不主动生成内容或扣费。用户下达工作任务后再开始调用。

## 工具与人格

宿主把工具定义显式传给 `/v1/chat/completions`，模型可以提出原生 `tool_calls`；宿主在自身权限范围执行，将真实 tool 结果回传。REAL 不因此取得宿主所有文件或全部工具权限。

REAL 的人格和职业方法形成判断与表达，宿主的执行规范继续约束实际工具行为。MCP则保留宿主原模型，仅按任务委托 REAL 职业；两者使用同一套职业范围、积分和撤销约束。

远程 `/mcp` OAuth 凭据有资源限定，不能直接用于 `/v1`。此路径使用上述设备授权得到的受限连接，或用户在 REAL 创建的适用API密钥。到期、暂停、预算耗尽或撤销后，模型请求会受到服务端拦截。
