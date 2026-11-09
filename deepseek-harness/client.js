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
	zod.z.object({ kind: zod.z.literal("check_update") }).strict(),
	zod.z.object({
		kind: zod.z.literal("prepare_update"),
		version: zod.z.string().regex(/^\d+\.\d+\.\d+$/),
		sha256: zod.z.string().regex(/^[a-f0-9]{64}$/)
	}).strict(),
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
var css = `.coclon-panel{font-family:inherit;font-size:14px;line-height:1.6;--cc-line:color-mix(in srgb,currentColor 15%,transparent);--cc-muted:color-mix(in srgb,currentColor 68%,transparent);max-width:900px}.coclon-panel *{box-sizing:border-box}.coclon-panel h3,.coclon-panel h4,.coclon-panel p{margin:0}.coclon-panel h3{font-size:18px;font-weight:600}.coclon-panel h4{font-size:14px;font-weight:500}.cc-top,.cc-actions,.cc-account,.cc-metrics{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.cc-top{justify-content:space-between;margin-bottom:20px}.cc-account{justify-content:space-between;padding-bottom:20px;border-bottom:1px solid var(--cc-line)}.cc-metrics{gap:24px;margin-top:16px}.cc-metrics span{display:block;font-size:12px;color:var(--cc-muted)}.cc-metrics strong{font-size:20px;font-weight:500;font-variant-numeric:tabular-nums}.cc-muted{color:var(--cc-muted);font-size:12px}.coclon-panel button,.coclon-panel input{font:inherit;color:inherit}.coclon-panel button{min-height:36px;cursor:pointer;border:0;border-radius:6px;padding:6px 12px;background:transparent}.coclon-panel button:hover{background:color-mix(in srgb,currentColor 7%,transparent)}.coclon-panel button:focus-visible,.coclon-panel a:focus-visible,.coclon-panel input:focus-visible{outline:2px solid currentColor;outline-offset:3px}.coclon-panel button:disabled{opacity:.5;cursor:default}.coclon-panel .cc-primary{background:CanvasText;color:Canvas}.coclon-panel .cc-primary:hover{background:CanvasText;color:Canvas;opacity:.85}.coclon-panel .cc-scope-active{box-shadow:inset 0 -2px 0 currentColor;border-radius:0;font-weight:600}.cc-notice{padding:12px 0;color:var(--cc-muted);font-size:13px}.cc-error{padding:10px 0;color:#b23d32}.cc-search{display:flex;gap:8px;margin:20px 0 16px}.cc-search input{min-width:0;flex:1;border:0;box-shadow:inset 0 0 0 1px var(--cc-line);background:transparent;border-radius:6px;padding:8px 12px}.cc-grid{display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px}.cc-people{display:flex;flex-direction:column;gap:4px}.cc-person{display:flex;align-items:center;gap:10px;text-align:left;width:100%}.cc-person[aria-pressed=true]{background:color-mix(in srgb,currentColor 7%,transparent)}.cc-avatar{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;background:color-mix(in srgb,currentColor 8%,transparent);border-radius:8px;overflow:hidden}.cc-avatar img{width:100%;height:100%;object-fit:cover}.cc-role{padding:16px 0;border-bottom:1px solid var(--cc-line)}.cc-role:first-of-type{padding-top:12px}.cc-role-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}.cc-role p{font-size:13px;color:var(--cc-muted);margin:6px 0 10px}.cc-role-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}.cc-role-foot span{font-size:12px;color:var(--cc-muted)}.cc-selected{font-size:13px;margin:16px 0;color:var(--cc-muted)}.coclon-panel a{color:inherit;text-underline-offset:3px}.cc-empty{padding:24px 0;color:var(--cc-muted);font-size:13px}@media(max-width:600px){.cc-grid{grid-template-columns:1fr;gap:16px}.cc-people{flex-direction:row;overflow-x:auto;padding-bottom:8px}.cc-person{flex:0 0 auto;width:auto}.cc-metrics{gap:20px}}`;
var avatar = (person, large = false) => h("span", { className: "cc-avatar" }, person.portraitUrl ? h("img", {
	src: person.portraitUrl,
	alt: large ? person.name + "的头像" : "",
	loading: "lazy",
	referrerPolicy: "no-referrer",
	onError: (event) => {
		event.currentTarget.hidden = true;
		event.currentTarget.parentElement.textContent = (person.name || "?").slice(0, 1);
	}
}) : (person.name || "?").slice(0, 1));
var link = (url, text) => h("a", {
	href: url,
	target: "_blank",
	rel: "noopener noreferrer"
}, text);
function UpdateControl({ request, installUpdate }) {
	const [update, setUpdate] = useState(null), [phase, setPhase] = useState(""), [notice, setNotice] = useState(""), [problem, setProblem] = useState("");
	const alive = useRef(true), locked = useRef(false);
	const key = (value) => "coclon.plugin-update:" + value.origin;
	const receipt = (value) => {
		try {
			const saved = JSON.parse(sessionStorage.getItem(key(value)) || "null");
			return saved?.from === value.current && saved.target === value.latest && Date.now() - saved.at < 36e5 ? saved : null;
		} catch {
			return null;
		}
	};
	const save = (value, status, message = "") => {
		try {
			sessionStorage.setItem(key(value), JSON.stringify({
				from: value.current,
				target: value.latest,
				status,
				message,
				at: Date.now()
			}));
		} catch {}
		window.dispatchEvent(new Event("coclon-plugin-update"));
	};
	const check = async (manual = false) => {
		if (locked.current) return;
		locked.current = true;
		setPhase("checking");
		setProblem("");
		setNotice("");
		try {
			const value = await request({ kind: "check_update" }), saved = receipt(value);
			if (alive.current) {
				setUpdate(saved?.status === "installed" ? {
					...value,
					available: false
				} : value);
				if (saved?.status === "installed") setNotice("新版已安装 · 重启 Harness 后生效");
				else if (saved?.status === "failed" && !manual) setProblem(saved.message);
			}
		} catch (e) {
			if (alive.current) setProblem(e.message);
		} finally {
			locked.current = false;
			if (alive.current) setPhase("");
		}
	};
	useEffect(() => {
		alive.current = true;
		check();
		const sync = () => check();
		window.addEventListener("coclon-plugin-update", sync);
		return () => {
			alive.current = false;
			window.removeEventListener("coclon-plugin-update", sync);
		};
	}, []);
	const install = async () => {
		if (locked.current || !update?.available) return;
		locked.current = true;
		setPhase("downloading");
		setProblem("");
		setNotice("");
		let outcome;
		try {
			const target = await request({
				kind: "prepare_update",
				version: update.latest,
				sha256: update.sha256
			});
			if (alive.current) setPhase("installing");
			const answer = await installUpdate(target.source);
			if (!answer.ok) throw Error("更新失败 · 当前连接保留，请重试");
			const result = answer.value;
			if (![
				"applied",
				"restart-required",
				"overridden"
			].includes(result.application)) throw Error("更新未完成 · 当前连接保留，请重试");
			outcome = { status: "installed" };
		} catch (e) {
			outcome = {
				status: "failed",
				message: e.message
			};
		} finally {
			locked.current = false;
			if (alive.current) setPhase("");
		}
		save(update, outcome.status, outcome.message);
		if (alive.current) await check();
	};
	return h("div", {
		className: "cc-update",
		"aria-label": "插件更新"
	}, h("div", { className: "cc-actions" }, h("span", { className: "cc-muted" }, update ? "v" + update.current : "版本"), h("button", {
		type: "button",
		disabled: Boolean(phase),
		onClick: () => check(true)
	}, phase === "checking" ? "检查中…" : "检查更新"), update?.available && h("button", {
		type: "button",
		className: "cc-primary",
		disabled: Boolean(phase),
		onClick: install
	}, phase === "downloading" ? "校验安装包…" : phase === "installing" ? "安装中…" : "更新至 " + update.latest)), h("p", {
		className: problem ? "cc-error" : "cc-muted",
		role: problem ? "alert" : "status"
	}, problem || notice || (update && !update.available ? "已是最新版" : "")));
}
function Panel({ request, installUpdate }) {
	const [state, setState] = useState(null), [scope, setScope] = useState("following"), [people, setPeople] = useState([]), [person, setPerson] = useState(""), [query, setQuery] = useState(""), [busy, setBusy] = useState(""), [error, setError] = useState(""), [pending, setPending] = useState("");
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
			query,
			scope
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
		refresh().catch((e) => alive.current && setError(e.message));
		return () => {
			alive.current = false;
			sequence.current++;
		};
	}, []);
	useEffect(() => {
		search().catch((e) => alive.current && setError(e.message));
	}, [scope]);
	const connect = async (mode) => {
		const answer = await request({
			kind: "connect",
			mode
		});
		if (!alive.current) return;
		if (answer.status === "connected") {
			setState(answer.state);
			setPending("");
			await search();
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
	const current = people.find((p) => p.slug === person), account = state?.account, origin = state?.origin || "", authorized = new Set((state?.roles || []).flatMap((r) => [r.id, r.slug]));
	return h("section", {
		className: "coclon-panel",
		"aria-label": "COCLON 控制面板"
	}, h("style", null, css + ".cc-grid{grid-template-columns:216px minmax(0,1fr);gap:32px}.cc-person{padding:12px!important;align-items:center;gap:12px!important}.cc-avatar{flex-basis:48px;width:48px;height:48px;border-radius:12px}.cc-person-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.cc-person-copy strong{font-size:14px;font-weight:500}.cc-person-copy small{font-size:12px;color:var(--cc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:134px}.cc-profile{display:flex;gap:20px;align-items:flex-start;padding:0 0 24px}.cc-profile .cc-avatar{flex-basis:88px;width:88px;height:104px;border-radius:14px;font-size:32px}.cc-profile-copy{min-width:0;flex:1}.cc-profile h3{font-size:24px;line-height:1.25;margin-bottom:6px}.cc-profile-headline{font-size:13px;font-weight:500}.cc-profile-intro{font-size:13px;color:var(--cc-muted);line-height:1.75;margin:12px 0!important;white-space:pre-line;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}.cc-profile a{font-size:12px}.cc-experience{margin:0 0 20px;padding:0;font-size:12px;color:var(--cc-muted)}.cc-experience p+p{margin-top:8px}.cc-roles-title{margin:4px 0 12px!important;font-size:12px!important;color:var(--cc-muted)}.cc-role{padding:18px!important;margin-bottom:10px;border:0;box-shadow:inset 0 0 0 1px var(--cc-line);border-radius:12px}.cc-role[data-selected=true]{background:color-mix(in srgb,currentColor 3%,transparent);box-shadow:inset 0 0 0 1.5px currentColor}.cc-role-head h4{font-size:16px;font-weight:500}.cc-role-head>span{white-space:nowrap}.cc-skills{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.cc-skills span{font-size:11px;padding:2px 7px;border-radius:4px;background:color-mix(in srgb,currentColor 6%,transparent);color:var(--cc-muted)}.cc-role p{line-height:1.75;margin:10px 0 14px}.cc-role-foot span:before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;margin-right:6px}.cc-top{margin-bottom:16px}.cc-metrics{padding-bottom:8px}.cc-metrics strong{font-size:18px}.cc-selected{padding:10px 0 0}.cc-empty:empty,.cc-error:empty{display:none}@media(max-width:600px){.cc-grid{grid-template-columns:1fr;gap:20px}.cc-people{gap:6px}.cc-person{max-width:200px;padding:10px!important}.cc-avatar{flex-basis:40px;width:40px;height:40px}.cc-profile{gap:16px}.cc-profile .cc-avatar{flex-basis:72px;width:72px;height:88px}.cc-profile h3{font-size:22px}.cc-profile-intro{-webkit-line-clamp:4}.cc-role{padding:16px!important}.cc-role-head h4{font-size:15px}.cc-role-head{align-items:start}}.cc-update{margin-left:auto}.cc-update p{max-width:32ch;text-align:right}.cc-update .cc-error{font-size:12px;padding:0}.cc-top{align-items:flex-start}@media(max-width:600px){.cc-top{gap:12px}.cc-update{margin-left:0;order:3;width:100%}.cc-update p{text-align:left}.cc-top>button{margin-left:auto}}"), h("header", { className: "cc-top" }, h("div", null, h("h3", null, "COCLON"), h("p", { className: "cc-muted" }, "人物 · 赛博分身")), h(UpdateControl, {
		request,
		installUpdate
	}), h("button", {
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
	}, error || state?.problem || ""), h("div", {
		className: "cc-actions",
		"aria-label": "人物范围"
	}, ["following", "all"].map((value) => h("button", {
		type: "button",
		key: value,
		"aria-pressed": scope === value,
		className: scope === value ? "cc-scope-active" : "",
		disabled: Boolean(busy),
		onClick: () => setScope(value)
	}, value === "following" ? "我的关注" : "全部人物"))), h("form", {
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
	}, avatar(p), h("span", { className: "cc-person-copy" }, h("strong", null, p.name), h("small", null, p.headline || p.roles.map((r) => r.title).join(" · ")))))), h("div", null, current && h(react.default.Fragment, null, h("div", { className: "cc-profile" }, avatar(current, true), h("div", { className: "cc-profile-copy" }, h("h3", null, current.name), h("button", {
		type: "button",
		disabled: Boolean(busy) || !state?.connected || account?.mode === "trial",
		"aria-pressed": current.followed,
		onClick: () => run("保存关注", async () => {
			await request({
				kind: "follow",
				slug: current.slug,
				followed: !current.followed
			});
			await search();
		})
	}, current.followed ? "已关注" : "关注"), current.headline && h("p", { className: "cc-profile-headline" }, current.headline), current.intro && h("p", { className: "cc-profile-intro" }, current.intro), origin && link(origin + "/creators/" + encodeURIComponent(current.slug), "查看个人主页 ↗"))), current.experience?.length > 0 && h("div", { className: "cc-experience" }, current.experience.map((text, index) => h("p", { key: index }, text))), h("h4", { className: "cc-roles-title" }, "Ta 的赛博分身 · " + current.roles.length)), current?.roles.map((role) => {
		const allowed = authorized.has(role.id) || authorized.has(role.slug);
		return h("article", {
			className: "cc-role",
			key: role.id
		}, h("div", { className: "cc-role-head" }, h("h4", null, role.title), h("span", { className: "cc-muted" }, role.price + " 积分 / 次")), role.summary && h("p", null, role.summary), role.skills?.length > 0 && h("div", { className: "cc-skills" }, role.skills.map((skill) => h("span", { key: skill }, skill))), h("div", { className: "cc-role-foot" }, h("span", null, allowed ? "可调用" : state?.connected ? "需授权" : "连接后调用")));
	}))) : h("p", { className: "cc-empty" }, state ? scope === "following" ? "暂无关注人物 · 在全部人物中关注 Ta" : "暂无匹配人物" : "读取人物…"), h("p", {
		className: "cc-muted",
		style: { marginTop: 20 }
	}, "按任务灵活调用 · 支持多个分身协作 · 沿用平台计费与授权"));
}
var inject = ["slots", "remote"];
async function apply(ctx) {
	const unmount = await ctx.remote.$mount(TYPERT_REMOTE);
	ctx.effect(() => unmount);
	ctx.inject(["remote.coclonControl", "remote.pluginManager"], (inner) => inner.slots.inject("plugins.bundle.config", () => inner.slots.register({
		name: "plugins.bundle.config",
		key: "dsh-plugin-coclon",
		inject: () => ({
			installUpdate: (source) => inner.remote.pluginManager.installBundle(source, {
				enabled: true,
				saveExact: true,
				registry: "https://registry.npmjs.org/"
			}),
			request: async (input) => {
				const answer = await inner.remote.coclonControl.action(input);
				if (!answer.ok) throw Error(answer.error?.message || "COCLON 请求未完成");
				return answer.value;
			}
		})
	}, Panel)));
}
exports.apply = apply;
exports.inject = inject;

return module.exports;}});
