// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/onboarding-balance.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Available onboarding credit includes both purchased and granted wallets. */
/**
* Check purchased and granted credit without treating a pending query as zero.
* @param balance - current account balance result.
* @returns whether either wallet group has positive credit.
*/
function hasOnboardingCredit(balance) {
	return balance?.status === "ready" && [...balance.value, ...balance.bonusWallets].some((wallet) => new Big(wallet.balance).gt(0));
}
