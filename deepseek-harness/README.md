# COCLON for DeepSeek Harness

An installable DSH bundle. Uses the official MCP client and the existing COCLON stdio connector. No new app, separate model, installation Skill, build script, or token in the package.

## Install

Use the actual active profile: `desktop` for the desktop profile, `web` for the web profile. Do not create a different profile just to install this bundle.

```sh
dsh plugin --profile desktop add https://sellers-sleeping-accounting-retirement.trycloudflare.com/downloads/dsh-plugin-coclon-0.1.0.tgz
```

Enable the bundle in Plugins. A saved bundle that reports `restart-required` is not active yet: restart that profile. Compatible versions: DSH 0.2.2-rc.1 (tested target); Node >=24.9.0. Later 0.2.x versions must still satisfy the pinned MCP client peer dependency. No desktop UI test is implied by CLI/runtime validation.

## Use

Ask the agent to use COCLON for a task. Tool names start with `mcp__coclon__`.

1. Inspect existing `real` / `coclon` connections before installing. Reuse a working one rather than enabling two copies.
2. First connection: call `real_connect` once. Public trials need no browser sign-in. Connection and discovery consume no trial tasks.
3. Use `real_search` / `real_roles` to choose an available twin and read its quote. Call `real_work` only for the requested task; use the returned methods, style and choices in the local Harness environment.
4. Credentials remain in the existing private `.real/mcp/` store. Restarting Harness or changing twins does not require setup again. A timeout does not require new authorization.
5. Account, private profile and twin editing need explicit existing COCLON grants. The plugin does not grant permissions, publish drafts, switch models, or bypass pricing. Trial exhaustion never switches to paid access automatically.

## Configure

In the bundle's configuration, set `baseUrl` to your COCLON origin. Optional `preferredProfession` selects an exact twin id without granting access. Optional `credentialFile` points to an existing private connector file. Keep `serverName` stable. Never paste an API token into these settings.

For a profile patch, update this bundle's `coclon` row and provide its complete config; DSH replaces the row config instead of deeply merging it:

```yaml
- id: coclon
  config:
    baseUrl: https://your-coclon-host.example
    serverName: coclon
    preferredProfession: kun-management-phd
```

For exact patch syntax and both MCP / model API connections, use the [maintained guide](https://github.com/DoubleRange/coclon-mcp/blob/main/docs/DEEPSEEK-HARNESS.md).

## Remove

```sh
dsh plugin --profile desktop remove dsh-plugin-coclon
```

Removing the plugin stops its process and tools. It does not revoke the account grant; revoke that separately in COCLON Connections when needed.

Sources: [DSH bundles](https://deepseek-harness.github.io/deepseek-harness/develop/basic/publish), [MCP client](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/mcp/mcp-client). MIT.
