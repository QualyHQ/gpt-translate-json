import { readFile as e, readdir as t, writeFile as n } from "fs/promises";
import { existsSync as r, mkdirSync as i } from "fs";
import { normalize as a } from "path";
import o from "openai";
//#region src/providers.ts
var s = {
	openai: {},
	gemini: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" }
};
function c(e) {
	let t = s[e];
	if (!t) {
		let t = Object.keys(s).join(", ");
		throw Error(`Unknown provider "${e}". Available providers: ${t}`);
	}
	return t;
}
//#endregion
//#region src/merge.ts
function l(e, t, n) {
	let r = 0, i = t.length;
	for (; r < i;) {
		let a = t[r++];
		e[a] = e[a] && !n ? e[a] : r === i ? n : typeof e[a] == "object" ? e[a] : {}, e = e[a];
	}
}
function u(e, t) {
	let n = Object.assign({}, e);
	return d(e) && d(t) && Object.keys(t).forEach((r) => {
		d(t[r]) && r in e ? n[r] = u(e[r], t[r]) : Object.assign(n, { [r]: t[r] });
	}), n;
}
function d(e) {
	return typeof e == "object" && !Array.isArray(e);
}
//#endregion
//#region src/json-functions.ts
var f = (e) => JSON.parse(e, (e, t) => t === null || t === "" ? void 0 : t), p = (e) => JSON.stringify(e, h, 2), m = (e, t = "", n = /* @__PURE__ */ new Map()) => {
	for (let r in e) {
		let i = t ? `${t}.${r}` : r, a = e[r];
		Array.isArray(a) ? a.forEach((e, t) => {
			let r = `${i}.${t}`;
			typeof e == "object" && e ? m(e, r, n) : n.set(r, e);
		}) : typeof a == "object" && a ? m(a, i, n) : n.set(i, a);
	}
	return n;
};
function h(e, t) {
	return typeof t == "string" ? t.replace(/\\/g, "") : t;
}
//#endregion
//#region src/index.ts
async function g(s) {
	let d = {
		...s,
		provider: s.provider ?? "openai",
		basePath: s.basePath ?? "./",
		rules: s.rules ?? [
			"do not translate proper names",
			"do not translate texts enclosed in double braces {{}}",
			"do not translate html tags",
			"do not translate URLs"
		],
		assetsPath: s.assetsPath ?? "i18n"
	}, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set(), y = c(d.provider), b = new o({
		apiKey: d.apiKey,
		...y.baseURL && { baseURL: y.baseURL }
	}), x = 0, S = async () => {
		let t = a(`${d.basePath}/${d.assetsPath}/.metadata`);
		if (r(t)) {
			let n = await e(`${t}/translated.json`, "utf8");
			if (n) {
				let e = JSON.parse(n);
				_ = new Set(e);
			}
			let r = await e(`${t}/translated-langs.json`, "utf8");
			if (r) {
				let e = JSON.parse(r);
				v = new Set(e);
			}
		}
	}, C = async () => {
		for (let n of d.langs) {
			let i = a(`${d.basePath}/${d.assetsPath}/${n}`);
			if (r(i)) {
				let r = await t(i);
				if (r.length > 0) {
					let t = /* @__PURE__ */ new Map();
					for (let n of r) {
						let r = {}, a = await e(`${i}/${n}`, "utf8");
						a && (r = f(a)), t.set(n, r);
					}
					h.set(n, t);
				}
			}
		}
	}, w = (e, t, n) => {
		let r = `Translate the following array of texts from ${new Intl.DisplayNames(["en"], { type: "language" }).of(d.originalLang)} to ${e}: `;
		return r += n, r += " Rules: ", r += t.join(";"), r += ". ", r += "You have to return only the translated array in the same order, as valid JSON array, without JSON md markers, and nothing else.", r;
	}, T = (e) => [{
		role: "user",
		content: e
	}], E = (e, t = 4, n = 100) => e / t * 2 + n, D = (e) => {
		let t = JSON.stringify(e).length;
		function* n(e, t) {
			for (let n = 0; n < e.length; n += t) yield e.slice(n, n + t);
		}
		let r = E(t), i = Math.ceil(r / d.maxTokens);
		return [...n(e, Math.ceil(e.length / i))];
	}, O = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let [n, r] of e) t.set(n, m(r));
		return t;
	}, k = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let [n, r] of e) {
			let e = /* @__PURE__ */ new Map();
			for (let [t, n] of r) _.has(t) || e.set(t, n);
			t.set(n, e);
		}
		return t;
	}, A = async (e, t, n) => {
		let r = new Intl.DisplayNames(["en"], { type: "language" }).of(n) || n, i = /* @__PURE__ */ new Map();
		try {
			let e = D(Array.from(t.values()));
			e = e.filter((e) => e.length > 0);
			let n = [];
			for (let t of e) {
				let e = T(w(r, d.rules, JSON.stringify(t)));
				try {
					let t = await b.chat.completions.create({
						model: d.model,
						messages: e,
						temperature: 0,
						n: 1
					});
					if (t?.choices) {
						let e = t.choices[0].message?.content;
						if (e) {
							let t = JSON.parse(e);
							n = [...n, ...t];
						}
						x += t.usage?.total_tokens ?? 0;
					} else throw Error(`${d.provider} API - No response`);
				} catch (e) {
					throw Error(`${d.provider} API - ${e?.message}`);
				}
			}
			let a = Array.from(t.keys());
			if (a.length === n.length) a.forEach((e, t) => {
				i.set(e, n[t]);
			});
			else throw Error("Translations mismatching");
		} catch (t) {
			throw Error(`${e}: ${t.message}`);
		}
		return {
			filename: e,
			translatedData: i
		};
	}, j = async (e, t) => {
		let n = [];
		for (let [r, i] of t) n.push(A(r, i, e));
		let r = await Promise.allSettled(n), i = /* @__PURE__ */ new Map();
		r.forEach((e) => {
			e.status === "rejected" && console.log("\x1B[33m%s\x1B[0m", e.reason), e.status === "fulfilled" && i.set(e.value.filename, e.value.translatedData);
		}), g.set(e, i);
	}, M = async () => {
		let e = [], t = h.get(d.originalLang);
		if (t) {
			let n = O(t), r = k(n);
			for (let t of d.langs) t !== d.originalLang && (v.has(t) ? e.push(j(t, r)) : e.push(j(t, n)));
			await Promise.all(e);
		} else throw Error("Original asset not found");
	}, N = async (e, t, o) => {
		let s = a(`${d.basePath}/${d.assetsPath}/${o}`);
		r(s) || i(s, { recursive: !0 });
		let c = p(e), l = a(`${s}/${t}`);
		await n(l, c), console.log(l);
	};
	await S(), await C(), await M(), await (async () => {
		for (let [e, t] of g) {
			for (let [n, r] of t) {
				let t = u(h.get(d.originalLang)?.get(n) || {}, h.get(e)?.get(n) || {});
				Array.from(r.keys()).forEach((e) => {
					_.add(e), l(t, e.split("."), r.get(e) || "");
				}), await N(t, n, e);
			}
			v.add(e);
		}
	})(), await (async () => {
		let e = a(`${d.basePath}/${d.assetsPath}/.metadata`);
		r(e) || i(e, { recursive: !0 });
		let t = p(Array.from(_)), o = a(`${e}/translated.json`);
		await n(o, t);
		let s = p(Array.from(v)), c = a(`${e}/translated-langs.json`);
		await n(c, s), console.log(o), console.log(c);
	})(), console.log("\x1B[36m%s\x1B[0m", "Total tokens: " + x);
}
//#endregion
export { g as t };
