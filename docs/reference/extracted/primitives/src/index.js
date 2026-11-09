// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/icons/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Shared current-color product icons. Names identify the glyph and weight;
* rendered size remains a prop instead of part of the component name. Each
* icon references its `dsw-icon-<glyph>-<weight>` symbol in the document icon
* sprite that ui-theme maintains, so a theme can replace the artwork without
* touching callers and the artwork inherits `currentColor` and CSS variables.
*/
/** Shared shield contour used by composite icons outside this module. */
const SHIELD_OUTLINE_PATH = "M6.80132 2.14853C7.70663 1.80917 8.70422 1.80919 9.60952 2.14859L14.1296 3.84317V7.11961C14.1296 11.6089 10.7615 13.5975 8.20543 14.5779C5.64931 13.5975 2.28052 11.6089 2.28052 7.11961V3.84317L6.80132 2.14853Z";
function productIcon(glyph, weight) {
	const { size: defaultSize, aspect: [width, height] = [1, 1] } = ICON_ARTWORK[glyph];
	const id = iconSymbolId(glyph, weight);
	return ({ size = defaultSize, className }) => jsx("svg", {
		width: size * width / height,
		height: size,
		className,
		"data-icon": id,
		"aria-hidden": "true",
		children: jsx("use", { href: `#${id}` })
	});
}
/** Regular one-pixel IconNewChatOutline artwork. */
const IconNewChatOutlineRegular = productIcon("new-chat-outline", "regular");
/** Medium IconNewChatOutline artwork with a 1.3px stroke. */
const IconNewChatOutlineMedium = productIcon("new-chat-outline", "medium");
/** Regular one-pixel IconSearchOutline artwork. */
const IconSearchOutlineRegular = productIcon("search-outline", "regular");
/** Medium IconSearchOutline artwork with a 1.3px stroke. */
const IconSearchOutlineMedium = productIcon("search-outline", "medium");
/** Regular one-pixel IconGlobeOutline artwork. */
const IconGlobeOutlineRegular = productIcon("globe-outline", "regular");
/** Medium IconGlobeOutline artwork with a 1.3px stroke. */
const IconGlobeOutlineMedium = productIcon("globe-outline", "medium");
/** Regular one-pixel IconSettingsOutline artwork. */
const IconSettingsOutlineRegular = productIcon("settings-outline", "regular");
/** Medium IconSettingsOutline artwork with a 1.3px stroke. */
const IconSettingsOutlineMedium = productIcon("settings-outline", "medium");
/** Regular one-pixel IconPanelLeftOutline artwork. */
const IconPanelLeftOutlineRegular = productIcon("panel-left-outline", "regular");
/** Medium IconPanelLeftOutline artwork with a 1.3px stroke. */
const IconPanelLeftOutlineMedium = productIcon("panel-left-outline", "medium");
/** Regular IconEllipsisOutline artwork; its fill-only geometry is weight-independent. */
const IconEllipsisOutlineRegular = productIcon("ellipsis-outline", "regular");
/** Medium IconEllipsisOutline artwork; it matches Regular because the geometry is fill-only. */
const IconEllipsisOutlineMedium = productIcon("ellipsis-outline", "medium");
/** Regular one-pixel IconPlusOutline artwork. */
const IconPlusOutlineRegular = productIcon("plus-outline", "regular");
/** Medium IconPlusOutline artwork with a 1.3px stroke. */
const IconPlusOutlineMedium = productIcon("plus-outline", "medium");
/** Regular one-pixel IconCheckOutline artwork. */
const IconCheckOutlineRegular = productIcon("check-outline", "regular");
/** Medium IconCheckOutline artwork with a 1.3px stroke. */
const IconCheckOutlineMedium = productIcon("check-outline", "medium");
/** Regular one-pixel IconBranchOutline artwork. */
const IconBranchOutlineRegular = productIcon("branch-outline", "regular");
/** Medium IconBranchOutline artwork with a 1.3px stroke. */
const IconBranchOutlineMedium = productIcon("branch-outline", "medium");
/** Regular one-pixel IconChevronDownOutline artwork. */
const IconChevronDownOutlineRegular = productIcon("chevron-down-outline", "regular");
/** Medium IconChevronDownOutline artwork with a 1.3px stroke. */
const IconChevronDownOutlineMedium = productIcon("chevron-down-outline", "medium");
/** Regular one-pixel IconChevronLeftOutline artwork. */
const IconChevronLeftOutlineRegular = productIcon("chevron-left-outline", "regular");
/** Medium IconChevronLeftOutline artwork with a 1.3px stroke. */
const IconChevronLeftOutlineMedium = productIcon("chevron-left-outline", "medium");
/** Regular one-pixel IconChevronRightOutline artwork. */
const IconChevronRightOutlineRegular = productIcon("chevron-right-outline", "regular");
/** Medium IconChevronRightOutline artwork with a 1.3px stroke. */
const IconChevronRightOutlineMedium = productIcon("chevron-right-outline", "medium");
/** Regular IconTriangleRightFill artwork; its fill-only geometry is weight-independent. */
const IconTriangleRightFillRegular = productIcon("triangle-right-fill", "regular");
/** Medium IconTriangleRightFill artwork; it matches Regular because the geometry is fill-only. */
const IconTriangleRightFillMedium = productIcon("triangle-right-fill", "medium");
/** Regular one-pixel IconChevronUpOutline artwork. */
const IconChevronUpOutlineRegular = productIcon("chevron-up-outline", "regular");
/** Medium IconChevronUpOutline artwork with a 1.3px stroke. */
const IconChevronUpOutlineMedium = productIcon("chevron-up-outline", "medium");
/** Regular one-pixel IconCloseOutline artwork. */
const IconCloseOutlineRegular = productIcon("close-outline", "regular");
/** Medium IconCloseOutline artwork with a 1.3px stroke. */
const IconCloseOutlineMedium = productIcon("close-outline", "medium");
/** Regular one-pixel IconCloseFill artwork. */
const IconCloseFillRegular = productIcon("close-fill", "regular");
/** Medium IconCloseFill artwork with a 1.3px stroke. */
const IconCloseFillMedium = productIcon("close-fill", "medium");
/** Regular IconCloseCircleFill artwork (cross knocked out of a filled disc); its fill-only geometry is weight-independent. */
const IconCloseCircleFillRegular = productIcon("close-circle-fill", "regular");
/** Medium IconCloseCircleFill artwork; it matches Regular because the geometry is fill-only. */
const IconCloseCircleFillMedium = productIcon("close-circle-fill", "medium");
/** Regular one-pixel IconCopyOutline artwork. */
const IconCopyOutlineRegular = productIcon("copy-outline", "regular");
/** Medium IconCopyOutline artwork with a 1.3px stroke. */
const IconCopyOutlineMedium = productIcon("copy-outline", "medium");
/** Regular one-pixel IconRefreshOutline artwork. */
const IconRefreshOutlineRegular = productIcon("refresh-outline", "regular");
/** Medium IconRefreshOutline artwork with a 1.3px stroke. */
const IconRefreshOutlineMedium = productIcon("refresh-outline", "medium");
/** Regular one-pixel IconLikeOutline artwork. */
const IconLikeOutlineRegular = productIcon("like-outline", "regular");
/** Medium IconLikeOutline artwork with a 1.3px stroke. */
const IconLikeOutlineMedium = productIcon("like-outline", "medium");
/** Regular one-pixel IconLikeFill artwork. */
const IconLikeFillRegular = productIcon("like-fill", "regular");
/** Medium IconLikeFill artwork with a 1.3px stroke. */
const IconLikeFillMedium = productIcon("like-fill", "medium");
/** Regular one-pixel IconDislikeOutline artwork. */
const IconDislikeOutlineRegular = productIcon("dislike-outline", "regular");
/** Medium IconDislikeOutline artwork with a 1.3px stroke. */
const IconDislikeOutlineMedium = productIcon("dislike-outline", "medium");
/** Regular one-pixel IconDislikeFill artwork. */
const IconDislikeFillRegular = productIcon("dislike-fill", "regular");
/** Medium IconDislikeFill artwork with a 1.3px stroke. */
const IconDislikeFillMedium = productIcon("dislike-fill", "medium");
/** Regular one-pixel IconShareOutline artwork. */
const IconShareOutlineRegular = productIcon("share-outline", "regular");
/** Medium IconShareOutline artwork with a 1.3px stroke. */
const IconShareOutlineMedium = productIcon("share-outline", "medium");
/** Regular one-pixel IconDeliverDoc artwork. */
const IconDeliverDocRegular = productIcon("deliver-doc", "regular");
/** Medium IconDeliverDoc artwork with a 1.3px stroke. */
const IconDeliverDocMedium = productIcon("deliver-doc", "medium");
/** Regular one-pixel IconEditOutline artwork. */
const IconEditOutlineRegular = productIcon("edit-outline", "regular");
/** Medium IconEditOutline artwork with a 1.3px stroke. */
const IconEditOutlineMedium = productIcon("edit-outline", "medium");
/** Regular one-pixel IconThinkOutline artwork. */
const IconThinkOutlineRegular = productIcon("think-outline", "regular");
/** Medium IconThinkOutline artwork with a 1.3px stroke. */
const IconThinkOutlineMedium = productIcon("think-outline", "medium");
/** Regular one-pixel IconAgentPresetOutline artwork. */
const IconAgentPresetOutlineRegular = productIcon("agent-preset-outline", "regular");
/** Medium IconAgentPresetOutline artwork with a 1.3px stroke. */
const IconAgentPresetOutlineMedium = productIcon("agent-preset-outline", "medium");
/** Regular one-pixel IconBrowseOutline artwork. */
const IconBrowseOutlineRegular = productIcon("browse-outline", "regular");
/** Medium IconBrowseOutline artwork with a 1.3px stroke. */
const IconBrowseOutlineMedium = productIcon("browse-outline", "medium");
/** Regular one-pixel IconContextInjectionOutline artwork. */
const IconContextInjectionOutlineRegular = productIcon("context-injection-outline", "regular");
/** Medium IconContextInjectionOutline artwork with a 1.3px stroke. */
const IconContextInjectionOutlineMedium = productIcon("context-injection-outline", "medium");
/** Regular one-pixel IconLinkOutline artwork. */
const IconLinkOutlineRegular = productIcon("link-outline", "regular");
/** Medium IconLinkOutline artwork with a 1.3px stroke. */
const IconLinkOutlineMedium = productIcon("link-outline", "medium");
/** Regular one-pixel IconRightUpOutline artwork. */
const IconRightUpOutlineRegular = productIcon("right-up-outline", "regular");
/** Medium IconRightUpOutline artwork with a 1.3px stroke. */
const IconRightUpOutlineMedium = productIcon("right-up-outline", "medium");
/** Regular one-pixel IconEnhanceOutline artwork. */
const IconEnhanceOutlineRegular = productIcon("enhance-outline", "regular");
/** Medium IconEnhanceOutline artwork with a 1.3px stroke. */
const IconEnhanceOutlineMedium = productIcon("enhance-outline", "medium");
/** Regular one-pixel IconTrashOutline artwork. */
const IconTrashOutlineRegular = productIcon("trash-outline", "regular");
/** Medium IconTrashOutline artwork with a 1.3px stroke. */
const IconTrashOutlineMedium = productIcon("trash-outline", "medium");
/** Regular one-pixel IconWarningOutline artwork. */
const IconWarningOutlineRegular = productIcon("warning-outline", "regular");
/** Medium IconWarningOutline artwork with a 1.3px stroke. */
const IconWarningOutlineMedium = productIcon("warning-outline", "medium");
/** Regular IconCheckCircleFill artwork (circled check); its fill-only geometry is weight-independent. */
const IconCheckCircleFillRegular = productIcon("check-circle-fill", "regular");
/** Medium IconCheckCircleFill artwork; it matches Regular because the geometry is fill-only. */
const IconCheckCircleFillMedium = productIcon("check-circle-fill", "medium");
/** Regular rounded warning triangle with an exclamation mark. */
const IconWarningTriangleOutlineRegular = productIcon("warning-triangle-outline", "regular");
/** Medium rounded warning triangle with an exclamation mark. */
const IconWarningTriangleOutlineMedium = productIcon("warning-triangle-outline", "medium");
/** Regular one-pixel IconUserOutline artwork. */
const IconUserOutlineRegular = productIcon("user-outline", "regular");
/** Medium IconUserOutline artwork with a 1.3px stroke. */
const IconUserOutlineMedium = productIcon("user-outline", "medium");
/** Regular one-pixel IconUsersOutline artwork: a front person with a second person behind. */
const IconUsersOutlineRegular = productIcon("users-outline", "regular");
/** Medium IconUsersOutline artwork with a 1.3px stroke. */
const IconUsersOutlineMedium = productIcon("users-outline", "medium");
/** Regular one-pixel IconPaperPlaneOutline artwork. */
const IconPaperPlaneOutlineRegular = productIcon("paper-plane-outline", "regular");
/** Medium IconPaperPlaneOutline artwork with a 1.3px stroke. */
const IconPaperPlaneOutlineMedium = productIcon("paper-plane-outline", "medium");
/** Regular IconStopFill artwork; its fill-only geometry is weight-independent. */
const IconStopFillRegular = productIcon("stop-fill", "regular");
/** Medium IconStopFill artwork; it matches Regular because the geometry is fill-only. */
const IconStopFillMedium = productIcon("stop-fill", "medium");
/** Regular one-pixel IconPaperclipOutline artwork. */
const IconPaperclipOutlineRegular = productIcon("paperclip-outline", "regular");
/** Medium IconPaperclipOutline artwork with a 1.3px stroke. */
const IconPaperclipOutlineMedium = productIcon("paperclip-outline", "medium");
/** Regular one-pixel IconLoadingOutline artwork. */
const IconLoadingOutlineRegular = productIcon("loading-outline", "regular");
/** Medium IconLoadingOutline artwork with a 1.3px stroke. */
const IconLoadingOutlineMedium = productIcon("loading-outline", "medium");
/** Regular one-pixel IconDownloadOutline artwork. */
const IconDownloadOutlineRegular = productIcon("download-outline", "regular");
/** Medium IconDownloadOutline artwork with a 1.3px stroke. */
const IconDownloadOutlineMedium = productIcon("download-outline", "medium");
/** Regular one-pixel IconPlayOutline artwork. */
const IconPlayOutlineRegular = productIcon("play-outline", "regular");
/** Medium IconPlayOutline artwork with a 1.3px stroke. */
const IconPlayOutlineMedium = productIcon("play-outline", "medium");
/** Regular one-pixel IconPauseOutline artwork. */
const IconPauseOutlineRegular = productIcon("pause-outline", "regular");
/** Medium IconPauseOutline artwork with a 1.3px stroke. */
const IconPauseOutlineMedium = productIcon("pause-outline", "medium");
/** Regular one-pixel IconFullscreenOutline artwork. */
const IconFullscreenOutlineRegular = productIcon("fullscreen-outline", "regular");
/** Medium IconFullscreenOutline artwork with a 1.3px stroke. */
const IconFullscreenOutlineMedium = productIcon("fullscreen-outline", "medium");
/** Regular one-pixel IconCodeOutline artwork. */
const IconCodeOutlineRegular = productIcon("code-outline", "regular");
/** Medium IconCodeOutline artwork with a 1.3px stroke. */
const IconCodeOutlineMedium = productIcon("code-outline", "medium");
/** Regular one-pixel IconCordisPluginOutline artwork. */
const IconCordisPluginOutlineRegular = productIcon("cordis-plugin-outline", "regular");
/** Medium IconCordisPluginOutline artwork with a 1.3px stroke. */
const IconCordisPluginOutlineMedium = productIcon("cordis-plugin-outline", "medium");
/** Regular one-pixel IconApiOutline artwork. */
const IconApiOutlineRegular = productIcon("api-outline", "regular");
/** Medium IconApiOutline artwork with a 1.3px stroke. */
const IconApiOutlineMedium = productIcon("api-outline", "medium");
/** Regular one-pixel IconPersonalizationOutline artwork. */
const IconPersonalizationOutlineRegular = productIcon("personalization-outline", "regular");
/** Medium IconPersonalizationOutline artwork with a 1.3px stroke. */
const IconPersonalizationOutlineMedium = productIcon("personalization-outline", "medium");
/** Regular one-pixel IconProjectAddOutline artwork. */
const IconProjectAddOutlineRegular = productIcon("project-add-outline", "regular");
/** Medium IconProjectAddOutline artwork with a 1.3px stroke. */
const IconProjectAddOutlineMedium = productIcon("project-add-outline", "medium");
/** Regular one-pixel IconFolderOpenOutline artwork. */
const IconFolderOpenOutlineRegular = productIcon("folder-open-outline", "regular");
/** Medium IconFolderOpenOutline artwork with a 1.3px stroke. */
const IconFolderOpenOutlineMedium = productIcon("folder-open-outline", "medium");
/** Regular IconFolderOpen artwork; its fill-only geometry is weight-independent. */
const IconFolderOpenRegular = productIcon("folder-open", "regular");
/** Medium IconFolderOpen artwork; it matches Regular because the geometry is fill-only. */
const IconFolderOpenMedium = productIcon("folder-open", "medium");
/** Regular one-pixel IconFolderClose artwork. */
const IconFolderCloseRegular = productIcon("folder-close", "regular");
/** Medium IconFolderClose artwork with a 1.3px stroke. */
const IconFolderCloseMedium = productIcon("folder-close", "medium");
/** Regular one-pixel IconTreeCorner artwork. */
const IconTreeCornerRegular = productIcon("tree-corner", "regular");
/** Medium IconTreeCorner artwork with a 1.3px stroke. */
const IconTreeCornerMedium = productIcon("tree-corner", "medium");
/** Regular one-pixel IconLightOutline artwork. */
const IconLightOutlineRegular = productIcon("light-outline", "regular");
/** Medium IconLightOutline artwork with a 1.3px stroke. */
const IconLightOutlineMedium = productIcon("light-outline", "medium");
/** Regular one-pixel IconDarkOutline artwork. */
const IconDarkOutlineRegular = productIcon("dark-outline", "regular");
/** Medium IconDarkOutline artwork with a 1.3px stroke. */
const IconDarkOutlineMedium = productIcon("dark-outline", "medium");
/** Regular one-pixel IconFollowsystemOutline artwork. */
const IconFollowsystemOutlineRegular = productIcon("followsystem-outline", "regular");
/** Medium IconFollowsystemOutline artwork with a 1.3px stroke. */
const IconFollowsystemOutlineMedium = productIcon("followsystem-outline", "medium");
/** Regular one-pixel IconDataOutline artwork. */
const IconDataOutlineRegular = productIcon("data-outline", "regular");
/** Medium IconDataOutline artwork with a 1.3px stroke. */
const IconDataOutlineMedium = productIcon("data-outline", "medium");
/** Regular one-pixel IconDatabaseOutline artwork. */
const IconDatabaseOutlineRegular = productIcon("database-outline", "regular");
/** Medium IconDatabaseOutline artwork with a 1.3px stroke. */
const IconDatabaseOutlineMedium = productIcon("database-outline", "medium");
/** Regular one-pixel IconClockOutline artwork. */
const IconClockOutlineRegular = productIcon("clock-outline", "regular");
/** Medium IconClockOutline artwork with a 1.3px stroke. */
const IconClockOutlineMedium = productIcon("clock-outline", "medium");
/** Regular one-pixel IconGaugeOutline artwork. */
const IconGaugeOutlineRegular = productIcon("gauge-outline", "regular");
/** Medium IconGaugeOutline artwork with a 1.3px stroke. */
const IconGaugeOutlineMedium = productIcon("gauge-outline", "medium");
/** Regular one-pixel IconSendOutline artwork. */
const IconSendOutlineRegular = productIcon("send-outline", "regular");
/** Medium IconSendOutline artwork with a 1.3px stroke. */
const IconSendOutlineMedium = productIcon("send-outline", "medium");
/** Regular one-pixel IconQueueOutline artwork. */
const IconQueueOutlineRegular = productIcon("queue-outline", "regular");
/** Medium IconQueueOutline artwork with a 1.3px stroke. */
const IconQueueOutlineMedium = productIcon("queue-outline", "medium");
/** Regular one-pixel IconChecklistOutline artwork. */
const IconChecklistOutlineRegular = productIcon("checklist-outline", "regular");
/** Medium IconChecklistOutline artwork with a 1.3px stroke. */
const IconChecklistOutlineMedium = productIcon("checklist-outline", "medium");
/** Regular one-pixel IconListPenOutline artwork. */
const IconListPenOutlineRegular = productIcon("list-pen-outline", "regular");
/** Medium IconListPenOutline artwork with a 1.3px stroke. */
const IconListPenOutlineMedium = productIcon("list-pen-outline", "medium");
/** Regular one-pixel IconGoalOutline artwork. */
const IconGoalOutlineRegular = productIcon("goal-outline", "regular");
/** Medium IconGoalOutline artwork with a 1.3px stroke. */
const IconGoalOutlineMedium = productIcon("goal-outline", "medium");
/** Regular one-pixel IconSparkle artwork. */
const IconSparkleRegular = productIcon("sparkle", "regular");
/** Medium IconSparkle artwork with a 1.3px stroke. */
const IconSparkleMedium = productIcon("sparkle", "medium");
/** Regular one-pixel IconInspectOutline artwork. */
const IconInspectOutlineRegular = productIcon("inspect-outline", "regular");
/** Medium IconInspectOutline artwork with a 1.3px stroke. */
const IconInspectOutlineMedium = productIcon("inspect-outline", "medium");
/** Regular one-pixel IconSkillOutline artwork. */
const IconSkillOutlineRegular = productIcon("skill-outline", "regular");
/** Medium IconSkillOutline artwork with a 1.3px stroke. */
const IconSkillOutlineMedium = productIcon("skill-outline", "medium");
/** Regular one-pixel IconQuestionOutline artwork. */
const IconQuestionOutlineRegular = productIcon("question-outline", "regular");
/** Medium IconQuestionOutline artwork with a 1.3px stroke. */
const IconQuestionOutlineMedium = productIcon("question-outline", "medium");
/** Regular IconInfoOutline artwork; its fill-only geometry is weight-independent. */
const IconInfoOutlineRegular = productIcon("info-outline", "regular");
/** Medium IconInfoOutline artwork; its fill-only geometry is weight-independent. */
const IconInfoOutlineMedium = productIcon("info-outline", "medium");
/** Regular one-pixel plugin pinwheel artwork. */
const IconPluginPinwheelOutlineRegular = productIcon("plugin-pinwheel-outline", "regular");
/** Medium plugin pinwheel artwork with a 1.3px stroke. */
const IconPluginPinwheelOutlineMedium = productIcon("plugin-pinwheel-outline", "medium");
/** Regular one-pixel IconAlarmClockOutline artwork. */
const IconAlarmClockOutlineRegular = productIcon("alarm-clock-outline", "regular");
/** Medium IconAlarmClockOutline artwork with a 1.3px stroke. */
const IconAlarmClockOutlineMedium = productIcon("alarm-clock-outline", "medium");
/** Regular one-pixel IconArchiveOutline artwork. */
const IconArchiveOutlineRegular = productIcon("archive-outline", "regular");
/** Medium IconArchiveOutline artwork with a 1.3px stroke. */
const IconArchiveOutlineMedium = productIcon("archive-outline", "medium");
/** Regular one-pixel IconWrapLinesOutline artwork. */
const IconWrapLinesOutlineRegular = productIcon("wrap-lines-outline", "regular");
/** Medium IconWrapLinesOutline artwork with a 1.3px stroke. */
const IconWrapLinesOutlineMedium = productIcon("wrap-lines-outline", "medium");
/** Regular IconNowrapFill artwork; fill-only weights render identically. */
const IconNowrapFillRegular = productIcon("nowrap-fill", "regular");
/** Medium IconNowrapFill artwork; fill-only weights render identically. */
const IconNowrapFillMedium = productIcon("nowrap-fill", "medium");
/** Regular IconWrapFill artwork; fill-only weights render identically. */
const IconWrapFillRegular = productIcon("wrap-fill", "regular");
/** Medium IconWrapFill artwork; fill-only weights render identically. */
const IconWrapFillMedium = productIcon("wrap-fill", "medium");
/** Regular one-pixel IconCompareSplitOutline artwork. */
const IconCompareSplitOutlineRegular = productIcon("compare-split-outline", "regular");
/** Medium IconCompareSplitOutline artwork with a 1.3px stroke. */
const IconCompareSplitOutlineMedium = productIcon("compare-split-outline", "medium");
/** Regular one-pixel IconPlanOutline artwork. */
const IconPlanOutlineRegular = productIcon("plan-outline", "regular");
/** Medium IconPlanOutline artwork with a 1.3px stroke. */
const IconPlanOutlineMedium = productIcon("plan-outline", "medium");
/** Regular one-pixel IconCompactOutline artwork. */
const IconCompactOutlineRegular = productIcon("compact-outline", "regular");
/** Medium IconCompactOutline artwork with a 1.3px stroke. */
const IconCompactOutlineMedium = productIcon("compact-outline", "medium");
/** Regular one-pixel IconShieldOutline artwork. */
const IconShieldOutlineRegular = productIcon("shield-outline", "regular");
/** Medium IconShieldOutline artwork with a 1.3px stroke. */
const IconShieldOutlineMedium = productIcon("shield-outline", "medium");
/** Regular one-pixel IconCheckCircleOutline artwork. */
const IconCheckCircleOutlineRegular = productIcon("check-circle-outline", "regular");
/** Medium IconCheckCircleOutline artwork with a 1.3px stroke. */
const IconCheckCircleOutlineMedium = productIcon("check-circle-outline", "medium");
/** Regular one-pixel IconUnarchiveOutline artwork. */
const IconUnarchiveOutlineRegular = productIcon("unarchive-outline", "regular");
/** Medium IconUnarchiveOutline artwork with a 1.3px stroke. */
const IconUnarchiveOutlineMedium = productIcon("unarchive-outline", "medium");
/** Regular one-pixel IconPinOutline artwork. */
const IconPinOutlineRegular = productIcon("pin-outline", "regular");
/** Medium IconPinOutline artwork with a 1.3px stroke. */
const IconPinOutlineMedium = productIcon("pin-outline", "medium");
/** Regular one-pixel IconPinFill artwork. */
const IconPinFillRegular = productIcon("pin-fill", "regular");
/** Medium IconPinFill artwork with a 1.3px stroke. */
const IconPinFillMedium = productIcon("pin-fill", "medium");
/** Regular one-pixel IconFlatListOutline artwork. */
const IconFlatListOutlineRegular = productIcon("flat-list-outline", "regular");
/** Medium IconFlatListOutline artwork with a 1.3px stroke. */
const IconFlatListOutlineMedium = productIcon("flat-list-outline", "medium");
/** Regular one-pixel IconWorkspaceTreeOutline artwork. */
const IconWorkspaceTreeOutlineRegular = productIcon("workspace-tree-outline", "regular");
/** Medium IconWorkspaceTreeOutline artwork with a 1.3px stroke. */
const IconWorkspaceTreeOutlineMedium = productIcon("workspace-tree-outline", "medium");
/** Regular one-pixel IconChevronsUpDownOutline artwork. */
const IconChevronsUpDownOutlineRegular = productIcon("chevrons-up-down-outline", "regular");
/** Medium IconChevronsUpDownOutline artwork with a 1.3px stroke. */
const IconChevronsUpDownOutlineMedium = productIcon("chevrons-up-down-outline", "medium");
/** Regular one-pixel IconDragHandleOutline artwork. */
const IconDragHandleOutlineRegular = productIcon("drag-handle-outline", "regular");
/** Medium IconDragHandleOutline artwork with a 1.3px stroke. */
const IconDragHandleOutlineMedium = productIcon("drag-handle-outline", "medium");
/** Regular one-pixel IconArchiveOffOutline artwork. */
const IconArchiveOffOutlineRegular = productIcon("archive-off-outline", "regular");
/** Medium IconArchiveOffOutline artwork with a 1.3px stroke. */
const IconArchiveOffOutlineMedium = productIcon("archive-off-outline", "medium");
/** Regular one-pixel IconArchiveCheckOutline artwork. */
const IconArchiveCheckOutlineRegular = productIcon("archive-check-outline", "regular");
/** Medium IconArchiveCheckOutline artwork with a 1.3px stroke. */
const IconArchiveCheckOutlineMedium = productIcon("archive-check-outline", "medium");
/** Regular one-pixel IconSlidersTwoOutline artwork. */
const IconSlidersTwoOutlineRegular = productIcon("sliders-two-outline", "regular");
/** Medium IconSlidersTwoOutline artwork with a 1.3px stroke. */
const IconSlidersTwoOutlineMedium = productIcon("sliders-two-outline", "medium");
/** Microphone with uniform one-pixel strokes. */
const IconMicrophoneOutlineRegular = productIcon("microphone-outline", "regular");
/** Microphone with uniform 1.3px strokes. */
const IconMicrophoneOutlineMedium = productIcon("microphone-outline", "medium");
function appsAddIcon(weight) {
	const Wide = productIcon("apps-add-outline", weight);
	const Compact = productIcon("apps-add-compact-outline", weight);
	return ({ compact = false, ...props }) => compact ? jsx(Compact, { ...props }) : jsx(Wide, { ...props });
}
/** Three entry tiles and an add mark with one-pixel strokes. */
const IconAppsAddOutlineRegular = appsAddIcon("regular");
/** Three entry tiles and an add mark with 1.3px strokes. */
const IconAppsAddOutlineMedium = appsAddIcon("medium");
/** Regular floppy-disk save action. */
const IconSaveOutlineRegular = productIcon("save-outline", "regular");
/** Medium floppy-disk save action. */
const IconSaveOutlineMedium = productIcon("save-outline", "medium");
