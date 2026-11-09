// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** This implementation's identity in the tab system: the key its body and title register under. */
		const SCHEDULE_TASK_ID = "@deepseek-ai/dsh-client-ui-schedule/task";
		/** The tab kind this package owns. */
		const SCHEDULE_TASK_KIND = "scheduleTask";
		/**
		* The task type's registry definition.
		*
		* The chip text captured here is a constant because an open names only a kind;
		* `ScheduleTaskTabTitle` replaces it with the shown task's stored title.
		* @param t - namespace-bound translate, read fresh on every title call.
		* @returns the definition to register.
		*/
		function scheduleTaskDefinition(t) {
			return {
				id: SCHEDULE_TASK_ID,
				kind: SCHEDULE_TASK_KIND,
				priority: "builtin",
				title: () => t("detail.label")
			};
		}
		/**
		* Narrow one tab's navigation parameters to this type's task binding.
		* @param params - the tab record's navigation parameters.
		* @returns the Session and task the tab shows, or undefined for another type's parameters.
		*/
		function scheduleTaskParams(params) {
			if (params === void 0 || !("sessionId" in params) || !("id" in params)) return void 0;
			return {
				sessionId: params.sessionId,
				id: params.id
			};
		}
