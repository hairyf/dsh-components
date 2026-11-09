// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/HoverCardGroup.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Private coordination shared only by opted-in HoverCards inside one mounted group. */
const HoverCardGroupContext = createContext(null);
/**
* Share first-display dwell across a list and its active portal, including the card's existing pointer grace.
* @param props.children - list contents, including opted-in HoverCards.
* @param props.className - classes for the physical list container.
* @param props.as - physical container tag; use span to preserve inline text layout.
* @returns the list container and its private hover coordinator.
*/
function HoverCardGroup({ children, className, as: Container = "div" }) {
	const [group] = useState(() => {
		let pointer = "outside";
		let warm = false;
		let active = null;
		return {
			isWarm: () => warm,
			enter: (overCard) => {
				pointer = overCard ? "card" : "list";
				if (overCard) warm = true;
			},
			leave: () => {
				pointer = "outside";
				if (active === null) warm = false;
			},
			containsCard: (target) => target instanceof Node && active !== null && active.element.contains(target),
			shown: (owner, dismiss, element) => {
				if (pointer === "card") {
					pointer = "outside";
					warm = false;
				}
				if (pointer === "list") warm = true;
				const previous = active;
				active = {
					owner,
					dismiss,
					element
				};
				if (previous !== null && previous.owner !== owner) previous.dismiss();
			},
			release: (owner) => {
				if (active?.owner !== owner) return;
				active = null;
				if (pointer !== "list") {
					pointer = "outside";
					warm = false;
				}
			}
		};
	});
	return jsx(HoverCardGroupContext.Provider, {
		value: group,
		children: jsx(Container, {
			className,
			onPointerOverCapture: (event) => {
				const overCard = group.containsCard(event.target);
				if (event.currentTarget.contains(event.target) || overCard) group.enter(overCard);
			},
			onPointerOutCapture: (event) => {
				const fromGroup = event.currentTarget.contains(event.target) || group.containsCard(event.target);
				const intoGroup = event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget) || group.containsCard(event.relatedTarget);
				if (fromGroup && !intoGroup) group.leave();
			},
			children
		})
	});
}
