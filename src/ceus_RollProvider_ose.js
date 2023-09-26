import { ceus_RollProvider } from "./ceus_RollProvider.js";

export class ceus_RollProvider_ose extends ceus_RollProvider {
	/**
	 * The system identifier for this specific RollProvider.
	 *
	 * @return string Identifying the System.
	 */
	systemIdentifiers() {
		return 'ose';
	}
	
	
	abilities() {
		return CONFIG.OSE.scores;
	}

	abilityAbbreviations() {
		return CONFIG.OSE.scores_short;
	}

	abilityRollMethod() {
		return 'rollCheck';
	}

	canFailChecks() {
		return game.settings.get('ceus', 'showFailButtons');
	}
	
	modIdentifier() {
		return 'modifier';
	}

	saveRollMethod() {
		return 'rollSave';
	}

	saves() {
		return CONFIG.OSE.saves_long;
	}

	skills() {
		return CONFIG.OSE.exploration_skills;
	}

	skillRollMethod() {
		return 'rollExploration';
	}
}