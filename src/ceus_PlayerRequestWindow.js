import { Utils } from "./Utils.js";
import { Ceus } from "./ceus.js";

export class ceus_PlayerRequestWindow extends FormApplication {
	constructor(data, ...args) {
		super(...args);
		this.needsToBeDisplayed = false;
		
		this.requestOptions = data;
		this.handleRequestOptions();
		
		if (this.needsToBeDisplayed) {
			game.users.apps.push(this);
			Ceus.current.socketEngine.addCompleteWatcher(this.appId, this.onComplete, this.onFilter);
		}
	}
	
	async onFilter(data) {
		return data.request.resultId === this.appId;
	}
	
	async onComplete(data) {
		await this.handleExternalResult(data);
	}
	
	async _onClose(options = {}) {
		await super._onClose(options);
		Ceus.current.socketEngine.removeCompleteWatcher(this.appId);
		Ceus.current.socketEngine.pushCancelResponse(this.requestOptions, game.user._id);
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = game.i18n.localize("Ceus.Player.Title");
		options.id = `ceus-results-${this.appId}`;
		options.template = Ceus.current.providerEngine.currentRollProvider.playerRequestTemplate();
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 950;
		options.height = 800;
		options.classes = ["ceus", "ceus-results", "ceus-refactor"];
		if (game.settings.get('ceus', 'enableParchmentTheme')) {
			options.classes.push('ceus-parchment');
		}
		return options;
	}
	
	async getData() {
		return {
			requestOptions: this.requestOptions,
			isAnd: this.requestOptions.rollNumber === "all",
			isOr: this.requestOptions.rollNumber === "one",
			actors: this.actors,
			appId: this.appId
		};
	}
	
	activateListeners(html) {
		html.find(".check-button").click(this._onCheck);
	}

	
	async _onCheck(event) {
		event.preventDefault();
		const target = $(event.currentTarget);
		const actorId = target.data("actorid");
		const checkId = target.data("checkid");
		const parentForm = $(target.parents('.ceus-form'));
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const rp = Ceus.current.providerEngine.currentRollProvider;
		
		const actorItem = requestWindow.actors.find(a => a.actor._id === actorId);
		if (!actorItem) {
			ui.notifications.error("Unable to find actor!");
			return;
		}
		const checkItem = actorItem.checks.find(c => c.check.rollId === checkId);
		if (!checkItem) {
			ui.notifications.error("Unable to find check!");
			return;
		}
		
		const result = await checkItem.roll.method(requestWindow.requestOptions, actorItem.actor, checkItem.check);
		if (rp.displayRequiredByMod()) {
			await rp.displayRoll(requestWindow.requestOptions, game.user, actorItem.actor, checkItem.check, result);
		}
		await Ceus.current.socketEngine.pushCompleteResponse(requestWindow.requestOptions, game.user._id, result);
		checkItem.doneClass = "done";
		if (requestWindow.requestOptions.rollNumber === "one") {
			actorItem.doneClass = "done";
			actorItem.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollDone");
		} else if (actorItem.checks.every(i => i.doneClass === "done")) {
			actorItem.doneClass = "done";
			actorItem.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollDone");
		} else if (requestWindow.requestOptions.rollNumber === "any") {
			actorItem.doneClass = "any";
			actorItem.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollAny");
		}
		if (requestWindow.actors.every(a => a.checks.every(i => i.doneClass === "done"))) {
			requestWindow.close();
			return;
		}
		
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	handleRequestOptions() {
		this.actors = [];
		const user = game.user;
		const userCharacter = user.character;
		
		const possibleRolls = Utils.flattenRolls(Ceus.current.providerEngine.currentRollProvider.getAvailableRolls());
		
		const requestUsers = this.requestOptions.requestUsers.find(ru => ru.userId === user._id);
		if (!requestUsers) {
			return;
		}
		for (const requestActor of this.requestOptions.requestActors) {
			const actor = game.actors.get(requestActor.actorId);
			if (!actor) { continue; }
			if (!Utils.doesUserControlActor(actor, user)) { continue; }
			var checks = [];
			for (const check of this.requestOptions.requestItems) {
				const roll = possibleRolls.find(r => r.id === check.rollId);
				if (!roll) {
					continue;
				}
				if (check.trainedOption === "HideUntrained" && !Ceus.current.providerEngine.currentRollProvider.isActorTrained(actor, roll.rollType, check.rollId)) {
					continue;
				}
				checks.push({ roll, check, doneClass: "" });
			}
			if (checks.length) {
				for (const c in checks) {
					checks[c].isNotLast = c < (checks.length - 1);
				}
				this.needsToBeDisplayed = true;
				this.actors.push({
					actor: actor,
					checks: checks,
					doneClass: ""
				});
			}
		}
	}
	
	async handleExternalResult(result) {
		if (result.requestId !== this.requestOptions.id) { return; }
		const actor = this.actors.find(a => a.actor._id === result.requestActorId);
		if (!actor) { return; }
		const check = actor.checks.find(c => c.check.rollId === result.requestItemId);
		if (!check) { return; }
		check.doneClass = "done";
		if (this.requestOptions.rollNumber === "one") {
			actor.doneClass = "done";
			actor.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollDone");
		} else if (actor.checks.every(i => i.doneClass === "done")) {
			actor.doneClass = "done";
			actor.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollDone");
		} else if (this.requestOptions.rollNumber === "any") {
			actor.doneClass = "any";
			actor.doneMessage = game.i18n.localize("Ceus.Player.Warnings.RollAny");
		}
		
		if (requestWindow.actors.every(a => a.checks.every(i => i.doneClass === "done"))) {
			requestWindow.close();
			ui.notifications.info(game.i18n.localize("Ceus.Player.CloseInfo"));
			return;
		}
		
		const data = await this.getData();
		this.render(false, {action: "update", context: data});
	}
	
	
}