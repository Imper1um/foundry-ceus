import { ceus_RefactorRollProvider } from "./ceus_RefactorRollProvider.js";
import { CeusRoller } from "./roller.js";
import { Ceus } from "./ceus.js";
import { ceus_Result } from "./ceus_Result.js";
import { ceus_LogEngine } from "./ceus_LogEngine.js";

/**
 * RollProvider for Starfinder (1st Edition) (sfrpg)
 *
 * systemIdentifier: SFRPG
 * trained detection: yes
 * results enabled: yes
 * advantage/disadvantage setting: no
 *  - At the moment, there's no way to force ADV/DIS setting through the normal roll UI that is presented by SFRPG.
 *    This may change in the future, and I'm planning on bypassing the entire Roll System when it comes down to forcing.
 *    However, I'm skipping this addition for right now.
 * DC setting: yes
 * rollMode setting: no
 *  - Again, there's not enough data being passed to the roll system to permit requiring rolls or not.
 */
export class ceus_RollProvider_sf1e extends ceus_RefactorRollProvider {
	constructor() {
		super();
	}
	
	static get log() {
		if (!ceus_RollProvider_sf1e._log) {
			ceus_RollProvider_sf1e._log = new ceus_LogEngine("sfrpg");
		}
		return ceus_RollProvider_sf1e._log;
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
	
	rollTrainedOptions(rollType, id) {
		if (rollType == CeusRoller.rollTypes().INITIATIVE) {
			return [ "AllowUntrained" ];
		}
		return this.trainedOptions();
	}
	
	isActorTrained(actor, rollType, id) {
		if (rollType != CeusRoller.rollTypes().SKILL) {
			return true;
		}
		return actor.system.skills[id].ranks > 0;
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
		ceus_RollProvider_sf1e.log.Trace("getInitiativeContexts", initiativeContexts);
		return initiativeContexts;
	}
	
	getAvailableRolls() {
		return [
			{
				id: "Special",
				name: "SFRPG.Special",
				type: "category",
				rolls: [
					{ id: "Initiative", name: "SFRPG.InitiativeLabel", type: "roll", rollType: CeusRoller.rollTypes().INITIATIVE, method: this.rollInitiative, contexts: this.getInitiativeContexts, canCritSuccess: false, canCritFail: false },
					{ id: "Perception", name: "SFRPG.SkillPer", type: "roll", rollType:CeusRoller.rollTypes().PERCEPTION, method: this.rollPerception, canCritSuccess: true, canCritFail: true }
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
	
	async rollSkill(requestOptions, actor, requestItem) {
		ceus_RollProvider_sf1e.log.Trace("rollSkill", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const skillRoll = rp.getAvailableRolls().find(r => r.id === "Skills").rolls.find(r => r.id === requestItem.id);
		const skillId = skillRoll.skillId;
		const skill = actor.system.skills[skillRoll.skillId];
		var completeRoll;
		switch (requestItem.trainedOption) {
			case "HideUntrained":
				if (skill.isTrainedOnly && skl.ranks < 1) {
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
				completeRoll = await actor.rollSkillCheck(skillId, skill, rp.baseRollOptions());
				break;
			case "PreventUntrained":
				if (skill.isTrainedOnly && skl.ranks < 1) {
					completeRoll = await actor.rollSkill(skillId, rp.baseRollOptions());
				} else {
					completeRoll = await actor.rollSkillCheck(skillId, skill, rp.baseRollOptions());
				}
				break;
			default:
				completeRoll = await actor.rollSkillCheck(skillId, skill, rp.baseRollOptions());
				break;
			
		}
		return this.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollSave(requestOptions, actor, requestItem) {
		ceus_RollProvider_sf1e.log.Trace("rollSave", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const saveRoll = rp.getAvailableRolls().find(r => r.id === "Saves").rolls.find(r => r.id === requestItem.id);
		const completeRoll = await actor.rollSave(saveRoll.saveId, rp.baseRollOptions());
		return this.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollAbility(requestOptions, actor, requestItem) {
		ceus_RollProvider_sf1e.log.Trace("rollAbility", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const abilityRoll = rp.getAvailableRolls().find(r => r.id === "Abilities").rolls.find(r => r.id === requestItem.id);
		const completeRoll = await actor.rollAbility(abilityRoll.abilityId, rp.baseRollOptions());
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	async rollInitiative(requestOptions, actor, requestItem) {
		ceus_RollProvider_sf1e.log.Trace("rollInitiative", {requestOptions, actor, requestItem});
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
	
	async rollPerception(requestOptions, actor, requestItem) {
		ceus_RollProvider_sf1e.log.Trace("rollPerception", {requestOptions, actor, requestItem});
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const skill = actor.system.skills["per"];
		const skillId = "per";
		const completeRoll = await actor.rollSkillCheck(skillId, skill, rp.baseRollOptions());
		return rp.buildResult(requestOptions, actor, requestItem, completeRoll);
	}
	
	baseRollOptions() {
		return {
			chatMessage: false,
			onClose: null,
			rollOptions: {
				isPrivate: true,
			}
		};
	}
	
	buildResult(requestOptions, actor, requestItem, roll) {
		ceus_RollProvider_sf1e.log.Trace("buildResult", {requestOptions, actor, requestItem, roll});
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
		for (const term of roll.callbackResult.terms) {
			if (!term.faces || term.faces !== 20) { continue; }
			if (term.results[0].result === 20) { isCritSuccess = true; }
			if (term.results[0].result === 1) { isCritFail = true; }
		}
		var isPass = null;
		if (requestItem.dc) {
			isPass = requestItem.dc <= roll.callbackResult._total;
			if (isCritSuccess) { isPass = true; }
			if (isCritFail) { isPass = false; }
		}
		
		return new ceus_Result(
			requestOptions.id,
			requestOptions.resultId,
			actor._id,
			requestItem.rollId,
			game.data.userId,
			roll.callbackResult._total,
			true,
			isPass,
			rollType,
			roll.callbackResult.breakdown,
			isCritFail,
			isCritSuccess
		);
	}
	
	getAvailableAbilityRolls() {
		const abilities = CONFIG.SFRPG.abilities;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
			return {
				id: `Ability${capitalizedKey}`,
				name: `SFRPG.Ability${capitalizedKey}`,
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
		const saves = CONFIG.SFRPG.saves;
		return Object.keys(saves).map(key => {
			const saveName = saves[key];
			return {
				id: `${saveName}Save`,
				name: `SFRPG.${saveName}Save`,
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
		const abilities = CONFIG.SFRPG.skills;
		return Object.keys(abilities).map(key => {
			const capitalizedKey = (key.charAt(0).toUpperCase() + key.slice(1)).substring(0, 3);
			var translateKey = capitalizedKey;
			if (translateKey === "Phs") {
				translateKey = "Psc";
				//Physcal Science is different in the en.json >.>
			}
			return {
				id: `Skill${capitalizedKey}`,
				name: `SFRPG.Skill${translateKey}`,
				type: "roll",
				rollType: CeusRoller.rollTypes().SKILL,
				method: this.rollSkill,
				skillId: key,
				canCritSuccess: true,
				canCritFail: true
			};
		});
	}
	
	resultsEnabled() {
		return true;
	}
	
	canActionAdvantage(rollType, id) {
		return false; //Advantage/Disadvantage can't base be passed into the Starfinder roll system. You can't force it (at least through SFRPG)
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