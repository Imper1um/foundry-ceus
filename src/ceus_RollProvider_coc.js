import { ceus_RollProvider_cof } from "./ceus_RollProvider_cof.js";

export class ceus_RollProvider_coc extends ceus_RollProvider_cof {
	systemIdentifiers() {
		return 'coc';
	}
	
	abilities() {
		return CONFIG.COC.stats;
	}

	abilityAbbreviations() {
		return CONFIG.COC.statAbbreviations;
	}

	skills() {
		return CONFIG.COC.skills;
	}

	specialRolls() {
		return {};
	}
}