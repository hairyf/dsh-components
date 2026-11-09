// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/contact-url.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Build an external questionnaire URL without authentication credentials.
		* @param config - questionnaire destination and supported source option.
		* @param context - account, build and environment facts sampled by the caller.
		* @returns questionnaire URL with hidden, optionally prefilled context fields.
		*/
		function contactUrl(config, context) {
			const url = new URL(config.contactFormUrl);
			const ratio = Number.isFinite(context.pixelRatio) ? context.pixelRatio : 1;
			const width = Math.round(context.width * ratio);
			const height = Math.round(context.height * ratio);
			const deviceInfo = [context.deviceInfo];
			if (width > 0 && height > 0) deviceInfo.push(`screen_resolution=${width}x${height}`);
			const fields = {
				uid: context.uid,
				source: config.contactSource,
				harness_version: context.version,
				device_info: deviceInfo.filter(Boolean).join("; ")
			};
			for (const [name, value] of Object.entries(fields)) {
				url.searchParams.set(`hide_${name}`, "1");
				url.searchParams.delete(`prefill_${name}`);
				if (value) url.searchParams.set(`prefill_${name}`, value);
			}
			for (const name of [
				"os_version",
				"device_brand",
				"app_locale",
				"screen_resolution",
				"app_version",
				"device_model"
			]) {
				url.searchParams.delete(`prefill_${name}`);
				url.searchParams.delete(`hide_${name}`);
			}
			return url.href;
		}
