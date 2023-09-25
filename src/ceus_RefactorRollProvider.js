export class ceus_RefactorRollProvider {
	constructor() {
	}
	
	async onReady() {
		console.log("Ceus | Readying " + this.systemIdentifiers());
	}
	
	getSettings() {
		return [];
	}
	
	/**
	 * The system identifier for this specific RollProvider.
	 *
	 * @return {string} Identifying the System.
	 */
	systemIdentifiers() {
		throw new Error('No System Identifier has been set!');
	}

	modIdentifier() {
		return 'mod';
	}
	
	rollProviderType() {
		return 'refactor';
	}

	/**
	 * The template that should be requested for this RollProvider.
	 *
	 * @return {string} that should point to the template for the roll provider. */
	requestRollTemplate() {
		return "modules/ceus/templates/refactor-request-rolls.html";
	}
	
	/**
	 * The template that should be requested by the player for this RollProvider.
	 *
	 * @return {string} that should point to the template for the player request. */
	playerRequestTemplate() {
		return "modules/ceus/templates/refactor-player-request.html";
	}
	
	/**
	 * The template for the results of this request.
	 *
	 * @return {string} that should point to the results template. */
	resultsTemplate() {
		return "modules/ceus/templates/results.html";
	}

	/** New Refactor Options **/
	/** 
	 * This new setup means that each roll provider provides the way that its going to accomplish
	 * the task of trying to roll. The thing that I found when I was rebuilding this functionality
	 * is that each system has a weird way of accomplishing their rolls, and there are many different
     * options for each system. This seeks to make it so that rolls are no longer tied to one specific
     * kind of system (skill, saves, abilities), and just allow each RollProvider to define their own
     * categories, then fill in the rest. */	 
	 
	
	/**
	 * Gets the array of options available for trained options.
	 *
	 * @return {Array} of options available. Should be in key:value format.
	 */
	trainedOptions() {
		return null;
	}
	
	/**
	 * Gets the array of options available for a specific roll.
	 *
	 * @return {Array} of options available. Should be in key:value format.
	 */
	rollTrainedOptions(rollType, id) {
		return this.trainedOptions();
	}
	
	/**
	 * Gets if an Actor is trained in a specific skill/save/whatever.
	 *
	 * @return {boolean} null if unknown (or not programmed), true if the Actor is trained, and false if the Actor is untrained.
	 */
	isActorTrained(actor, rollType, id) {
		return null;
	}
	
	/**
	 * Gets if an Actor is a player.
	 *
	 * @return {boolean} if the actor is a player, false otherwise.
	 */
	isPlayer(actor) {
		return false;
	}
	
	/**
	 * Gets if an Actor can see if a specific skill/save/whatever.
	 *
	 * @return {boolean} null if unknown (or not programmed), true if the Actor could see the button, and false if the button should be hidden.
	 */
	canActorSeeRoll(actor, rollType, id, trainedOption) {
		return null;
	}
	
	/**
	 * Gets if an Actor can roll a specific skill/save/wahtever.
	 *
	 * @return {boolean} null if unknown (or not programmed), true if the Actor could see the button, and false if the button should be disabled.
	 */
	canActorRoll(actor, rollType, id, trainedOption) {
		return null;
	}
	
	/** Available Rolls Refactor 
	 * 
	 * This gets the new available rolls for this system. 
	 */
	getAvailableRolls() {
		return null;
	}
	
	/**
	 *
	 * This determines if the roll results are enabled.
	 */
	resultsEnabled() {
		return false;
	}
	
	/** Gets if a specific roll can be rolled with advantage
	 *
	 * @return {boolean} true if advantage is allowed, otherwise, false.
	 */
	canActionAdvantage(rollType, id) {
		return false;
	}
	
	/** Gets if a specific roll can be rolled with disadvantage
	 *
	 * @return {boolean} true if disadvantage is allowed, otherwise, false.
	 */
	canActionDisadvantage(rollType, id) {
		return false;
	}
	
	/**
	 * Globally allow or disallow Advantage/Disadvantage with this system.
	 *
	 * @return {boolean} true if advantage or disadvantage is allowed, otherwise, false.
	 */
	permitAdvantageDisadvantage() {
		return false;
	}
	
	/**
	 * Gets if a roll needs context.
	 * 
	 * @return {boolean} true if a context relationship is needed for a roll.
	 */
	needsContext(requestOptions) {
		return false;
	}
	
	/**
	 * Gets the context list (if a contextual relationship is required).
	 *
	 * @return {Array} of context relationships required.
	 */
	getContextList(requestOptions) {
		return null;
	}
	
	/**
	 * Globally allow or disallow DC checks to compare against.
	 *
	 * @return {boolean} true if DC is permitted, otherwise, false.
	 */
	permitDC() {
		return false;
	}
	
	/**
	 * Allow DC checks to compare against for a specific roll.
	 *
	 * @return {boolean} true if the roll can allow DC Checks. Otherwise, false.
	 */
	canActionDC(rollType, id) {
		return false;
	}
	
	/**
	 * Allow GMs to ask for a specific roll privacy.
	 *
	 * @return {boolean} true if GMs can ask for a specific roll privacy. Otherwise, false.
	 */
	permitSetRollPrivacy() {
		return false;
	}
	
	/**
	 * Allow GMs to require a specific roll privacy.
	 *
	 * @return {boolean} true if GMs can require a specific roll privacy. Otherwise, false.
	 */
	permitRequireRollPrivacy() {
		return false;
	}
	
	/**
	 * When a roll is completed, does the mod need to make the decision to display the results of the roll?
	 *
	 * @return {boolean} true if the Mod needs to make the decision to display the results of the roll.
	 */
	displayRequiredByMod() {
		return false;
	}
	
	/**
	 * Called when a display is asked for.
	 */
	async displayRoll(requestOptions, user, actor, check, result) {
		const sensitive = requestOptions.rollPrivacy === "blind" ? "sensitive" : "not-sensitive";
		var crit = "";
		if (check.canCritSuccess && result.critSuccess) {
			crit = "crit-success";
		} else if (check.canCritFail && result.critFail) {
			crit = "crit-fail";
		}
		const ispass = result.isPass == true ? "pass" : (result.isPass == false ? "fail" : "");
		var htmlView = `<div class="ceus ceus-result ceus-chat ${sensitive} ${ispass} ${requestOptions.rollPrivacy}" data-requestid="${requestOptions.id}" data-actorid="${actor._id}" data-userid="${user._id}" data-rollid="${check.rollId}" data-total="${result.rolledAmount}" data-ispass="${result.isPass}" data-dc="${check.dc}">
			<header>${check.rollId}</header>
			<div class="result-body">
				<div class="result-total">${result.rolledAmount}</div>
				<div class="result-breakdown">${result.rollBreakdown}</div>
			</div>
		</div>`;
		
		let chatData = {
			user: user.id,
			speaker: ChatMessage.getSpeaker({actor: actor}),
			content: htmlView,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		};

		let whisperIds = [];

		// Determine who can see the message based on requestOptions.rollPrivacy
		switch(requestOptions.rollPrivacy) {
			case "self":
			  whisperIds.push(user.id);
			  break;
			case "gm":
			  const gmUsers = game.users.filter(u => u.isGM);
			  whisperIds = gmUsers.map(u => u.id);
			  whisperIds.push(user.id);  // Include the current user
			  break;
			case "blind":
			case "public":
			  // No need to set whisperIds, the message will be public
			  break;
			default:
			  console.error("Invalid rollPrivacy option");
			  return;
		  }

		if (whisperIds.length > 0) {
			chatData.whisper = whisperIds;
		}

		await ChatMessage.create(chatData);
	}
}

console.log("Ceus | ceus_RefactorRollProvider.js loaded");