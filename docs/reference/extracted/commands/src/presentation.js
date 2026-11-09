// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/presentation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Row names per section, highest usage first; rows outside both lists close the Commands section in catalog order. */
		const SECTION_ROWS = {
			add: [
				"file",
				"goal",
				"plan",
				"feedback"
			],
			commands: [
				"compact",
				"permission",
				"model",
				"export"
			]
		};
		/** One built-in Host command's face, keyed by its dictionary entries. */
		function hostFace(name, icon) {
			return [name, {
				label: `label.${name}`,
				description: `description.${name}`,
				icon
			}];
		}
		/** Built-in Host commands whose client face this package owns. */
		const HOST_FACES = new Map([
			hostFace("goal", _deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular),
			hostFace("plan", _deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular),
			hostFace("feedback", _deepseek_ai_dsh_client_ui_primitives.IconPaperPlaneOutlineRegular),
			hostFace("compact", _deepseek_ai_dsh_client_ui_primitives.IconCompactOutlineRegular),
			hostFace("permission", _deepseek_ai_dsh_client_ui_primitives.PermissionIconFullAccessRegular),
			hostFace("export", _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular)
		]);
		/**
		* The localized menu face of a catalog row.
		* @param descriptor - effective Host command descriptor.
		* @param t - the `command` namespace translator.
		* @returns title, description, and glyph for a built-in command; undefined
		* for any other row, which keeps its catalog description.
		*/
		function builtinRowFace(descriptor, t) {
			const name = builtinCommandName(descriptor);
			const face = name === void 0 ? void 0 : HOST_FACES.get(name);
			return face === void 0 ? void 0 : {
				label: t(face.label),
				description: t(face.description),
				icon: face.icon
			};
		}
		/**
		* Arrange the empty-query menu: the Add section, then the Commands section,
		* each in usage order, with unlisted rows closing Commands in their input
		* order; each row carries its section heading.
		* @param rows - the visible candidates in catalog-then-contribution order.
		* @param t - the `command` namespace translator.
		* @returns the sectioned rows.
		*/
		function sectionRows(rows, t) {
			const listed = new Set([...SECTION_ROWS.add, ...SECTION_ROWS.commands]);
			const byName = new Map(rows.map((row) => [row.name, row]));
			const pick = (names) => names.flatMap((name) => {
				const row = byName.get(name);
				return row === void 0 ? [] : [row];
			});
			const add = pick(SECTION_ROWS.add).map((row) => ({
				...row,
				section: t("section.add")
			}));
			const commands = [...pick(SECTION_ROWS.commands), ...rows.filter((row) => !listed.has(row.name))].map((row) => ({
				...row,
				section: t("section.commands")
			}));
			return [...add, ...commands];
		}
