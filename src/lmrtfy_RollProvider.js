import { lmrtfy_RollEvent } from "./lmrtfy_RollEvent.js";

/** 
 * Old Roll Provider.
 *
 * This is provided for backwards compatibility.
 * 
 * @deprecated with the new lmrtfy_RefactorRollProvider . Do not use this with new systems. If you can, try translating a RollProvider to a RefactorRollProvider. 
 */
export class lmrtfy_RollProvider {
	constructor() {
	}
	
	async onReady() {
		this.failCheck = game.settings.get('lmrtfy', 'showFailButtons');
		this.overrideFailCheck = false;
	}
	
	getSettings() {
		return [{
				id: "showFailButtons",
				name: game.i18n.localize("LMRTFY.Setting.ShowFailButtons.Name"),
				hint: game.i18n.localize("LMRTFY.Setting.ShowFailButtons.Hint"),
				scope: 'world',
				config: LMRTFY.current.providerEngine.currentRollProvider.allowFailButtons(),
				type: Boolean,
				default: LMRTFY.current.providerEngine.currentRollProvider.failButtonsDefault(),
				onChange: () => window.location.reload()
			}];
	}
	
	/**
	 * The system identifier for this specific RollProvider.
	 *
	 * @return {string} Identifying the System.
	 */
	systemIdentifiers() {
		throw new Error('No System Identifier has been set!');
	}
	
	rollProviderType() {
		return 'legacy';
	}
	
	/**
	 * Where all of the Abilities are defined for this system.
	 *
	 * @return {Array} Of Abilities
	 */
	abilities() {
		return null;
	}

	/**
	 * Where all of the Abilities Abbreviations are defined for this system, if any.
	 *
	 * @return {Array} Of Abilities with Abbreviations
	 */
	abilityAbbreviations() {
		return null;
	}

	/**
	 * Where all of the Ability Modifiers are defined for this system.
	 *
	 * @return {Array} Of Ability Modifiers
	 */
	abilityModifiers() {
		return this.parseAbilityModifiers();
	}

	/**
	 * Name of the method to roll on the Actor class to roll the appropriate check
	 *
	 * @return {string} Of method name associated with the appropriate check
	 */
	abilityRollMethod() {
		return null;
	}

	/**
	 * lmrtfy_RollEvent that is checked for special keys if a specific roll event is run.
	 *
	 * @return {lmrtfy_RollEvent} for this Event
	 */
	advantageRollEvent() {
		return new lmrtfy_RollEvent();
	}
	
	/**
	 * Should fail buttons be enabled for this system?
	 *
	 * @return {boolean} true if fail buttons are enabled.
	 */
	allowFailButtons() {
		return false;
	}
	
	/**
	 * If run, will override fail checks for this provider so that they always provide result set.
	 */
	overrideFailChecks(failCheck) {
		this.overrideFailCheck = true;
		this.failCheckOverride = failCheck;
	}
	
	/**
	 * If true, use the DC check system for rolls.
	 *
	 * @return {boolean} If this system should use DC checks.
	 */
	canFailChecks() {
		if (this.overrideFailCheck) {
			return this.failCheckOverride;
		}
		return this.failCheck;
	}

	/**
	 * lmrtfy_RollEvent that is checked for special keys if a specific roll event is run.
	 *
	 * @return {lmrtfy_RollEvent} for this Event
	 */
	disadvantageRollEvent() {
		return new lmrtfy_RollEvent();
	}
	
	/**
	 *
	 * @return {Boolean} If true, the default for the show fail buttons will be set to true. Otherwise, false.
	 */
	failButtonsDefault() {
		return false;
	}
	
	/**
	 * Handles custom rolls for this specific system.
	 *
	 * @return {boolean} If true, was handled by the handler. Otherwise, false.
	 */	 
	handleCustomRoll(actor, event, rollMethod, rolledType, failRoll, dc, ...args) {
		return false;
	}
	
	/**
	 *
	 * Handles custom death save rolls for this specific system.
	 *
	 * @return {isHandled, checkClose} If isHandled = true, was handled by this RollProvider. Otherwise, false. If checkClose = true, then _checkClose will be run on return.
	 */
	handleDeathSave(actors, event) {
		return {isHandled: false, checkClose: false};
	}
	
	/**
	 * Handles custom initiative rolls for this system.
	 *
	 * @return {isHandled, checkClose} If isHandled = true, was handled by this RollProvider. Otherwise, false. If checkClose = true, then _checkClose will be run on return.
	 */
	handleInitiativeRoll(event, mode, actors) {
		return {isHandled:false, checkClose: false};
	}

	modIdentifier() {
		return 'mod';
	}

	/**
	 * lmrtfy_RollEvent that is checked for special keys if a specific roll event is run.
	 *
	 * @return {lmrtfy_RollEvent} for this Event
	 */
	normalRollEvent() {
		return new lmrtfy_RollEvent();
	}
	
	/**
	 * The template that should be requested for this RollProvider.
	 *
	 * @return {string} that should point to the template for the roll provider. */
	requestRollTemplate() {
		return "modules/lmrtfy/templates/request-rolls.html";
	}

	/**
	 * Name of the method to roll on the Actor class to roll the appropriate check
	 *
	 * @return {string} Of method name associated with the appropriate check
	 */
	saveRollMethod() {
		return null;
	}

	/**
	 * Where all of the Saves are defined for this system.
	 *
	 * @return {Array} Of Saves
	 */
	saves() {
		return {};
	}

	/**
	 * Where all of the Skills are defined for this system.
	 *
	 * @return {Array} Of Skills
	 */
	skills() {
		return {};
	}

	/**
	 * Name of the method to roll on the Actor class to roll the appropriate check
	 *
	 * @return {string} Of method name associated with the appropriate check
	 */
	skillRollMethod() {
		return null;
	}

	/**
	 * Array of special rolls:
	 *  initiative
	 *  deathsave
	 *  perception
	 *
	 * @return {Array} Containing special rolls that might be used for this System
	 */
	specialRolls() {
		return {};
	}
	
	/**
	 * If true, use the DC check system for rolls.
	 *
	 * @return {boolean} If this system should use DC checks.
	 */
	useDC() {
		return false;
	}
	
	

	/**
	 * Parses the Ability Modifiers
	 * You normally will not need to override this function.
	 *
	 * @return {Array} Containing special ability modifiers that might be used for this System
	 */
	parseAbilityModifiers() {
        let abilityMods = {};

        for (let key in this.abilities()) {
            if (this.abilityAbbreviations()?.hasOwnProperty(key)) {
                abilityMods[`this.abilities().${game.i18n.localize(this.abilityAbbreviations()[key])}.${this.modIdentifier()}`] = game.i18n.localize(this.abilities()[key]);
            }
        }
		
        return abilityMods;
    }
}