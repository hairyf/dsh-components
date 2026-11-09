// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/document/unviewable.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Known binary container suffixes with no registered renderer. The preview
* owner shows these the unsupported empty state instead of the plain-text
* fallback; any renderer registration for a suffix takes precedence because
* the owner consults this list only when no implementation matches. A suffix
* belongs here only when its bytes are never readable text — an uncertain
* suffix stays out and keeps the plain-text fallback.
*/
const UNVIEWABLE_BINARY_EXTENSIONS = [
	"mp4",
	"mov",
	"avi",
	"mkv",
	"webm",
	"flv",
	"wmv",
	"m4v",
	"mp3",
	"wav",
	"flac",
	"ogg",
	"m4a",
	"aac",
	"wma",
	"opus",
	"zip",
	"gz",
	"tgz",
	"bz2",
	"xz",
	"zst",
	"7z",
	"rar",
	"tar",
	"jar",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
	"odt",
	"ods",
	"odp",
	"pages",
	"numbers",
	"exe",
	"dll",
	"so",
	"dylib",
	"bin",
	"o",
	"class",
	"pyc",
	"wasm",
	"ttf",
	"otf",
	"woff",
	"woff2",
	"eot",
	"dmg",
	"iso",
	"img",
	"sqlite",
	"db",
	"psd",
	"ai",
	"sketch",
	"tiff",
	"tif",
	"heic",
	"heif",
	"avif"
];
/**
* Whether a filename's suffix is a known binary container that no renderer claims.
* @param path - decoded filename or file path.
* @returns true when the suffix belongs to the unviewable binary list.
*/
function unviewableBinaryPath(path) {
	return matchedSuffixLength(documentFileName(path), UNVIEWABLE_BINARY_EXTENSIONS) > 0;
}
