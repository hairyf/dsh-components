// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/ToolCallTree.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Root/subcall Tool composition with one keyed atomic dispatch path. */
		function toolCallPhase(block) {
			if ("kind" in block) return {
				phase: "result",
				block
			};
			return block.phase === "preparing" ? {
				phase: "preparing",
				block
			} : {
				phase: "start",
				block
			};
		}
		/** Resolve a Tool call's wire name from its current stage. */
		function callName(call) {
			return call.phase === "result" ? call.block.call?.name ?? "" : call.block.name;
		}
		/** One atomic call dispatched through the Tool-owned keyed slot. */
		const ToolCall = (0, react.memo)(function ToolCall({ renderSlot, callId, toolName, call, openFile, renderFallback, cwd, home, inspectCall, loadImage, useDisclosure, children }) {
			const owner = (0, react.useMemo)(() => ({
				callId,
				toolName,
				...call,
				openFile,
				cwd,
				home,
				loadImage,
				useDisclosure,
				inspect: inspectCall === void 0 ? void 0 : () => {
					inspectCall(callId);
				}
			}), [
				callId,
				toolName,
				call,
				openFile,
				cwd,
				home,
				loadImage,
				inspectCall,
				useDisclosure
			]);
			const autoReviewDenied = (0, react.useMemo)(() => call.phase === "result" && toolRowModel(toolName, call.block).autoReviewDenial !== null, [toolName, call]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolCallTree_module_css_default.callRow,
				"data-chat-anchor-key": `call:${callId}`,
				"data-chat-call-id": callId,
				children: [autoReviewDenied ? renderFallback(owner) : renderSlot("tool.call.toolview", owner, {
					entryKey: toolName,
					fallback: renderFallback(owner)
				}), children]
			});
		});
		const ToolCallBranch = (0, react.memo)(function ToolCallBranch({ renderSlot, block, cwd, home, openFile, renderFallback, inspectCall, loadImage, useDisclosure }) {
			const call = (0, react.useMemo)(() => toolCallPhase(block), [block]);
			return (0, react_jsx_runtime.jsx)(ToolCall, {
				renderSlot,
				callId: call.block.callId,
				toolName: callName(call),
				call,
				openFile,
				renderFallback,
				cwd,
				home,
				inspectCall,
				useDisclosure,
				loadImage,
				children: call.phase !== "preparing" && call.block.subCalls.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
					className: ToolCallTree_module_css_default.subCalls,
					"data-subcalls": true,
					children: call.block.subCalls.map((child) => (0, react_jsx_runtime.jsx)(ToolCallBranch, {
						renderSlot,
						block: child,
						cwd,
						home,
						openFile,
						renderFallback,
						inspectCall,
						useDisclosure,
						loadImage
					}, child.callId))
				}) : null
			});
		});
		/**
		* Render one root Tool call and its recursive children through the same
		* atomic keyed dispatch.
		* @param props - whole-Tool owner data and the Tool-owned child-slot share.
		* @returns the Tool call tree.
		*/
		function ToolCallTree({ renderSlot, node, cwd, openFile, inspectCall, loadImage, useDisclosure, useHostInfo, t, useContextMenu, sessionId, resolveFilePath }) {
			const { getTriggerProps } = useContextMenu();
			const getFileTriggerProps = (0, react.useCallback)((path) => getTriggerProps(() => ({
				kind: "file",
				value: {
					sessionId,
					path: resolveFilePath(path)
				}
			})), [
				getTriggerProps,
				sessionId,
				resolveFilePath
			]);
			const renderFallback = (0, react.useCallback)((owner) => (0, react_jsx_runtime.jsx)(GenericToolCard, {
				...owner,
				t,
				getFileTriggerProps
			}), [t, getFileTriggerProps]);
			const home = useHostInfo((info) => info.home);
			return (0, react_jsx_runtime.jsx)(ToolCallBranch, {
				renderSlot,
				block: node.data.root,
				cwd,
				home,
				openFile,
				renderFallback,
				inspectCall,
				useDisclosure,
				loadImage
			});
		}
