// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/PreviewFrame.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The text preview's layout: an optional banner, the path header, and the
		* content row, with the workspace navigator Factories in fixed positions.
		*
		* Every preview state renders this one Component, so the navigator, its
		* header toggle, and the file handoff keep their DOM nodes, focus, and scroll position while the
		* preview moves between unsupported, loading, and text. The two Factory
		* positions are memoized Components whose props are only the tab hook and
		* `renderFactorySlot`; a preview-only update, such as a recorded scroll,
		* does not re-render them.
		*/
		/** The workspace navigator after the preview's content. */
		const NavigatorSeat = (0, react.memo)(function NavigatorSeat({ useTabInfo, renderFactorySlot }) {
			const { tab } = useTabInfo();
			return renderFactorySlot("sidebar.files.navigator", {
				useTabInfo,
				page: false,
				onOpen: (0, react.useCallback)((address) => {
					tab.actions.openResource(address, { replaceTab: true });
				}, [tab.actions])
			});
		});
		/** The navigator's toggle at the header's end. */
		const NavigatorToggleSeat = (0, react.memo)(function NavigatorToggleSeat({ useTabInfo, renderFactorySlot }) {
			return renderFactorySlot("sidebar.files.navigator.toggle", { useTabInfo });
		});
		/**
		* The text preview's layout for every preview state.
		* @param props - the header and content parts, the navigator inputs, and the root's data attributes.
		* @returns the preview root.
		*/
		function PreviewFrame({ path, pathTrigger, banner, tools, handoff, children, useTabInfo, renderFactorySlot, ...data }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TextPreview_module_css_default.preview,
				...data,
				children: [
					banner,
					(0, react_jsx_runtime.jsxs)("div", {
						className: TextPreview_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, {
								path,
								className: TextPreview_module_css_default.path,
								"data-textpreview-path": true,
								...pathTrigger
							}),
							tools,
							handoff,
							(0, react_jsx_runtime.jsx)(NavigatorToggleSeat, {
								useTabInfo,
								renderFactorySlot
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TextPreview_module_css_default.content,
						"data-textpreview-content": true,
						children: [children, (0, react_jsx_runtime.jsx)(NavigatorSeat, {
							useTabInfo,
							renderFactorySlot
						})]
					})
				]
			});
		}
