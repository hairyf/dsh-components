// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/formatBalance.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Platform Web currency formatting for account balances; source amounts retain decimal precision. */
		/**
		* Format a balance using Platform Web's two-decimal and sub-cent display rules.
		* @param amount - validated decimal balance string.
		* @param symbol - currency symbol.
		* @returns signed currency text with grouped digits.
		*/
		function formatBalance(amount, symbol) {
			const value = new Big(amount);
			if (value.eq(0)) return `${symbol}0.00`;
			if (value.lt(0)) return `-${symbol}${value.gt(-.01) ? "0.01" : addCommas(value.abs().toFixed(2))}`;
			if (value.lt("0.01")) return `<${symbol}0.01`;
			return `${symbol}${addCommas(value.round(2, Big.roundDown).toFixed(2))}`;
		}
		function addCommas(value) {
			const [integer, fraction] = value.split(".");
			return `${Number(integer).toLocaleString()}.${fraction}`;
		}
