import { ceus_RollProvider } from "./ceus_RollProvider.js";

export class ceus_RollProvider_cd extends ceus_RollProvider {
	/**
	 * The system identifier for this specific RollProvider.
	 *
	 * @return string Identifying the System.
	 */
	systemIdentifiers() {
		return 'foundry-chromatic-dungeons';
	}
	
	/**
	 * Where all of the Abilities are defined for this system.
	 *
	 * @return array Of Abilities
	 */
	abilities() {
		return CONFIG.CHROMATIC.attributeLabels;
	}

	/**
	 * Where all of the Abilities Abbreviations are defined for this system, if any.
	 *
	 * @return array Of Abilities with Abbreviations
	 */
	abilityAbbreviations() {
		return CONFIG.CHROMATIC.attributeAbbreviations;
	}

	/**
	 * Where all of the Ability Modifiers are defined for this system.
	 *
	 * @return array Of Ability Modifiers
	 */
	abilityModifiers() {
		return this.parseAbilityModifiers();
	}

	/**
	 * Name of the method to roll on the Actor class to roll the appropriate check
	 *
	 * @return string Of method name associated with the appropriate check
	 */
	abilityRollMethod() {
		return 'attributeRoll';
	}

	/**
	 * Name of the method to roll on the Actor class to roll the appropriate check
	 *
	 * @return string Of method name associated with the appropriate check
	 */
	saveRollMethod() {
		return 'saveRoll';
	}

	/**
	 * Where all of the Saves are defined for this system.
	 *
	 * @return array Of Saves
	 */
	saves() {
		return CONFIG.CHROMATIC.saves;
	}

	handleCustomRoll(actor, event, rollMethod, rolledType, failRoll, dc, ...args) {
		const key = args[0];
		const {attributes, attributeMods, saves} = actor.system;
		let label, formula, target;

		switch (rollMethod) {
			case 'attributeRoll':
				label = Ceus.currentRollProvider.abilities()[key];
				formula = `1d20-${attributeMods[key]}`;
				target = attributes[key];
				break;
			case 'saveRoll':
				label = Ceus.currentRollProvider.saves()[key];
				formula = `1d20+${saves.mods[key]}`;
				target = saves.targets[key];
				break;
		}

		//This needs to be fixed, but I'm not sure on how CD does rolls with the new version.
		actor[rollMethod](game.i18n.localize(label));
		
		return true;
	}
}