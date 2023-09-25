import { ceus_RollProvider } from "./ceus_RollProvider.js";

export class ceus_RollProvider_dnd35 extends ceus_RollProvider {
	systemIdentifiers() {
		return 'D35E';
	}
	
	abilities() {
		return CONFIG.D35E.abilities;
	}

	abilityAbbreviations() {
		return CONFIG.D35E.abilityAbbreviations;
	}

	abilityRollMethod() {
		return 'rollAbility';
	}

	advantageRollEvent() {
		return new ceus_RollEvent(false, true, false);
	}

	disadvantageRollEvent() {
		return new ceus_RollEvent(false, false, true);
	}

	normalRollEvent() {
		return new ceus_RollEvent(false, false, false);
	}

	saveRollMethod() {
		return 'rollSave';
	}

	saves() {
		return CONFIG.D35E.savingThrows;
	}

	skills() {
		return CONFIG.D35E.skills;
	}

	skillRollMethod() {
		return 'rollSkill';
	}

	specialRolls() {
		return { 'initiative': true, 'deathsave': false, 'perception': true };
	}
}