// Extracted from @deepseek-ai/dsh-client-ui-directory-picker-browse (lib/client.js); region lib/types/client/flow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The browse picking occupant (package-internal; the `./client` surface
		* exposes only the Loader exports). Same-package tests exercise it directly
		* through this module.
		*/
		/**
		* Flow occupant: adapts the hole's owner conversation onto the browser
		* dialog — a confirmed directory is the picked path, dismissal is the
		* cancellation. Browse failures (unreadable targets, create conflicts) stay
		* inside the dialog's own alert surfaces, so the owner's `onError` arm is
		* never driven by this occupant.
		* @param props - owner conversation plus the injected browse face.
		* @returns the dialog element (renders nothing while closed).
		*/
		function BrowseDirectoryFlow(props) {
			return (0, react.createElement)(DirectoryBrowser, {
				open: props.open,
				busy: props.busy,
				listDirectory: props.listDirectory,
				createDirectory: props.createDirectory,
				t: props.t,
				onOpen: props.onPicked,
				onClose: props.onCancel
			});
		}
