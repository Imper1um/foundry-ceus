import { ceus_RefactorRollProvider } from "./ceus_RefactorRollProvider.js";
import { CeusRoller } from "./roller.js";
import { Ceus } from "./ceus.js";
import { ceus_Result } from "./ceus_Result.js";
import { ceus_LogEngine } from "./ceus_LogEngine.js";

/**
 * RollProvider for Pathfinder (1st Edition) (pf1)
 *
 * systemIdentifier: pf1
 * trained: enabled
 * results: enabled
 * advantage/disadvantage: disabled
 * DC: enabled
 * rollMode: enabled
 */
export class ceus_RollProvider_pf1 extends ceus_RefactorRollProvider {
	constructor() {
		super();
	}
	
	static get log() {
		if (!ceus_RollProvider_pf1._log) {
			ceus_RollProvider_pf1._log = new ceus_LogEngine("pf1");
		}
		return ceus_RollProvider_pf1._log;
	}	
	systemIdentifiers() {
		return 'pf1';
	}
	trainedOptions() {
		return [ "HideUntrained", "PreventUntrained", "AllowUntrained" ];
	}
	
	rollTrainedOptions(rollType, id) {
		switch (rollType) {
			case CeusRoller.rollTypes().INITIATIVE:
			case CeusRoller.rollTypes().ABILITY:
			case CeusRoller.rollTypes().PERCEPTION:
			case CeusRoller.rollTypes().SAVE:
				return [ "AllowUntrained" ];
		}
		
		return this.trainedOptions();
	}
	
	isActorTrained(actor, rollType, id) {
		if (rollType != CeusRoller.rollTypes().SKILL) {
			return true;
		}
		var skill = actor.system.skills[id];
		if (!skill) {
			const availableSkillRoll = this.getAvailableSkillRolls().find(s => s.id === id);
			if (availableSkillRoll) {
				skill = actor.system.skills[availableSkillRoll.skillId];
			}
		}
		if (!skill) { return false; }
		return skill.rank > 0;
	}
	
	getActorRollBonus(actor, rollType, id) {
		switch (rollType) {
			case CeusRoller.rollTypes().SKILL:
				var skill = actor.system.skills[id];
				if (!skill) {
					const availableSkillRoll = this.getAvailableSkillRolls().find(s => s.id === id);
					if (availableSkillRoll) {
						skill = actor.system.skills[availableSkillRoll.skillId];
					}
				}
				if (!skill) { return null; }
				return skill.mod;
			case CeusRoller.rollTypes().INITIATIVE:
				return actor.system.attributes.init.value;
			case CeusRoller.rollTypes().PERCEPTION:
				return actor.system.skills.per.mod;
			case CeusRoller.rollTypes().ABILITY:
				var ability = actor.system.abilities[id];
				if (!ability) {
					const availableAbilityRoll = this.getAvailableAbilityRolls().find(a => a.id === id);
					if (availableAbilityRoll) {
						ability = actor.system.abilities[availableAbilityRoll.abilityId];
					}
				}
				if (!ability) { return null; }
				return ability.mod;
			case CeusRoller.rollTypes().SAVE:
				var save = actor.system.attributes.savingThrows[id];
				if (!save) {
					const availableSaveRoll = this.getAvailableSaveRolls().find(a => a.id === id);
					if (availableSaveRoll) {
						save = actor.system.attributes.savingThrows[availableSaveRoll.saveId];
					}
				}
				if (!save) { return null; }
				return save.value;
		}
		return null;
	}
	
	isPlayer(actor) {
		return actor.type === "character";
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
		ceus_RollProvider_pf1.log.Trace("getInitiativeContexts", initiativeContexts);
		return initiativeContexts;
	}
	
	getAvailableRolls() {
		return [
			{
				id: "Special",
				name: "PF1.WeaponPropSpecial",
				type: "category",
				rolls: [
					{ id: "Initiative", name: "PF1.Initiative", type: "roll", rollType: CeusRoller.rollTypes().INITIATIVE, method: this.rollInitiative, contexts: this.getInitiativeContexts, canCritSuccess: false, canCritFail: false },
					{ id: "Perception", name: "PF1.SkillPer", type: "roll", rollType:CeusRoller.rollTypes().PERCEPTION, method: this.rollPerception, canCritSuccess: false, canCritFail: false }
				]
			},
			{
				id: "Abilities",
				name: "PF1.Ability",
				type: "category",
				rolls: this.getAvailableAbilityRolls()
			},
			{
				id: "Saves",
				name: "PF1.Save",
				type: "category",
				rolls: this.getAvailableSaveRolls()
			},
			{
				id: "Skills",
				name: "PF1.Skills",
				type: "category",
				rolls: this.getAvailableSkillRolls()
			},
		];
	}
	
	getAvailableAbilityRolls() {
		const abilities = CONFIG.PF1.abilities;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
			return {
				id: `Ability${capitalizedKey}`,
				name: `PF1.Ability${capitalizedKey}`,
				type: "roll",
				rollType: CeusRoller.rollTypes().ABILITY,
				method: this.rollAbility,
				abilityId: key,
				canCritSuccess: true,
				canCritFail: true
			};
		});
	}
	
	getAvailableSaveRolls() {
		const saves = CONFIG.PF1.savingThrows;
		return Object.keys(saves).map(key => {
			const saveName = saves[key];
			const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
			return {
				id: `${saveName}Save`,
				name: `PF1.SavingThrow${capitalizedKey}`,
				type: "roll",
				rollType: CeusRoller.rollTypes().SAVE,
				method: this.rollSave,
				saveId: key,
				canCritSuccess: true,
				canCritFail: true
			};
		});
	}
	
	getAvailableSkillRolls() {
		const abilities = CONFIG.PF1.skills;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = (key.charAt(0).toUpperCase() + key.slice(1)).substring(0, 3);
			var translatedKey = capitalizedKey;
			if (capitalizedKey.startsWith("K")) {
				//Knowledge skills are different. The second letter is capitalized.
				translatedKey = key.charAt(0).toUpperCase() + key.charAt(1).toUpperCase() + key.slice(2);
			} else if (capitalizedKey == "Umd") {
				//UMD is UMD.
				translatedKey = "UMD";
			}
			
			return {
				id: `Skill${capitalizedKey}`,
				name: `PF1.Skill${translatedKey}`,
				type: "roll",
				rollType: CeusRoller.rollTypes().SKILL,
				method: this.rollSkill,
				skillId: key,
				canCritSuccess: false,
				canCritFail: translatedKey == "UMD" ? true : false //UMD can Crit Fail
			};
		});
	}
	
	baseRollOptions() {
		return {
			chatMessage: false
		};
	}
	
	async rollSkill(requestOptions, actor, requestItem) {
		ceus_RollProvider_pf1.log.Trace("rollSkill", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const skillRoll = rp.getAvailableRolls().find(r => r.id === "Skills").rolls.find(r => r.id === requestItem.rollId);
		const skillId = skillRoll.skillId;
		const skill = actor.system.skills[skillRoll.skillId];
		const rollOptions = rp.baseRollOptions();
		var completeRoll;
		switch (requestItem.trainedOption) {
			case "HideUntrained":
				if (skill.isTrainedOnly && skill.ranks < 1) {
					return new ceus_Result(
						requestOptions.requestId,
						actor._id,
						requestItem.id,
						game.data.userId,
						null,
						false,
						null,
						null
					);
				}
				completeRoll = await actor.rollSkill(skillId, rollOptions);
				break;
			case "PreventUntrained":
				if (skill.isTrainedOnly && skill.ranks < 1) {
					completeRoll = await actor.rollSkill(skillId, rollOptions);
				} else {
					completeRoll = await actor.rollSkill(skillId, rollOptions);
				}
				break;
			default:
				completeRoll = await actor.rollSkill(skillId, rollOptions);
				break;
			
		}
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollPerception(requestOptions, actor, requestItem) {
		ceus_RollProvider_pf1.log.Trace("rollPerception", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const skill = actor.system.skills["per"];
		const skillId = "per";
		const completeRoll = await actor.rollSkill(skillId, skill, rp.baseRollOptions());
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollSave(requestOptions, actor, requestItem) {
		ceus_RollProvider_pf1.log.Trace("rollSave", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const saveRoll = rp.getAvailableRolls().find(r => r.id === "Saves").rolls.find(r => r.id === requestItem.rollId);
		const completeRoll = await actor.rollSavingThrow(saveRoll.saveId, rp.baseRollOptions());
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollAbility(requestOptions, actor, requestItem) {
		ceus_RollProvider_pf1.log.Trace("rollAbility", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const abilityRoll = rp.getAvailableRolls().find(r => r.id === "Abilities").rolls.find(r => r.id === requestItem.rollId);
		const completeRoll = await actor.rollAbilityTest(abilityRoll.abilityId, rp.baseRollOptions());
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollInitiative(requestOptions, actor, requestItem) {
		ceus_RollProvider_pf1.log.Trace("rollInitiative", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const combat = game.combats.get(requestOptions.contextId);
		if (!combat) { return; }
		var rollOptions = {formula: null, updateTurn: true, messageOptions: {}, requireMode: null, requireRollState: null};
		switch (requestOptions.rollPrivacy) {
			case "public":
				rollOptions.rollMode = "publicroll";
				break;				
			case "blind":
				rollOptions.rollMode = "blindroll";
				break;
			case "gm":
				rollOptions.rollMode = "gmroll";
				break;
			case "self":
				rollOptions.rollMode = "selfroll";
				break;
		}
		//Roll Privacy can't be enforced for Initiative.
		const newCombat = await combat.rollInitiative(actor._id, rollOptions); 
		const newTurn = newCombat.turns.find(t => t.actorId === actor._id);
		if (!newTurn) { return; }
		const result = new ceus_Result(
			requestOptions.id,
			requestOptions.resultId,
			actor._id,
			requestItem.id,
			game.data.userId,
			newTurn.resource,
			true,
			true,
			null);
		return result;
	}
	
	buildResult(requestOptions, actor, requestItem, roll) {
		ceus_RollProvider_pf1.log.Trace("buildResult", {requestOptions, actor, requestItem, roll});
		let rollType;
		if (roll.button === "advantage") {
			rollType = "advantage";
		} else if (roll.button === "disadvantage") {
			rollType = "disadvantage";
		} else {
			rollType = "normal";
		}
		var isCritSuccess = false;
		var isCritFail = false;
		const finalRoll = typeof roll.rolls[0] === 'string' ? JSON.parse(roll.rolls[0]) : roll.rolls[0]; //I don't know why it does this.
		for (const term of finalRoll.terms) {
			if (!term.faces || term.faces !== 20) { continue; }
			if (term.results[0].result === 20 && requestItem.canCritSuccess) { isCritSuccess = true; }
			if (term.results[0].result === 1 && requestItem.canCritFail) { isCritFail = true; }
		}
		var isPass = null;
		if (requestItem.dc) {
			isPass = requestItem.dc <= finalRoll.total;
			if (isCritSuccess) { isPass = true; }
			if (isCritFail) { isPass = false; }
		}
		
		return new ceus_Result(
			requestOptions.id,
			requestOptions.resultId,
			actor._id,
			requestItem.rollId,
			game.data.userId,
			finalRoll.total,
			true,
			isPass,
			rollType,
			finalRoll.formula,
			isCritFail,
			isCritSuccess
		);
	}
	
	resultsEnabled() {
		return true;
	}
	
	canActionAdvantage(rollType, id) {
		return false; //Advantage/Disadvantage can't base be passed into the Pathfinder 1e roll system. You can't force it (at least through PF1)
	}
	
	canActionDisadvantage(rollType, id) {
		return false;
	}
	
	permitAdvantageDisadvantage() {
		return false;
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
		if (rollType == CeusRoller.rollTypes().INITIATIVE) {
			return false;
		}
		return true;
	}
	permitSetRollPrivacy() {
		return true;
	}
	permitRequireRollPrivacy() {
		return true;
	}
	displayRequiredByMod() {
		return true;
	}
}