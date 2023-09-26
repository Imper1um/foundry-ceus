import { ceus_RollProvider } from "./ceus_RollProvider.js";

export class ceus_RollProvider_cof extends ceus_RollProvider {
	systemIdentifiers() {
		return 'cof';
	}
	
	
	abilities() {
		return CONFIG.COF.stats;
	}

	abilityAbbreviations() {
		return CONFIG.COF.statAbbreviations;
	}

	abilityRollMethod() {
		return 'rollStat';
	}

	advantageRollEvent() {
		return new ceus_RollEvent( false, false, false );
	}

	disadvantageRollEvent() {
		return new ceus_RollEvent( false, false, false );
	}

	normalRollEvent() {
		return new ceus_RollEvent( false, false, false );
	}

	saveRollMethod() {
		return 'rollStat';
	}

	skills() {
		return CONFIG.COF.skills;
	}

	skillRollMethod() {
		return 'rollStat';
	}

	specialRolls() {
		return {};
	}
}