// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/use-calendar-day.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Local calendar-day epoch that advances at each local midnight.
* @returns Midnight ms for the current local day; updates after the boundary.
*/
function useCalendarDay() {
	const [day, setDay] = (0, react.useState)(() => startOfLocalDay(Date.now()));
	(0, react.useEffect)(() => {
		let timer;
		const arm = () => {
			const now = Date.now();
			setDay(startOfLocalDay(now));
			timer = setTimeout(arm, msUntilNextLocalMidnight(now));
		};
		timer = setTimeout(arm, msUntilNextLocalMidnight(Date.now()));
		return () => {
			clearTimeout(timer);
		};
	}, []);
	return day;
}
