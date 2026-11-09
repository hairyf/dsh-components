// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/plan-resource.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Bind plan reads to the generated Session Remote face.
* A plan is a logged tool-call argument, so the provider reads one page at the current log
* end and pages backwards from its cut. It neither activates nor subscribes.
* Remote failures are reported as resource failure frames with their original codes.
* @param remote - Existing Session history API.
* @returns a provider whose reads stop after finding the exact invocation.
*/
function planResourceProvider(remote) {
	return {
		protocol: "plan",
		async *open(address, { signal }) {
			const aborted = () => signal.aborted;
			if (aborted()) return;
			const target = parsePlanAddress(address);
			if (target === void 0) {
				yield {
					ok: false,
					error: new RemoteError("plan/invalid-address", "Invalid plan resource address.", {})
				};
				return;
			}
			const sessionAddress = target.session;
			try {
				const first = await remote.events({ address: sessionAddress }, signal);
				if (aborted()) return;
				if (!first.ok) {
					yield {
						ok: false,
						error: first.error
					};
					return;
				}
				const throughSeq = first.value.cursor;
				let page = {
					records: first.value.records,
					hasMore: first.value.hasMore
				};
				while (true) {
					for (const entry of page.records) {
						const plan = submittedPlan(entry.event);
						if (plan?.callId === target.callId) {
							yield {
								ok: true,
								value: plan
							};
							return;
						}
					}
					const beforeSeq = page.records[0]?.event.seq;
					if (!page.hasMore || beforeSeq === void 0) break;
					const next = await remote.page({
						address: sessionAddress,
						throughSeq,
						beforeSeq
					}, signal);
					if (aborted()) return;
					if (!next.ok) {
						yield next;
						return;
					}
					page = next.value;
				}
				yield {
					ok: false,
					error: new RemoteError("plan/not-found", "The submitted plan was not found in this Session.", {})
				};
			} catch (error) {
				if (!aborted()) yield {
					ok: false,
					error: remoteErrorOf(error) ?? new RemoteError("plan/read-failed", error instanceof Error ? error.message : String(error), {})
				};
			}
		}
	};
}
