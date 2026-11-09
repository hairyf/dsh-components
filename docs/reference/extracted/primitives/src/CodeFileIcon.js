// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/CodeFileIcon.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render one full-color square code-file glyph from the embedded icon set.
* @param props - Detailed code type, optional size, and optional CSS class.
* @returns The selected decorative SVG with its identifying palette intact.
*/
function CodeFileIcon({ type, size = 20, className }) {
	const instanceId = `dsh-code-icon-${useId().replaceAll(":", "")}`;
	return jsx("svg", {
		width: size,
		height: size,
		className,
		viewBox: "0 0 20 20",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		dangerouslySetInnerHTML: { __html: CODE_FILE_ARTWORK[type].replaceAll(CODE_FILE_ICON_ID_TOKEN, instanceId) }
	});
}
const CODE_FILE_TYPE_SET = new Set([
	"angular",
	"c",
	"clojure",
	"cmake",
	"cpp",
	"csharp",
	"css",
	"dart",
	"docker",
	"elixir",
	"env",
	"erlang",
	"flutter",
	"git",
	"go",
	"graphql",
	"haskell",
	"ini",
	"java",
	"javascript",
	"json",
	"kotlin",
	"lua",
	"makefile",
	"node",
	"objective-c",
	"perl",
	"php",
	"powershell",
	"protobuf",
	"python",
	"r",
	"react",
	"ruby",
	"rust",
	"scala",
	"shell",
	"solidity",
	"sql",
	"svelte",
	"swift",
	"toml",
	"typescript",
	"vue",
	"wasm",
	"xml",
	"yaml",
	"zig"
]);
const FILE_NAME_TYPES = {
	".bash_profile": "shell",
	".bashrc": "shell",
	".env": "env",
	".gitattributes": "git",
	".gitconfig": "git",
	".gitignore": "git",
	".gitmodules": "git",
	".mailmap": "git",
	".profile": "shell",
	".zprofile": "shell",
	".zshrc": "shell",
	"bsdmakefile": "makefile",
	"cmakelists.txt": "cmake",
	"commit_editmsg": "git",
	"compose.yaml": "docker",
	"compose.yml": "docker",
	"docker-compose.yaml": "docker",
	"docker-compose.yml": "docker",
	"dockerfile": "docker",
	"gemfile": "ruby",
	"gnumakefile": "makefile",
	"guardfile": "ruby",
	"makefile": "makefile",
	"npm-shrinkwrap.json": "node",
	"package-lock.json": "node",
	"package.json": "node",
	"podfile": "ruby",
	"rakefile": "ruby"
};
const FILE_NAME_PREFIX_TYPES = [["dockerfile.", "docker"], [".env.", "env"]];
const FILE_NAME_SUFFIX_TYPES = [
	[".component.ts", "angular"],
	[".component.html", "angular"],
	[".directive.ts", "angular"],
	[".service.ts", "angular"],
	[".module.ts", "angular"],
	[".pipe.ts", "angular"],
	[".guard.ts", "angular"],
	[".interceptor.ts", "angular"],
	[".dockerfile", "docker"]
];
const EXTENSION_TYPES$1 = {
	"bash": "shell",
	"c": "c",
	"c++": "cpp",
	"cc": "cpp",
	"cfg": "ini",
	"cjs": "javascript",
	"clj": "clojure",
	"cljc": "clojure",
	"cljs": "clojure",
	"cmake": "cmake",
	"cpp": "cpp",
	"cs": "csharp",
	"csh": "shell",
	"css": "css",
	"csx": "csharp",
	"cts": "typescript",
	"cxx": "cpp",
	"dart": "dart",
	"dtd": "xml",
	"edn": "clojure",
	"env": "env",
	"erl": "erlang",
	"es6": "javascript",
	"escript": "erlang",
	"ex": "elixir",
	"exs": "elixir",
	"fish": "shell",
	"gemspec": "ruby",
	"go": "go",
	"gql": "graphql",
	"graphql": "graphql",
	"h": "c",
	"h++": "cpp",
	"hh": "cpp",
	"hpp": "cpp",
	"hrl": "erlang",
	"hs": "haskell",
	"hxx": "cpp",
	"ini": "ini",
	"ipp": "cpp",
	"java": "java",
	"js": "javascript",
	"json": "json",
	"json5": "json",
	"jsonc": "json",
	"jsx": "react",
	"ksh": "shell",
	"kt": "kotlin",
	"kts": "kotlin",
	"lhs": "haskell",
	"lua": "lua",
	"m": "objective-c",
	"mak": "makefile",
	"mjs": "javascript",
	"mk": "makefile",
	"mm": "objective-c",
	"mts": "typescript",
	"node": "node",
	"pch": "objective-c",
	"php": "php",
	"php3": "php",
	"php4": "php",
	"php5": "php",
	"phps": "php",
	"phtml": "php",
	"pl": "perl",
	"plist": "xml",
	"pm": "perl",
	"pod": "perl",
	"proto": "protobuf",
	"ps1": "powershell",
	"psd1": "powershell",
	"psm1": "powershell",
	"py": "python",
	"pyi": "python",
	"pyw": "python",
	"pyx": "python",
	"r": "r",
	"rake": "ruby",
	"rb": "ruby",
	"rmd": "r",
	"rs": "rust",
	"sc": "scala",
	"scala": "scala",
	"sh": "shell",
	"sol": "solidity",
	"sql": "sql",
	"svelte": "svelte",
	"swift": "swift",
	"t": "perl",
	"tcsh": "shell",
	"toml": "toml",
	"tpp": "cpp",
	"ts": "typescript",
	"tsx": "react",
	"vue": "vue",
	"wasm": "wasm",
	"wast": "wasm",
	"wat": "wasm",
	"xml": "xml",
	"xsd": "xml",
	"xsl": "xml",
	"xslt": "xml",
	"yaml": "yaml",
	"yml": "yaml",
	"zig": "zig",
	"zsh": "shell"
};
const LINK_CODE_EXTENSIONS = new Set([
	"ts",
	"tsx",
	"js",
	"jsx",
	"mjs",
	"cjs",
	"cts",
	"mts",
	"css",
	"scss",
	"sass",
	"less",
	"html",
	"htm",
	"vue",
	"svelte",
	"astro",
	"json",
	"jsonc",
	"json5",
	"yaml",
	"yml",
	"toml",
	"xml",
	"ini",
	"env",
	"sh",
	"bash",
	"zsh",
	"fish",
	"ps1",
	"bat",
	"cmd",
	"py",
	"pyi",
	"rb",
	"rs",
	"go",
	"java",
	"kt",
	"kts",
	"c",
	"cc",
	"cpp",
	"cxx",
	"h",
	"hh",
	"hpp",
	"cs",
	"php",
	"swift",
	"sql",
	"proto",
	"graphql",
	"gql",
	"lua",
	"r",
	"pl",
	"scala",
	"clj",
	"cljs",
	"ex",
	"exs",
	"erl",
	"hs",
	"dart"
]);
function basename$1(path) {
	return path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
}
/**
* Test whether a resolved file type uses the full-color code-icon set.
* @param type - Resolved file-type string.
* @returns Whether the value is a detailed code-file type.
*/
function isCodeFileType(type) {
	return CODE_FILE_TYPE_SET.has(type);
}
/**
* Test whether an extension belongs to the established coarse link-icon code category.
* @param extension - Extension without a leading dot.
* @returns Whether clickable links keep the code glyph for this extension.
*/
function isLinkCodeExtension(extension) {
	return LINK_CODE_EXTENSIONS.has(extension.toLowerCase());
}
/**
* Resolve the most specific code/configuration icon according to the supplied map priority.
* @param name - Lowercase basename.
* @param extension - Lowercase extension without the leading dot.
* @param context - Optional project-file snapshot for context-sensitive matches.
* @returns The detailed code type, or null when the traditional file classifier owns the path.
*/
function classifyCodeFileType(name, extension, context) {
	const exact = FILE_NAME_TYPES[name];
	if (exact !== void 0) return exact;
	for (const [prefix, type] of FILE_NAME_PREFIX_TYPES) if (name.startsWith(prefix)) return type;
	for (const [suffix, type] of FILE_NAME_SUFFIX_TYPES) if (name.endsWith(suffix)) return type;
	if (extension === "dart" && context !== void 0) {
		if ((Object.entries(context.files).find(([path]) => basename$1(path).toLowerCase() === "pubspec.yaml")?.[1])?.includes("flutter:") === true) return "flutter";
	}
	return EXTENSION_TYPES$1[extension] ?? null;
}
