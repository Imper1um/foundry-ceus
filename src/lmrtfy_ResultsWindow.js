import { Utils } from "./Utils.js";
import { LMRTFY } from "./lmrtfy.js";
import { lmrtfy_SocketEngine } from "./lmrtfy_SocketEngine.js";

export class lmrtfy_ResultsWindow extends FormApplication {
	constructor(requestOptions, requestType, ...args) {
		super(...args);
		game.users.apps.push(this);
		
		this.requestOptions = requestOptions;
		this.requestType = requestType;
		this.requestOptions.resultId = this.appId;
		
		LMRTFY.current.socketEngine.addCompleteWatcher(
			requestOptions.id, 
			async (data) => this.onCompleteReceived( data), 
			async (data) => this.onFilter(data));
		LMRTFY.current.socketEngine.addCancelWatcher(
			requestOptions.id, 
			async (data) => this.onCancelReceived(data),
			async (data) => this.onFilter(data));
	}
	
	async onFilter(data) {
		return data.request.resultId === this.appId;
	}
	
	async onCompleteReceived(data) {
		this.appendResult(data);
	}
	
	async onCancelReceived(data) {
		this.appendCancel(data);
	}
	
	async _onClose(options = {}) {
		await super._onClose(options);
		LMRTFY.current.socketEngine.removeCompleteWatcher(this.requestOptions.id);
		LMRTFY.current.socketEngine.removeCancelWatcher(this.requestOptions.id);
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
			pendingRolls: this.pendingRolls,
			completedRolls: this.completedRolls,
			hasPendingRolls: this.pendingRolls.length
		};
	}
	
	activateListeners(html) {
		html.find("#announce-full").click(this._onAnnounceFull);
		html.find("#announce-obfuscate").click(this._onAnnounceObfuscate);
	}
	
	async appendCancel(result) {
		if (result.requestId !== this.requestOptions.id) { return; }
		const cancelNotification = game.i18n.localize("LMRTFY.Results.Cancel");
		const u = game.users.get(data.userid);
		ui.notifications.info(`${u.name} {cancelNotification}`);
	}
	
	async appendResult(result) {
		const userList = game.users.entities || game.users.contents;
		
		const pendingRoll = this.pendingRolls.find(r => r.id === result.response.requestActorId);
		if (!pendingRoll) { return; }
		
		const pendingItem = pendingRoll.rolls.find(r => r.roll.rollId === result.response.requestItemId);
		if (pendingItem.isRolled) { return; } //Only the first roll qualifies.
		
		const rolledUser = userList.find(u => u._id == result.response.rolledUserId);
		if (!rolledUser) { return; }
		
		pendingItem.result = result.response;
		pendingItem.isRolled = true;
		pendingItem.isPass = result.response.isPass == true;
		pendingItem.isFail = result.response.isPass == false;
		pendingItem.passClass = pendingItem.isPass ? "pass" : (pendingItem.isFail ? "fail" : "");
		pendingItem.user = rolledUser;
		pendingItem.isAdvantage = result.response.rolledAdvantageDisadvantage === "advantage";
		pendingItem.isDisadvantage = result.response.rolledAdvantageDisadvantage === "disadvantage";
		if (this.requestOptions.rollNumber === "one") {
			pendingRoll.isRolled = true;
			this.pendingRolls = this.pendingRolls.filter(pr => pr.id !== pendingRoll.id);
		}
		if (pendingRoll.rolls.every(r => r.isRolled)) {
			pendingRoll.isRolled = true;
			this.pendingRolls = this.pendingRolls.filter(pr => pr.id !== pendingRoll.id);
		}
		this.completedRolls.push(pendingItem);
		for (const pendingRoll of this.pendingRolls) {
			pendingRoll.possibleUsers = pendingRoll.users.map(u => u.name).join("<br />");
			pendingRoll.possibleRolls = pendingRoll.rolls.map(u => `<div class="roll ${u.isRolled ? "rolled" : ""}" data-rollid="${u.roll.rollId}">${u.roll.rollId}</div>`).join("");
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
		this.generateRolls();
	}
	
	generateRolls() {
		const rp = LMRTFY.current.providerEngine.currentRollProvider;
		var possibleRolls = Utils.flattenRolls(rp.getAvailableRolls());
		var actorList = game.actors.entities || game.actors.contents;
		var userList = game.users.entities || game.users.contents;
		var rollPrefix = "or";
		switch (this.requestOptions.rollNumber) {
			case 'any':
				rollPrefix = "+";
				break;
			case 'all':
				rollPrefix = "and";
				break;
		}
		
		this.pendingRolls = [];
		this.completedRolls = [];
		
		for (const actor of this.requestOptions.requestActors) {
			const actorItem = actorList.find(a => a._id == actor.actorId);
			if (!actorItem) { continue; }
			var pendingRoll = {
				img: actorItem.img,
				name: actorItem.name,
				id: actorItem._id,
				users: [],
				rolls: [],
				isRolled: false
			};
			for (const u of this.requestOptions.requestUsers) {
				const userItem = userList.find(ul => ul._id === u.userId);
				if (!userItem) { continue; }
				if (!Utils.doesUserControlActor(actorItem, userItem)) { continue; }
				pendingRoll.users.push(userItem);
			}
			for (const r of this.requestOptions.requestItems) {
				if (r.trainedOption === "HideUntrained" && !rp.isActorTrained(actorItem, r.rollType, r.rollId)) { continue; }
				pendingRoll.rolls.push({
					actor: actorItem,
					roll: r,
					isRolled: false
				});
			}
			pendingRoll.possibleUsers = pendingRoll.users.map(u => u.name).join("<br />");
			pendingRoll.possibleRolls = pendingRoll.rolls.map(u => `<div class="roll" data-rollid="${u.roll.rollId}"> ${u.roll.rollId}</div>`).join("");
			this.pendingRolls.push(pendingRoll);
		}
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