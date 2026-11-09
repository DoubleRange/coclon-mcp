window.__ModuleLoader__.load({id:'dsh-plugin-coclon',factory:require=>{const module={exports:{}};const exports=module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
let react = require("react");
react = __toESM(react, 1);
let zod = require("zod");
// .impeccable/runtime/dsh-validation/node_modules/@deepseek-ai/dsh-typert-protocol/lib/types/remote-info.js
/** Lazy assembly of generated Remote definitions using caller-supplied Zod; no runtime imports. */
/**
* Retain one generated definition per endpoint without constructing parsers or projections.
* The class instance builds its shared descriptor/method index on first access;
* input schemas and JSON Schema projections are cached only when requested.
* @param spec - compiler-produced method facts and Zod factories.
* @param zod - the generated artifact's Zod runtime for named-input parsers.
* @returns a lazy, mountable info instance with no registration or transport effects.
*/
function createTypertRemoteInfo(spec, zod) {
	return new RemoteInfo(spec, zod);
}
var RemoteInfo = class {
	spec;
	zod;
	index;
	constructor(spec, zod) {
		this.spec = spec;
		this.zod = zod;
	}
	get package() {
		return this.spec.package;
	}
	get descriptors() {
		return this.resolve().descriptors;
	}
	get methods() {
		return this.resolve().methods;
	}
	resolve() {
		if (this.index !== void 0) return this.index;
		const zod = this.zod;
		const descriptors = [];
		const methods = Object.create(null);
		for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
			const separator = endpoint.indexOf("/");
			const namespace = endpoint.slice(0, separator);
			const method = endpoint.slice(separator + 1);
			const parameters = definition.parameters.map((parameter) => ({
				...parameter,
				wire: parameter.wire ?? parameter.name
			}));
			const descriptor = {
				...definition,
				id: `${this.spec.package}#${endpoint}`,
				namespace,
				method,
				parameters,
				result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
			};
			if (definition.invocation.kind === "direct") {
				const inputs = [];
				methods[endpoint] = Object.assign(descriptor, {
					input(options) {
						const strict = options?.strict === true;
						return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
					},
					invoke(remote, input, signal) {
						const named = input;
						const values = parameters.map((parameter) => named[parameter.wire]);
						if (definition.cancellation !== void 0) values.push(signal);
						const receiver = Reflect.get(remote, namespace);
						return Reflect.get(receiver, method).apply(receiver, values);
					}
				});
			}
			descriptors.push(descriptor);
		}
		return this.index = {
			descriptors,
			methods
		};
	}
};
function optional(parameter) {
	return parameter.source === "json" && parameter.acceptsUndefined === true;
}
var NamedInput = class {
	parameters;
	strict;
	zod;
	schema;
	projection;
	constructor(parameters, strict, zod) {
		this.parameters = parameters;
		this.strict = strict;
		this.zod = zod;
	}
	codec(parameter) {
		return this.strict ? parameter.strictCodec : parameter.codec;
	}
	create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
		const value = this.codec(parameter).create();
		return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
	})));
	get jsonSchema() {
		return this.project().jsonSchema;
	}
	get jsonSchemaError() {
		return this.project().jsonSchemaError;
	}
	project() {
		if (this.projection !== void 0) return this.projection;
		const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
		if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
		return this.projection = { jsonSchema: {
			type: "object",
			properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
				...this.codec(parameter).jsonSchema,
				...parameter.description === void 0 ? {} : { description: parameter.description }
			}])),
			required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
			additionalProperties: false
		} };
	}
};
var ResultValue = class {
	spec;
	projection;
	constructor(spec) {
		this.spec = spec;
	}
	get mode() {
		return this.spec.mode;
	}
	get typeSymbol() {
		return this.spec.typeSymbol;
	}
	get create() {
		return this.spec.create;
	}
	get decode() {
		return this.spec.decode;
	}
	get encode() {
		return this.spec.encode;
	}
	get description() {
		return this.spec.description;
	}
	get jsonSchemaError() {
		return this.spec.jsonSchemaError;
	}
	get jsonSchema() {
		if (this.projection === void 0) {
			const schema = this.spec.jsonSchema;
			this.projection = { value: schema === void 0 ? void 0 : {
				...schema,
				description: this.spec.description
			} };
		}
		return this.projection.value;
	}
};
// ops/deepseek-harness/remote.mjs
var input = () => zod.z.discriminatedUnion("kind", [
	zod.z.object({ kind: zod.z.literal("status") }).strict(),
	zod.z.object({
		kind: zod.z.literal("browse"),
		query: zod.z.string().max(100).optional()
	}).strict(),
	zod.z.object({
		kind: zod.z.literal("connect"),
		mode: zod.z.enum(["account", "trial"])
	}).strict(),
	zod.z.object({
		kind: zod.z.literal("select"),
		id: zod.z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)
	}).strict()
]);
var codec = {
	mode: "strict",
	typeSymbol: "dsh-plugin-coclon#input",
	create: input
};
var TYPERT_REMOTE = createTypertRemoteInfo({
	package: "dsh-plugin-coclon",
	methods: { "coclonControl/action": {
		service: "coclonControl",
		description: "Owner-only COCLON account, catalogue and active twin controls.",
		invocation: { kind: "direct" },
		parameters: [{
			name: "input",
			source: "json",
			codec,
			strictCodec: codec
		}],
		result: {
			mode: "strict",
			typeSymbol: "dsh-plugin-coclon#state",
			create: () => zod.z.json()
		}
	} }
}, zod.z);
// ops/deepseek-harness/client.source.mjs
var h = react.default.createElement, { useState, useEffect, useRef } = react.default;
var css = `.coclon-panel{font-family:inherit;font-size:14px;line-height:1.6;--cc-line:color-mix(in srgb,currentColor 15%,transparent);--cc-muted:color-mix(in srgb,currentColor 68%,transparent);max-width:900px}.coclon-panel *{box-sizing:border-box}.coclon-panel h3,.coclon-panel h4,.coclon-panel p{margin:0}.coclon-panel h3{font-size:18px;font-weight:600}.coclon-panel h4{font-size:14px;font-weight:500}.cc-top,.cc-actions,.cc-account,.cc-metrics{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.cc-top{justify-content:space-between;margin-bottom:20px}.cc-account{justify-content:space-between;padding-bottom:20px;border-bottom:1px solid var(--cc-line)}.cc-metrics{gap:24px;margin-top:16px}.cc-metrics span{display:block;font-size:12px;color:var(--cc-muted)}.cc-metrics strong{font-size:20px;font-weight:500;font-variant-numeric:tabular-nums}.cc-muted{color:var(--cc-muted);font-size:12px}.coclon-panel button,.coclon-panel input{font:inherit;color:inherit}.coclon-panel button{min-height:36px;cursor:pointer;border:0;border-radius:6px;padding:6px 12px;background:transparent}.coclon-panel button:hover{background:color-mix(in srgb,currentColor 7%,transparent)}.coclon-panel button:focus-visible,.coclon-panel a:focus-visible,.coclon-panel input:focus-visible{outline:2px solid currentColor;outline-offset:3px}.coclon-panel button:disabled{opacity:.5;cursor:default}.coclon-panel .cc-primary{background:CanvasText;color:Canvas}.cc-notice{padding:12px 0;color:var(--cc-muted);font-size:13px}.cc-error{padding:10px 0;color:#b23d32}.cc-search{display:flex;gap:8px;margin:20px 0 16px}.cc-search input{min-width:0;flex:1;border:0;box-shadow:inset 0 0 0 1px var(--cc-line);background:transparent;border-radius:6px;padding:8px 12px}.cc-grid{display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px}.cc-people{display:flex;flex-direction:column;gap:4px}.cc-person{display:flex;align-items:center;gap:10px;text-align:left;width:100%}.cc-person[aria-pressed=true]{background:color-mix(in srgb,currentColor 7%,transparent)}.cc-avatar{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;background:color-mix(in srgb,currentColor 8%,transparent);border-radius:8px;overflow:hidden}.cc-avatar img{width:100%;height:100%;object-fit:cover}.cc-role{padding:16px 0;border-bottom:1px solid var(--cc-line)}.cc-role:first-of-type{padding-top:12px}.cc-role-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}.cc-role p{font-size:13px;color:var(--cc-muted);margin:6px 0 10px}.cc-role-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}.cc-role-foot span{font-size:12px;color:var(--cc-muted)}.cc-selected{font-size:13px;margin:16px 0;color:var(--cc-muted)}.coclon-panel a{color:inherit;text-underline-offset:3px}.cc-empty{padding:24px 0;color:var(--cc-muted);font-size:13px}@media(max-width:600px){.cc-grid{grid-template-columns:1fr;gap:16px}.cc-people{flex-direction:row;overflow-x:auto;padding-bottom:8px}.cc-person{flex:0 0 auto;width:auto}.cc-metrics{gap:20px}}`;
var link = (url, text) => h("a", {
	href: url,
	target: "_blank",
	rel: "noopener noreferrer"
}, text);
function Panel({ request }) {
	const [state, setState] = useState(null), [people, setPeople] = useState([]), [person, setPerson] = useState(""), [query, setQuery] = useState(""), [busy, setBusy] = useState(""), [error, setError] = useState(""), [pending, setPending] = useState("");
	const alive = useRef(true), sequence = useRef(0);
	const refresh = async () => {
		const value = await request({ kind: "status" });
		if (alive.current) {
			setState(value);
			setPending(value.pendingUrl || "");
		}
		return value;
	};
	const search = async () => {
		const mark = ++sequence.current, value = await request({
			kind: "browse",
			query
		});
		if (alive.current && mark === sequence.current) {
			setPeople(value.people);
			setPerson((current) => value.people.some((p) => p.slug === current) ? current : value.people[0]?.slug || "");
		}
	};
	const run = async (label, work) => {
		if (busy) return;
		setBusy(label);
		setError("");
		try {
			await work();
		} catch (e) {
			if (alive.current) setError(e.message);
		} finally {
			if (alive.current) setBusy("");
		}
	};
	useEffect(() => {
		alive.current = true;
		Promise.all([refresh(), search()]).catch((e) => alive.current && setError(e.message));
		return () => {
			alive.current = false;
			sequence.current++;
		};
	}, []);
	const connect = async (mode) => {
		const answer = await request({
			kind: "connect",
			mode
		});
		if (!alive.current) return;
		if (answer.status === "connected") {
			setState(answer.state);
			setPending("");
		} else if (answer.url) setPending(answer.url);
		else throw Error("授权尚未就绪 · 请重试");
	};
	useEffect(() => {
		if (!pending) return;
		let disposed = false;
		const timer = setInterval(() => {
			request({
				kind: "connect",
				mode: "account"
			}).then((answer) => {
				if (!disposed && answer.status === "connected") {
					setState(answer.state);
					setPending("");
					setError("");
				}
			}).catch((e) => {
				if (!disposed) {
					setError(e.message);
					setPending("");
				}
			});
		}, 5e3);
		return () => {
			disposed = true;
			clearInterval(timer);
		};
	}, [pending]);
	const current = people.find((p) => p.slug === person), selected = state?.roles?.find((r) => r.id === state.selectedId || r.slug === state.selectedId), account = state?.account, origin = state?.origin || "", authorized = new Set((state?.roles || []).flatMap((r) => [r.id, r.slug]));
	const select = async (id) => {
		const value = await request({
			kind: "select",
			id
		});
		if (alive.current) setState(value);
	};
	return h("section", {
		className: "coclon-panel",
		"aria-label": "COCLON 控制面板"
	}, h("style", null, css), h("header", { className: "cc-top" }, h("div", null, h("h3", null, "COCLON"), h("p", { className: "cc-muted" }, "人物 · 赛博分身")), h("button", {
		type: "button",
		disabled: Boolean(busy),
		onClick: () => run("刷新中", refresh)
	}, busy === "刷新中" ? "刷新中…" : "刷新")), h("div", { className: "cc-account" }, h("div", null, h("h4", null, state?.connected ? account?.mode === "trial" ? "访客试用" : account?.account?.name || "已连接账号" : "尚未连接"), h("p", { className: "cc-muted" }, state?.connected ? "连接已保存" : state ? "选择试用，或登录自己的账号" : "读取连接状态…")), h("div", { className: "cc-actions" }, (!state?.connected || account?.mode === "trial") && h("button", {
		className: "cc-primary",
		disabled: Boolean(busy) || Boolean(pending),
		onClick: () => run("连接账号", () => connect("account"))
	}, busy === "连接账号" ? "连接中…" : "登录 COCLON"), !state?.connected && h("button", {
		disabled: Boolean(busy),
		onClick: () => run("开始试用", () => connect("trial"))
	}, busy === "开始试用" ? "连接中…" : "开始试用"), origin && link(origin + "/studio/api", "管理连接"))), account && h("div", { className: "cc-metrics" }, account.mode === "trial" ? h("div", null, h("span", null, "免费剩余"), h("strong", null, account.trial?.remaining ?? "—"), h("span", null, "次")) : h("div", null, h("span", null, "积分余额"), h("strong", null, account.wallet?.balance ?? "—")), account.mode !== "trial" && h("div", null, h("span", null, "本连接剩余预算"), h("strong", null, account.connection?.remaining ?? "—")), h("div", null, h("span", null, "单次价格上限"), h("strong", null, account.connection?.maxCost ?? "—"), h("span", null, "积分")), origin && link(origin + "/studio/credits", "查看积分")), pending && h("p", { className: "cc-notice" }, link(pending, "打开登录与授权页面"), " · 授权完成后自动连接"), h("p", {
		className: "cc-error",
		role: "alert"
	}, error || state?.problem || ""), selected && h("p", { className: "cc-selected" }, "当前分身：", h("strong", null, [selected.name, selected.title].filter(Boolean).join(" · "))), h("form", {
		className: "cc-search",
		onSubmit: (event) => {
			event.preventDefault();
			run("搜索中", search);
		}
	}, h("input", {
		value: query,
		onChange: (event) => setQuery(event.target.value),
		maxLength: 100,
		placeholder: "搜索人物或方向",
		"aria-label": "搜索人物或分身"
	}), h("button", {
		type: "submit",
		disabled: Boolean(busy)
	}, busy === "搜索中" ? "搜索中…" : "搜索")), people.length ? h("div", { className: "cc-grid" }, h("nav", {
		className: "cc-people",
		"aria-label": "人物"
	}, people.map((p) => h("button", {
		key: p.slug,
		type: "button",
		className: "cc-person",
		"aria-pressed": p.slug === person,
		onClick: () => setPerson(p.slug)
	}, h("span", { className: "cc-avatar" }, p.portraitUrl ? h("img", {
		src: p.portraitUrl,
		alt: "",
		loading: "lazy",
		referrerPolicy: "no-referrer"
	}) : (p.name || "?").slice(0, 1)), h("span", null, p.name)))), h("div", null, current && h("div", null, h("h4", null, current.name), h("p", { className: "cc-muted" }, current.intro), origin && link(origin + "/creators/" + encodeURIComponent(current.slug), "个人主页")), current?.roles.map((role) => {
		const allowed = authorized.has(role.id) || authorized.has(role.slug), active = state?.selectedId === role.id || state?.selectedId === role.slug;
		return h("article", {
			className: "cc-role",
			key: role.id
		}, h("div", { className: "cc-role-head" }, h("h4", null, role.title), h("span", { className: "cc-muted" }, role.price + " 积分 / 次")), role.summary && h("p", null, role.summary), h("div", { className: "cc-role-foot" }, h("span", null, allowed ? "可调用" : state?.connected ? "需授权" : "连接后选择"), h("button", {
			type: "button",
			disabled: Boolean(busy) || !allowed || active,
			className: active ? "" : "cc-primary",
			onClick: () => run("切换分身", () => select(role.id))
		}, active ? "已选择" : "设为当前分身")));
	}))) : h("p", { className: "cc-empty" }, state ? "暂无匹配人物" : "读取人物…"), h("p", {
		className: "cc-muted",
		style: { marginTop: 20 }
	}, "选择不扣费 · 实际调用沿用平台计费与授权"));
}
var inject = ["slots", "remote"];
async function apply(ctx) {
	const unmount = await ctx.remote.$mount(TYPERT_REMOTE);
	ctx.effect(() => unmount);
	ctx.inject(["remote.coclonControl"], (inner) => inner.slots.inject("plugins.bundle.config", () => inner.slots.register({
		name: "plugins.bundle.config",
		key: "dsh-plugin-coclon",
		inject: () => ({ request: async (input) => {
			const answer = await inner.remote.coclonControl.action(input);
			if (!answer.ok) throw Error(answer.error?.message || "COCLON 请求未完成");
			return answer.value;
		} })
	}, Panel)));
}
exports.apply = apply;
exports.inject = inject;

return module.exports;}});
