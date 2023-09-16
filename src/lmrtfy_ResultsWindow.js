import { Utils } from "./Utils.js";
import { LMRTFY } from "./lmrtfy.js";

export class lmrtfy_ResultsWindow extends FormApplication {
	constructor(requestOptions, requestType, ...args) {
		super(...args);
		game.users.apps.push(this);
		
		this.requestOptions = requestOptions;
		this.requestType = requestType;
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = game.i18n.localize("LMRTFY.Results.Header");
		options.id = `lmrtfy-results-${this.appId}`;
		options.template = LMRTFY.current.providerEngine.currentRollProvider.resultsTemplate();
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 950;
		options.height = 800;
		options.classes = ["lmrtfy", "lmrtfy-results", "lmrtfy-refactor"];
		if (game.settings.get('lmrtfy', 'enableParchmentTheme')) {
			options.classes.push('lmrtfy-parchment');
		}
		return options;
	}
	
	async getData() {
		return {
			requestOptions: this.requestOptions,
			rollUsers: this.rollUsers,
			rollActors: this.rollActors,
			rollDescriptions: this.rollDescriptions,
			rolls: this.rolls
		};
	}
	
	activateListeners(html) {
		html.find("#announce-full").click(this._onAnnounceFull);
		html.find("#announce-obfuscate").click(this._onAnnounceObfuscate);
	}
	
	async appendResult(result) {
		if (result.requestId !== this.requestOptions.id) { return; }
		const rollActor = this.rolls.find(ra => ra.actorId === result.requestActorId);
		if (!rollActor) { return; }
		if (this.requestOptions.rollNumber === "one" && rollActor.rolls.some(r => r.isRolled)) { return; } //Only the first roll qualifies.
		const roll = rollActor.rolls.find(r => r.id === result.requestItemId);
		if (roll.isRolled) { return; } //Only the first result qualifies.
		roll.isRolled = result.isRolled;
		roll.isPass = result.isPass;
		const userList = game.users.entities || game.users.contents;
		const rolledUser = userList.find(u => u._id == roll.rolledUserId);
		roll.rolledUserId = rolledUser._id;
		roll.rolledBy = rolledUser.name;
		roll.rolledAmount = result.rolledAmount;
		roll.rolledAdvantageDisadvantage = result.rolledAdvantageDisadvantage;
		switch (this.requestOptions.rollNumber) {
			case 'any':
				rollActor.isRolled = rollActor.rolls.some(r => r.isRolled);
				rollActor.isPass = rollActor.rolls.some(r => r.isPass);
				break;
			case 'all':
				if (rollActor.rolls.every(r => r.isRolled)) {
					rollActor.isRolled = true;
					rollActor.isPass = rollActor.rolls.every(r => r.isPass);
				}
				break;
		}
		if (rollActor.isRolled && rollActor.isPass) {
			rollActor.passClass = "rolled pass";
		} else if (rollActor.isRolled && !rollActor.isPass) {
			rollActor.passClass = "rolled fail";
		}
		this.render(false);
	}

	
	handleRequestOptions() {
		this.rollUsers = "";
		this.rollActors = "";
		this.rollDescriptions = "";
		
		if (this.requestType === "self") {
			this.rollUsers = "You";
		} else {
			var userList = game.users.entities || game.users.contents;
			this.rollUsers = this.requestOptions.requestUsers.map(ru => userList.find(ul => ul._id === ru.userId).name).join(", ");
		}
		var actorList = game.actors.entities || game.actors.contents;
		this.rollActors = this.requestOptions.requestActors.map(ru => actorList.find(al => al._id === ru.actorId).name).join(", ");
		
		var rollPrefix = "Roll One: ";
		switch (this.requestOptions.rollNumber) {
			case 'any':
				rollPrefix = "Roll Any: ";
				break;
			case 'all':
				rollPrefix = "Roll All: ";
				break;
		}
		this.rollDescriptions = rollPrefix + this.requestOptions.requestItems.map(this.generateRollDescription).join(', ');
		this.rolls = this.generateRolls();
	}
	
	generateRolls() {
		var actorRolls = new Array();
		var possibleRolls = Utils.flattenRolls(LMRTFY.current.providerEngine.currentRollProvider.getAvailableRolls());
		var actorList = game.actors.entities || game.actors.contents;
		var rollPrefix = "or";
		switch (this.requestOptions.rollNumber) {
			case 'any':
				rollPrefix = "+";
				break;
			case 'all':
				rollPrefix = "and";
				break;
		}
		for (const actor of this.requestOptions.requestActors) {
			var rollList = new Array();
			var actorItem = actorList.find(a => a._id == actor.actorId);
			var isFirst = true;
			for (const roll of this.requestOptions.requestItems) {
				var possibleRoll = possibleRolls.find(pr => pr.id == roll.rollId);
				rollList.push({
					id: possibleRoll.id,
					name: game.i18n.localize(possibleRoll.name),
					customBonus: roll.customBonus,
					trainedOption: roll.trainedOption,
					dc: roll.dc,
					advantageDisadvantage: roll.advantageDisadvantage,
					description: this.generateRollDescription(roll),
					isRolled: false,
					isPass: false,
					rolledBy: null,
					rolledUserId: null,
					rolledAmount: null,
					rolledAdvantageDisadvantage: null,
					rollPrefix: isFirst ? "":rollPrefix
				});
			}
			
			actorRolls.push({
				actorId: actorItem._id,
				name: actorItem.name,
				img: actorItem.img,
				rollList: rollList,
				isPass: false,
				isRolled: false,
				passClass: "pending"
			});
		}
		return actorRolls;
	}
	
	generateRollDescription(requestItem) {
		const flat = Utils.flattenRolls(LMRTFY.current.providerEngine.currentRollProvider.getAvailableRolls());
		
		const roll = flat.find(r => r.id === requestItem.rollId);
		const rollName = game.i18n.localize(roll.name);
		var rollDescription = rollName;
		if (requestItem.customBonus) {
			rollDescription += ` (+${requestItem.customBonus})`;
		}
		if (requestItem.dc) {
			rollDescription += `:DC${requestItem.dc}`;
		}
		if (LMRTFY.current.providerEngine.currentRollProvider.permitAdvantageDisadvantage()) {
			switch (requestItem.advantageDisadvantage) {
				case 'require-advantage':
					rollDescription += ' [ADV]';
					break;
				case 'require-disadvantage':
					rollDescription += ' [DIS]';
					break;
				case 'allow-normal-advantage':
					rollDescription += ' [NORM/ADV]';
					break;
				case 'allow-normal-disadvantage':
					rollDescription += ' [NORM/DIS]';
					break;
				case 'allow-advantage-disadvantage':
					rollDescription += ' [ADV/DIS]';
					break;
			}
		}
		var trainedOptions = LMRTFY.current.providerEngine.currentRollProvider.trainedOptions();
		if (trainedOptions && trainedOptions.length > 1) {
			for (const to of trainedOptions) {
				rollDescription += ' [' + game.i18n.localize(`LMRTFY.Requestor.SelectRolls.Trained.${to}`) + ']';
			}
		}
		return rollDescription;
	}
	
	
	
}