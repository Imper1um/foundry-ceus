import { lmrtfy_RefactorRollProvider } from "./lmrtfy_RefactorRollProvider.js";
import { LMRTFYRoller } from "./roller.js";

export class lmrtfy_RollProvider_sf1e extends lmrtfy_RefactorRollProvider {
	constructor() {
		super();
	}
	
	/**
	 * The system identifier for this specific RollProvider.
	 *
	 * @return string Identifying the System.
	 */
	systemIdentifiers() {
		return 'sfrpg';
	}
	
	trainedOptions() {
		return [ "HideUntrained", "PreventUntrained", "AllowUntrained" ];
	}
	
	isActorTrained(actor, rollType, id) {
		if (rollType != LMRTFYRoller.rollTypes().SKILL) {
			return true;
		}
		return actor.system.skills[id].ranks > 0;
	}
	
	canActorSeeRoll(actor, rollType, id, trainedOption) {
		var train = this.isActorTrained(actor, rollType, id);
		switch (trainedOption) {
			case "HideUntrained":
				return train;
		}
		return true;
	}
	
	canActorRoll(actor, rollType, id, trainedOption) {
		var train = this.isActorTrained(actor, rollType, id);
		switch (trainedOption) {
			case "HideUntrained":
			case "PreventUntrained":
				return train;
		}
		return true;
	}
	
	getInitiativeContexts() {
		const initiativeContexts = new Array();
		for (const combat of game.combats) {
			initiativeContexts.push({"id":combat._id, "name":`${combat.combatants.size} on ${combat.scene.name}`});
		}
		return initiativeContexts;
	}
	
	getAvailableRolls() {
		return [
			{
				id: "Special",
				name: "SFRPG.Special",
				type: "category",
				rolls: [
					{ id: "Initiative", name: "SFRPG.InitiativeLabel", type: "roll", rollType: LMRTFYRoller.rollTypes().INITIATIVE, method: this.rollInitiative, contexts: this.getInitiativeContexts },
					{ id: "Perception", name: "SFRPG.SpecialLabel", type: "roll", rollType:LMRTFYRoller.rollTypes().PERCEPTION, method: this.rollPerception }
				]
			},
			{
				id: "Abilities",
				name: "SFRPG.ItemSheet.AbilityScoreIncrease.Label",
				type: "category",
				rolls: this.getAvailableAbilityRolls()
			},
			{
				id: "Saves",
				name: "SFRPG.DroneSheet.Chassis.Details.Saves.Header",
				type: "category",
				rolls: this.getAvailableSaveRolls()
			},
			{
				id: "Skills",
				name: "SFRPG.SkillsToggleHeader",
				type: "category",
				rolls: this.getAvailableSkillRolls()
			},
		];
	}
	
	async rollInitiative(rollId, actor, options) {
		const combat = game.combats.get(options.context);
		if (!combat) { return; }
		var rollOptions = {formula: null, updateTurn: true, messageOptions: {}, requireMode: null, requireRollState: null};
		if (options.requireMode) {
			rollOptions.requireMode = options.requireMode;
		}
		if (options.requireRollState) {
			rollOptions.requireRollState = options.requireRollState;
		}
		const newCombat = await combat.rollInitiative(actor._id, rollOptions); 
		if (options.resultId) {
			
		}
	}
	
	getAvailableAbilityRolls() {
		const abilities = CONFIG.SFRPG.abilities;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
			return {
				id: `Ability${capitalizedKey}`,
				name: `SFRPG.Ability${capitalizedKey}`,
				type: "roll",
				rollType: LMRTFYRoller.rollTypes().ABILITY,
				method: this.rollAbility
			};
		});
	}
	
	getAvailableSaveRolls() {
		const saves = CONFIG.SFRPG.saves;
		return Object.keys(saves).map(key => {
			const saveName = saves[key];
			return {
				id: `${saveName}Save`,
				name: `SFRPG.${saveName}Save`,
				type: "roll",
				rollType: LMRTFYRoller.rollTypes().SAVE,
				method: this.rollSave
			};
		});
	}
	
	getAvailableSkillRolls() {
		const abilities = CONFIG.SFRPG.skills;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = (key.charAt(0).toUpperCase() + key.slice(1)).substring(0, 3);
			return {
				id: `Skill${capitalizedKey}`,
				name: `SFRPG.Skill${capitalizedKey}`,
				type: "roll",
				rollType: LMRTFYRoller.rollTypes().SKILL,
				method: this.rollSkill
			};
		});
	}
	
	resultsEnabled() {
		return true;
	}
	
	canActionAdvantage(rollType, id) {
		return true;
	}
	
	canActionDisadvantage(rollType, id) {
		return true;
	}
	permitAdvantageDisadvantage() {
		return true;
	}
	needsContext(requestOptions) {
		if (requestOptions.requestItems.some(ri => ri.id == "Initiative")) {
			return true;
		}
		return false;
	}
	getContextList(requestOptions) {
		if (requestOptions.requestItems.some(ri => ri.id == "Initiative")) {
			return this.getInitiativeContexts();
		}
		return null;
	}
	permitDC() {
		return true;
	}
	allowDC(rollType, id) {
		if (rollType == LMRTFYRoller.rollTypes().INITIATIVE) {
			return false;
		}
		return true;
	}
}