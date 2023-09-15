export class lmrtfy_RefactorRollProvider {
	constructor() {
	}
	
	async onReady() {
		console.log("LMRTFY | Readying " + this.systemIdentifiers());
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
		return "modules/lmrtfy/templates/refactor-request-rolls.html";
	}
	
	/**
	 * The template that should be requested by the player for this RollProvider.
	 *
	 * @return {string} that should point to the template for the player request. */
	playerRequestTemplate() {
		return "modules/lmrtfy/templates/refactor-player-request.html";
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
	
	
	
}

console.log("LMRTFY | lmrtfy_RefactorRollProvider.js loaded");