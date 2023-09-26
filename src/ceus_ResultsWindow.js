import { Utils } from "./Utils.js";
import { Ceus } from "./ceus.js";
import { ceus_SocketEngine } from "./ceus_SocketEngine.js";
import { ceus_RequestUser } from "./ceus_RequestUser.js";
import { ceus_Result } from "./ceus_Result.js";
import { ceus_LogEngine } from "./ceus_LogEngine.js";

export class ceus_ResultsWindow extends FormApplication {
	constructor(requestOptions, requestType, ...args) {
		super(...args);
		game.users.apps.push(this);
		
		this.requestOptions = requestOptions;
		this.requestType = requestType;
		this.requestOptions.resultId = this.appId;
		
		Ceus.current.socketEngine.addCompleteWatcher(
			requestOptions.id, 
			async (data) => this.onCompleteReceived( data), 
			async (data) => this.onFilter(data));
		Ceus.current.socketEngine.addCancelWatcher(
			requestOptions.id, 
			async (data) => this.onCancelReceived(data),
			async (data) => this.onFilter(data));
	}
	
	static get log() {
		if (!ceus_ResultsWindow._log) {
			ceus_ResultsWindow._log = new ceus_LogEngine("ceus_ResultsWindow");
		}
		return ceus_ResultsWindow._log;
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
		Ceus.current.socketEngine.removeCompleteWatcher(this.requestOptions.id);
		Ceus.current.socketEngine.removeCancelWatcher(this.requestOptions.id);
	}
	
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = game.i18n.localize("Ceus.Results.Header");
		options.id = `ceus-results-${this.appId}`;
		options.template = Ceus.current.providerEngine.currentRollProvider.resultsTemplate();
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 950;
		options.height = 800;
		options.classes = ["ceus", "ceus-results", "ceus-refactor"];
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
			hasPendingRolls: this.pendingRolls.length,
			hasCompletedRolls: this.completedRolls.length,
			appid: this.appId
		};
	}
	
	activateListeners(html) {
		html.find(".gm-action").click(this._onGmAction);
		html.find(".ceus-results-list-item .total .total-amount").change(function() {
			const target = $(this);
			const dialog = $(target.parents(".ceus-dialog"));
			const appid = dialog.data("appid");
			const resultsWindow = game.users.apps.find(a => a.appId == appid);
			const parsedValue = parseFloat(target.val());
			const actorId = target.data("actorid");
			const rollId = target.data("roll");
			const completedRoll = resultsWindow.completedRolls.find(cr => cr.actor._id === actorId && cr.roll.id === rollId);
			if (!completedRoll) { return; }
			if (isNaN(parsedValue) || parsedValue < -1000000 || parsedValue > 1000000) {
				target.val(completedRoll.result.rolledAmount);
			} else {
				completedRoll.result.rolledAmount = parsedValue;
				
				completedRoll.isPass = false;
				completedRoll.isFail = false;
				completedRoll.isAdvantage = false;
				completedRoll.isDisadvantage = false;
				completedRoll.isRolled = false;
				completedRoll.user = game.user;
				completedRoll.result.rolledUserId = game.user._id;
				completedRoll.result.isRolled = false;
				completedRoll.result.rolledAdvantageDisadvantage = null;
				completedRoll.result.rollBreakdown = game.i18n.localize("Ceus.Results.GMActions.GMFiat");
				completedRoll.result.critFail = false;
				completedRoll.result.critSuccess = false;
				completedRoll.result.isPass = null;
				completedRoll.passClass = "";
				if (completedRoll.roll.dc) {
					if (completedRoll.result.rolledAmount >= completedRoll.roll.dc) {
						completedRoll.isPass = true;
						completedRoll.result.isPass = true;
						completedRoll.passClass = "pass";
					} else if (completedRoll.result.rolledAmount < completedRoll.roll.dc) {
						completedRoll.isFail = true;
						completedRoll.result.isPass = false;
						completedRoll.passClass = "fail";
					}
				}
			}
			resultsWindow.render(false);
		});
	}
	
	async _onGmAction(event) {
		const button = $(event.target);
		const dialog = $(button.parents(".ceus-dialog"));
		const appid = dialog.data("appid");
		const resultsWindow = game.users.apps.find(a => a.appId == appid);
		const action = button.data("action");
		const depth = button.data("depth");
		switch (depth) {
			case "one":
				return await resultsWindow._onOneGmAction(button, resultsWindow, action);
			case "all":
				return await resultsWindow._onAllGmAction(button, resultsWindow, action);
		}
	}
	
	async _onAllGmAction(button, resultsWindow, action) {
		switch (action) {
			case "roll":
				return await this.roll(this.pendingRolls.map(r => r.id));
			case "notify":
				return await this.notify(this.pendingRolls.map(r => r.id));
			case "cancel":
				return await this.cancel(this.pendingRolls.map(r => r.id));
			case "reroll":
				return await this.reroll(this.completedRolls);
		}
		if (action.startsWith("announce")) {
			return await this.announce(this.completedRolls, action.split('-')[1]);
		}
	}
	
	async _onOneGmAction(button, resultsWindow, action) {
		const actorid = button.data("actorid");
		switch (action) {
			case "roll":
				return await this.roll([this.pendingRolls.find(r => r.id === actorid).id]);
			case "notify":
				return await this.notify([this.pendingRolls.find(r => r.id === actorid).id]);
			case "cancel":
				return await this.cancel([this.pendingRolls.find(r => r.id === actorid).id]);
			case "reroll":
				const reroll = this.completedRolls.find(r => r.actor._id === actorid && r.roll.id === button.data("roll"));
				return await this.reroll([reroll]);
		}
		if (action.startsWith("announce")) {
			const announce = this.completedRolls.find(r => r.actor._id === actorid && r.roll.id === button.data("roll"));
			return await this.announce([announce], action.split('-')[1]);
		}
	}
	
	async notify(actorIds) {
		const newNotification = this.requestOptions.shrink();
		newNotification.requestActors = newNotification.requestActors.filter(ra => actorIds.includes(ra.actorId));
		Ceus.current.socketEngine.pushRefactorRequest(newNotification);
	}
	
	async roll(actorIds) {
		const newNotification = this.requestOptions.shrink();
		newNotification.requestUsers = [new ceus_RequestUser(game.user._id)];
		Ceus.current.socketEngine.pushRefactorRequest(newNotification);
	}
	
	async announce(rolls, dataAmount) {
		var dataSend = "";
		switch (dataAmount) {
			case "full":
				dataSend = `<table class="table table-bordered table-striped announce-results">
					<thead>
						<tr>
							<th>${game.i18n.localize("Ceus.Results.Announce.Character")}</th>
							<th>${game.i18n.localize("Ceus.Results.Announce.Roll")}</th>
							<th>${game.i18n.localize("Ceus.Results.Announce.Total")}</th>
							<th>${game.i18n.localize("Ceus.Results.Announce.Status")}</th>
						</tr>
					</thead>
					<tbody>`;
				for (const roll of rolls) {
					const passFail = roll.isPass ? "✅" : (roll.isFail ? "❌": "");
					const passClass = roll.isPass ? "pass" : (roll.isFail ? "fail" : "");
					const critClass = roll.result.critFail ? "crit-fail" : (roll.result.critSuccess ? "crit-success" : "");
				dataSend += `<tr class="result ${passClass} ${critClass}"><td class="character">${roll.actor.name}</td><td class="roll-name">${game.i18n.localize(roll.possibleRoll.name)}</td><td class="roll-total">${roll.result.rolledAmount}</td><td class="roll-status">${passFail}</td></tr>`;
				}
				dataSend += "</table>";
				break;
			case "any":
				const passFail = rolls.some(r => r.isPass) ? true : (rolls.some(r => r.isFail) ? false : null);
				const passFailClass = passFail == true ? "pass" : (passFail == false ? "fail" : "");
				const allRollNames = rolls.map(r => game.i18n.localize(r.possibleRoll.name));
				const uniqueRollNames = [...new Set(allRollNames)];
				const uniqueRoll = uniqueRollNames.join(", ");
				const status = passFail == true ? "✅" : (passFail == false ? "❌" : "");
				dataSend = `<div class="announce announce-any ${passFailClass}">
					<div class="announce-key">${uniqueRoll}</div>
					<div class="announce-result">${status}</div>
				</div>`;
				break;
			case "breakdown":
				dataSend = `<table class="table table-bordered table-striped announce-results">
					<thead>
						<tr>
							<th>${game.i18n.localize("Ceus.Results.Announce.Character")}</th>
							<th>${game.i18n.localize("Ceus.Results.Announce.Status")}</th>
						</tr>
					</thead>
					<tbody>`;
					
				const actorMap = {};
				rolls.forEach(roll => {
					const actorName = roll.actor.name;
					if (!actorMap.hasOwnProperty(actorName)) {
						actorMap[actorName] = {name:actorName, rollStatus: null};
					}
					if (roll.isPass) {
						actorMap[actorName].rollStatus = true;
					} else if (roll.isFail && actorMap[actorName].rollStatus !== true) {
						actorMap[actorName].rollStatus = false;
					}
				});
				const uniqueActors = Object.values(actorMap);
				for (const actor of uniqueActors) {
					const passFail = actor.rollStatus == true ? "✅" : (actor.rollStatus == false ? "❌": "");
					const passClass = actor.rollStatus == true ? "pass" : (actor.rollStatus == true ? "fail" : "");
					dataSend += `<tr class="result ${passClass}"><td>${actor.name}</td><td>${passFail}</td></tr>`;
				}
				dataSend += "</tbody></table>";
				break;
			case "success":
				for (const roll of rolls) {
					const passFail = roll.isPass ? "✅" : (roll.isFail ? "❌": "");
					const passClass = roll.isPass ? "pass" : (roll.isFail ? "fail" : "");
					
					dataSend = `<div class="announce-success ${passClass}">
						<div class="announce-success-roll">${game.i18n.localize(roll.possibleRoll.name)}</div>
						<div class="announce-success-character">${roll.actor.name}</div>
						<div class="announce-success-result">${passFail}</div>
					</div>`;
					break;
				}
		}
		
		let chatData = {
			user: game.user.id,
			content: `<div class="ceus announce-result">${dataSend}</div>`,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER
		};
		await ChatMessage.create(chatData);
	}
	
	async reroll(rolls) {
		const rp = Ceus.current.providerEngine.currentRollProvider;
		var possibleRolls = Utils.flattenRolls(rp.getAvailableRolls());
		var actorList = game.actors.entities || game.actors.contents;
		var userList = game.users.entities || game.users.contents;
		var rerollList = [];
		for (const roll of rolls) {
			const actorItem = actorList.find(al => al._id === roll.actor._id);
			var pendingRoll = this.pendingRolls.find(r => r.id == roll.actor._id);
			const possibleRoll = possibleRolls.find(pr => pr.id === roll.roll.rollId);
			const originalRequestItem = this.requestOptions.requestItems.find(ri => ri.id === roll.roll.id);
			var alreadyExists = true;
			if (!pendingRoll) {
				alreadyExists = false;
				pendingRoll = {
					img: roll.actor.img,
					name: roll.actor.name,
					id: roll.actor._id,
					users: [],
					rolls: [],
					isRolled: false,
					actor: roll.actor
				};
			}
			if (!pendingRoll.rolls.some(r => r.roll.id == roll.roll.id)) {
				pendingRoll.rolls.push(roll);
			}
			roll.isRolled = false;
			if (!pendingRoll.users.length) {
				for (const u of this.requestOptions.requestUsers) {
					const userItem = userList.find(ul => ul._id === u.userId);
					if (!userItem) { continue; }
					if (!Utils.doesUserControlActor(actorItem, userItem)) { continue; }
					pendingRoll.users.push(userItem);
				}
			}
			if (!rerollList.some(l => l.id === roll.roll.id)) {
				rerollList.push(originalRequestItem);
			}
			this.pendingRolls.push(pendingRoll);
			this.completedRolls = this.completedRolls.filter(r => !(r.actor._id == roll.actor._id && r.roll.id == roll.roll.id));
		}
		
		const newNotification = this.requestOptions.shrink();
		const rerollActors = rolls.map(r => r.actor._id);
		newNotification.requestActors = newNotification.requestActors.filter(ra => rerollActors.includes(ra.actorId));
		newNotification.requestItems = rerollList;
		Ceus.current.socketEngine.pushRefactorRequest(newNotification.shrink());
		
		this.render(false);
	}
	async cancel(actorIds) {
		const pendingRolls = this.pendingRolls.filter(r => actorIds.includes(r.id));
		const pendingResponses = [];
		for (const pendingRoll of pendingRolls) {
			for (const roll of pendingRoll.rolls) {
				roll.result = new ceus_Result(
					this.requestOptions.requestId,
					this.appId,
					pendingRoll.id,
					roll.roll.rollId,
					game.user._id,
					"-",
					false,
					null,
					null,
					"CANCELLED",
					false, false);
				roll.isRolled = false;
				roll.isPass = false;
				roll.isFail = false;
				roll.passClass = "cancelled";
				roll.user = game.user;
				roll.isAdvantage = false;
				roll.isDisadvantage = false;
				this.completedRolls.push(roll);
				pendingResponses.push({request: this.requestOptions, userid: game.user._id, response: roll.result});
			}
		}
		this.pendingRolls = this.pendingRolls.filter(r => !actorIds.includes(r.id));
		for (const pendingResponse of pendingResponses) {
			await Ceus.current.socketEngine.pushCompleteResponse(pendingResponse.request, pendingResponse.userid, pendingResponse.response);
		}
		
		this.render(false);
	}
	
	async appendCancel(result) {
		if (result.requestId !== this.requestOptions.id) { return; }
		const cancelNotification = game.i18n.localize("Ceus.Results.Cancel");
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
		const rp = Ceus.current.providerEngine.currentRollProvider;
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
				isRolled: false,
				actor: actorItem
			};
			for (const u of this.requestOptions.requestUsers) {
				const userItem = userList.find(ul => ul._id === u.userId);
				if (!userItem) { continue; }
				if (!Utils.doesUserControlActor(actorItem, userItem)) { continue; }
				pendingRoll.users.push(userItem);
			}
			for (const r of this.requestOptions.requestItems) {
				if (r.trainedOption === "HideUntrained" && !rp.isActorTrained(actorItem, r.rollType, r.rollId)) { continue; }
				const possibleRoll = possibleRolls.find(pr => pr.id === r.rollId);
				pendingRoll.rolls.push({
					actor: actorItem,
					roll: r,
					isRolled: false,
					possibleRoll: possibleRoll
				});
			}
			this.pendingRolls.push(pendingRoll);
		}
	}
	
	
	
	generateRollDescription(requestItem) {
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const flat = Utils.flattenRolls(rp.getAvailableRolls());
		
		const roll = flat.find(r => r.id === requestItem.rollId);
		const rollName = game.i18n.localize(roll.name);
		var rollDescription = rollName;
		if (requestItem.customBonus) {
			rollDescription += ` (+${requestItem.customBonus})`;
		}
		if (requestItem.dc) {
			rollDescription += `:DC${requestItem.dc}`;
		}
		if (rp.permitAdvantageDisadvantage()) {
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
		if (requestItem.trainedOption) {
			rollDescription += ' [' + game.i18n.localize(`Ceus.Requestor.SelectRolls.Trained.${requestItem.trainedOption}`) + ']';
		}
		return rollDescription;
	}
	
	
	
}