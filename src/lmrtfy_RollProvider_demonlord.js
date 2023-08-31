import { lmrtfy_RollProvider } from "./lmrtfy_RollProvider.js";

export class lmrtfy_RollProvider_demonlord extends lmrtfy_RollProvider {
	systemIdentifiers() {
		return 'demonlord';
	}
	
	demonlordAbilities() {
		var abilities = duplicate(CONFIG.DL.attributes);
        delete abilities.defense;
		return abilities;
	}
	
	abilities() {
		return demonlordAbilities();
	}

	abilityAbbreviations() {
		return demonlordAbilities();
	}

	abilityRollMethod() {
		return 'rollChallenge';
	}

	saveRollMethod() {
		return 'rollChallenge';
	}

	skillRollMethod() {
		return 'rollChallenge';
	}
}