import { ceus_RollProvider } from "./ceus_RollProvider.js";

export class ceus_RollProvider_demonlord extends ceus_RollProvider {
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