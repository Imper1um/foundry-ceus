export class lmrtfy_PlayerRequestWindow extends FormApplication {
	constructor(...args) {
		super(...args);
		this.needsToBeDisplayed = false;
		
		if (args.length) {
			const val = args[0];
			if (val instanceof lmrtfy_RequestOptions) {
				this.requestOptions = val;
				this.requestType = "self";
				if (args.length > 1) {
					this.requestType = args[1];
				}
				this.handleRequestOptions();
			}
		}
		if (this.needsToBeDisplayed) {
			game.users.apps.push(this);
		}
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = game.i18n.localize("LMRTFY.Player.Title");
		options.id = `lmrtfy-results-${this.appId}`;
		options.template = LMRTFY.current.providerEngine.currentRollProvider.playerRequestTemplate();
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
			isAnd: this.requestOptions.rollNumber === "all",
			isOr: this.requestOptions.rollNumber === "one",
			actors: this.actors
		};
	}
	
	activateListeners(html) {
		html.find(".actor").click(this._onActorChange);
		html.find(".actor").on("mouseover", this._onActorMouseOver);
		html.find(".actor").on("mouseout", this._onActorMouseOut);
		html.find(".check-button").click(this._onCheck);
	}
	
	_onActorMouseOver(event) {
		const target = $(event.currentTarget);
		target.addClass("mouseover");
	}
	
	_onActorMouseOut(event) {
		const target = $(event.currentTarget);
		target.removeClass("mouseover");
	}
	
	async _onActorChange(event) {
		const target = $(event.currentTarget);
		const actorId = target.data("id");
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		for (const a in requestWindow.actors) {
			a.selectedClass = a.actor._id === actorId ? "selected" : "not-selected";
		}
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	async _onCheck(event) {
		const target = $(event.currentTarget);
		const actorId = target.data("actorid");
		const checkId = target.data("checkid");
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		const actorItem = requestWindow.actors.find(a => a.actor._id === actorId);
		if (!actorItem) {
			ui.notifications.error("Unable to find actor!");
			return;
		}
		const checkItem = actorItem.checks.find(c => c.check.id === checkId);
		if (!checkItem) {
			ui.notifications.error("Unable to find check!");
			return;
		}
		
		const result = await checkItem.roll.method(requestWindow.requestOptions, actorItem.actor, checkItem.check);
		await LMRTFY.socketEngine.pushCompleteResponse(requestWindow.requestOptions, game.user._id, result);
		checkItem.doneClass = "done";
		if (requestWindow.requestOptions.rollNumber === "one") {
			actorItem.doneClass = "done";
		} else if (actorItem.checks.every(i => i.doneClass === "done")) {
			actorItem.doneClass = "done";
		} else if (requestWindow.requestOptions.rollNumber === "any") {
			actorItem.doneClass = "any";
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
		const possibleRolls = this.flattenRolls(LMRTFY.current.providerEngine.currentRollProvider.getAvailableRolls());
		
		const requestUsers = this.requestOptions.requestUsers.find(ru => ru.userId === user._id);
		if (!requestUsers) {
			return;
		}
		for (const requestActor of this.requestOptions.requestActors) {
			const actor = game.actors.get(requestActor.actorId);
			if (!actor) { continue; }
			if (!this.doesUserControlActor(actor, user)) { continue; }
			var checks = [];
			for (const check of this.requestOptions.requestItems) {
				const roll = possibleRolls.find(r => r.id === check.rollId);
				if (!roll) {
					continue;
				}
				if (check.trainedOption === "HideUntrained" && !isActorTrained(actor, roll.rollType, check.rollId)) {
					continue;
				}
				checks.push({ roll, check, selectedClass: "not-selected", doneClass: "" });
			}
			if (checks.length) {
				for (const c in checks) {
					checks[c].isNotLast = c < (checks.length - 1);
				}
				this.needsToBeDisplayed = true;
				this.actors.push({
					actor: actor,
					checks: checks,
					doneClass: "",
					selectedClass: "not-selected"
				});
			}
		}
	}
	
	flattenRolls(rollList) {
		var flat = new Array();
		for (const r in rollList) {
			flat.push(r);
			if (r.rolls) {
				flat.concat(this.flattenRolls(r.rolls));
			}
		}
		return flat;
	}
	
	doesUserControlActor(actor, user) {
		if (user.isGM) {
			return true;
		}
		if (user.character && user.character._id == actor._id) {
			return true;
		}
		var ownership = actor.ownership["default"];
		if (actor.ownership[user._id]) { ownership = actor.ownership[user._id]; }
		return ownership >= 3;
	}
}