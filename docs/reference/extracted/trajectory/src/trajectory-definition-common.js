// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/trajectory-definition-common.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Wrap one contribution in the Engine-owned target envelope.
*
* @param context - Context that owns the contribution identity.
* @param anchorSeq - Sequence used to order the contribution.
* @param data - Trajectory-specific contribution payload.
* @returns The contribution wrapped as a Trajectory view node.
*/
function trajectoryNode(context, anchorSeq, data) {
	return {
		key: context.key,
		kind: context.kind,
		id: context.id,
		target: "trajectory",
		anchorSeq,
		location: context.start?.location ?? { kind: "unresolved" },
		data
	};
}
