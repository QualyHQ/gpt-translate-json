#!/usr/bin/env node
import { t as e } from "./src-CCxh1G8T.js";
//#region src/cli.ts
var t = (e) => {
	let t = e.split("=");
	return t.length === 2 && t[0].startsWith("--") ? {
		key: t[0].slice(2),
		value: /,/.test(t[1]) ? t[1].split(",") : t[1]
	} : {
		key: "error",
		value: `- wrong option: "${t[0]}"`
	};
}, n = (e, t) => !!(t === e || t === "array" && Array.isArray(e) || t === "string" && typeof e == "string" || t === "number" && typeof e == "number"), r = (e, t) => `- option "${e}": wrong value ${JSON.stringify(t)}`, i = (e) => `- missing option: "${e}"`, a = process.argv.slice(2), o = {}, s = [];
for (let e of a) {
	let { key: i, value: a } = t(e);
	switch (i) {
		case "apiKey":
			n(a, "string") ? o.apiKey = a : s.push(r(i, a));
			break;
		case "provider":
			n(a, "string") ? o.provider = a : s.push(r(i, a));
			break;
		case "model":
			n(a, "string") ? o.model = a : s.push(r(i, a));
			break;
		case "maxTokens":
			n(+a, "number") ? o.maxTokens = +a : s.push(r(i, a));
			break;
		case "rules":
			n(a, "array") ? o.rules = a : n(a, "string") ? o.rules = [a] : s.push(r(i, a));
			break;
		case "basePath":
			n(a, "string") ? o.basePath = a : s.push(r(i, a));
			break;
		case "assetsPath":
			n(a, "string") ? o.assetsPath = a : s.push(r(i, a));
			break;
		case "langs":
			n(a, "array") ? o.langs = a : n(a, "string") ? o.langs = [a] : s.push(r(i, a));
			break;
		case "originalLang":
			n(a, "string") ? o.originalLang = a : s.push(r(i, a));
			break;
		case "error":
			s.push(a);
			break;
		default: s.push(`- unknown option: "${i}"`);
	}
}
if (o.apiKey || s.push(i("apiKey")), o.apiKey || s.push(i("model")), o.maxTokens || s.push(i("maxTokens")), o.langs || s.push(i("langs")), o.originalLang || s.push(i("originalLang")), s.length > 0) {
	console.log("\x1B[36m%s\x1B[0m", "GPT Translate Json options errors:");
	for (let e of s) console.log("\x1B[33m%s\x1B[0m", e);
	process.exitCode = 1;
}
console.log("\x1B[36m%s\x1B[0m", "GPT Translate Json"), console.log("\x1B[32m%s\x1B[0m", "translating files..."), e(o);
//#endregion
