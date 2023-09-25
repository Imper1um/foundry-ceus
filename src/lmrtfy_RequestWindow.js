import { LMRTFY } from "./lmrtfy.js";
import { LMRTFYRoller } from "./roller.js";
import { lmrtfy_RequestOptions } from "./lmrtfy_RequestOptions.js";
import { lmrtfy_RequestUser } from "./lmrtfy_RequestUser.js";
import { lmrtfy_RequestActor } from "./lmrtfy_RequestActor.js";
import { lmrtfy_ResultsWindow } from "./lmrtfy_ResultsWindow.js";
import { lmrtfy_RequestItem } from "./lmrtfy_RequestItem.js";

export class lmrtfy_RequestWindow extends FormApplication {
	constructor(...args) {
		super(...args);
		if (!game.user.isGM) {
			ui.notifications.error("You are not a GM!");
			return;
		}
		game.users.apps.push(this);
		
		const rp = LMRTFY.current.providerEngine.currentRollProvider;
		this.requestOptions = new lmrtfy_RequestOptions("Get rolling...", "GM is requesting a roll");
		this.dice = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
		this.possibleActors = this.generatePossibleActors();
		this.possibleUsers = this.generatePossibleUsers();
		this.possibleActions = this.generatePossibleActions();
		this.trainedOptions = rp.trainedOptions() ? rp.trainedOptions().map(item => ({
			key: item,
			title: `SFRPG.Trained.${item}`
		})) : [];
		this.possibleContexts = rp.getContextList(this.requestOptions);
		this.errors = new Array();
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.title = game.i18n.localize("LMRTFY.Requestor.Title");
		options.id = `lmrtfy-requestor-${this.appId}`;
		options.template = LMRTFY.current.providerEngine.currentRollProvider.requestRollTemplate();
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 950;
		options.height = 800;
		options.classes = ["lmrtfy", "lmrtfy-requestor", "lmrtfy-refactor"];
		if (game.settings.get('lmrtfy', 'enableParchmentTheme')) {
			options.classes.push('lmrtfy-parchment');
		}
		return options;
	}
	
	async getData() {
		const rp = LMRTFY.current.providerEngine.currentRollProvider;
		this.regenerateErrors();
		return {
			appId: this.appId,
			requestOptions: this.requestOptions,
			possibleActors: this.possibleActors,
			possibleUsers: this.possibleUsers,
			possibleActions: this.possibleActions,
			trainedOptions: this.trainedOptions,
			permitAdvantageDisadvantage: rp.permitAdvantageDisadvantage(),
			needsContext: rp.needsContext(this.requestOptions),
			possibleContexts: this.possibleContexts,
			permitDC: rp.permitDC(),
			errors: this.errors,
			preventsMacro: this.preventsMacro,
			preventsSubmission: this.preventsSubmission,
			permitSetRollPrivacy: rp.permitSetRollPrivacy(),
			permitRequireRollPrivacy: rp.permitRequireRollPrivacy()
		};
	}
	
	activateListeners(html) {
		super.activateListeners(html);
		//Users
		html.find(".user-select .user").click(this._onUserSelect);
		html.find("#users-addAll-gm").click(this._onUsersAddAllGm);
		html.find("#users-addAll-assistant").click(this._onUsersAddAllAssistant);
		html.find("#users-addAll-trusted").click(this._onUsersAddAllTrusted);
		html.find("#users-addAll-player").click(this._onUsersAddAllPlayer);
		html.find("#users-addAll-online").click(this._onUsersAddAllOnline);
		html.find("#users-addAll-everyone").click(this._onUsersAddAllEveryone);
		html.find("#users-clear").click(this._onUsersClear);
		//Actors
		html.find(".actor-select .actor").click(this._onActorSelect);
		html.find("#actors-addAll-friendly").click(this._onActorsAddAllFriendly);
		html.find("#actors-addAll-neutral").click(this._onActorsAddAllNeutral);
		html.find("#actors-addAll-enemy").click(this._onActorsAddAllEnemy);
		html.find("#actors-addAll-secret").click(this._onActorsAddAllSecret);
		html.find("#actors-addAll-players").click(this._onActorsAddAllPlayers);
		html.find("#actors-addAll-nonplayers").click(this._onActorsAddAllNonPlayers);
		html.find("#actors-clear").click(this._onActorsClear);
		//Context
		html.find("#context-selection").change(this._onContextChange);
		//Roll Number
		html.find("#roll-number").change(this._onRollNumberChange);
		//Roll Privacy
		html.find('#roll-privacy').change(this._onRollPrivacyChange);
		html.find('#roll-require-privacy').change(this._onRollRequirePrivacyChange);
		//Title
		html.find('#title-selection').change(this._onTitleChange);
		html.find('#message-selection').change(this._onMessageChange);
		//Rolls
		html.find(".selector-roll").change(this._onSelectorRollChange);
		html.find(".selector-custombonus").change(this._onSelectorCustomBonusChange);
		html.find(".selector-dc").change(this._onSelectorDcChange);
		html.find(".selector-advantageDisadvantage").change(this._onSelectorAdvantageDisadvantageChange);
		html.find(".selector-trained").change(this._onSelectorTrainedChange);
		html.find(".requestItem-delete").click(this._onRequestItemDelete);
		html.find("#add-roll").click(this._onAddRoll);
		html.find("#clear-rolls").click(this._onClearRolls);
		//Buttons
		html.find("#button-gmroll").click(this._onGmRoll);
		html.find("#button-ask").click(this._onAsk);
		html.find("#button-macro-request").click(this._onMacroRequest);
		html.find("#button-macro-gmroll").click(this._onMacroGmRoll);
		html.find("#button-macro-ask").click(this._onMacroAsk);
	}
	
	async _onMacroRequest(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestOptions = requestWindow.requestOptions;
		const requestActors = requestOptions.requestActors.map(ra => ra.name).join(", ");
		const requestUsers = requestOptions.requestUsers.map(ru => ru.name).join(", ");
		const requestContent = requestOptions.shrink();
		const scriptContent = `// Request Rolls\n
			// Users: ${requestUsers}\n
			// Actors: ${requestActors}\n
			// Title: ${requestOptions.title}\n
			// Message: ${requestOptions.message}\n
			const data = ${JSON.stringify(requestOptions.shrink())};\n
			LMRTFY.openRequest(data);`;
		const macro = await Macro.create({
			name: "LMRTFY: " + (requestOptions.title || requestOptions.message),
			type: "script",
			scope: "global",
			command: scriptContent,
			img: "icons/svg/d20-highlight.svg"
		});
		macro.sheet.render(true);
	}
	
	async _onMacroGmRoll(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestOptions = requestWindow.requestOptions;
		const requestActors = requestOptions.requestActors.map(ra => ra.name).join(", ");
		const requestUsers = requestOptions.requestUsers.map(ru => ru.name).join(", ");
		const requestContent = requestOptions.shrink();
		const scriptContent = `// Request Rolls\n
			// Users: ${requestUsers}\n
			// Actors: ${requestActors}\n
			// Title: ${requestOptions.title}\n
			// Message: ${requestOptions.message}\n
			const data = ${JSON.stringify(requestOptions.shrink())};\n
			LMRTFY.gmRoll(data);`;
		const macro = await Macro.create({
			name: "LMRTFY: " + (requestOptions.title || requestOptions.message),
			type: "script",
			scope: "global",
			command: scriptContent,
			img: "icons/svg/d20-highlight.svg"
		});
		macro.sheet.render(true);
	}
	
	async _onMacroAsk(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestOptions = requestWindow.requestOptions;
		const requestActors = requestOptions.requestActors.map(ra => ra.name).join(", ");
		const requestUsers = requestOptions.requestUsers.map(ru => ru.name).join(", ");
		const requestContent = requestOptions.shrink(); 
		const scriptContent = `// Request Rolls\n
			// Users: ${requestUsers}\n
			// Actors: ${requestActors}\n
			// Title: ${requestOptions.title}\n
			// Message: ${requestOptions.message}\n
			const data = ${JSON.stringify(requestOptions.shrink())};\n
			LMRTFY.requestRoll(data);`;
		const macro = await Macro.create({
			name: "LMRTFY: " + (requestOptions.title || requestOptions.message),
			type: "script",
			scope: "global",
			command: scriptContent,
			img: "icons/svg/d20-highlight.svg"
		});
		macro.sheet.render(true);
	}
	
	async _onAsk(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestOptions = requestWindow.requestOptions;
		const resultsWindow = new lmrtfy_ResultsWindow(requestOptions, "ask");
		resultsWindow.handleRequestOptions();
		resultsWindow.render(true);
		LMRTFY.current.socketEngine.pushRefactorRequest(requestOptions.shrink());
	}
	
	async _onGmRoll(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestOptions = requestWindow.requestOptions;
		
		const resultsWindow = new lmrtfy_ResultsWindow(requestOptions, "gmroll");
		resultsWindow.handleRequestOptions();
		resultsWindow.render(true);
		const shrunkResults = requestOptions.shrink();
		//#TODO
	}
	
	async _onRollPrivacyChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		requestWindow.requestOptions.rollPrivacy = item.val();
	}
	
	async _onTitleChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		requestWindow.requestOptions.title = item.val();
	}
	
	async _onMessageChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		requestWindow.requestOptions.message = item.val();
	}
	
	async _onRollRequirePrivacyChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		requestWindow.requestOptions.requireRollPrivacy = item.is(":checked");
	}
	
	async _onClearRolls(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemId = item.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		requestWindow.requestOptions.requestItems = new Array();
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	async _onRequestItemDelete(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemId = item.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestItem = requestWindow.requestOptions.requestItems.find(i => i.id == requestItemId);
		if (requestItem) {
			requestWindow.requestOptions.requestItems.splice(requestWindow.requestOptions.requestItems.findIndex(ri => ri.id == requestItem.id), 1);
		}
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	async _onSelectorTrainedChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemParent = item.parents('.requestItem');
		const requestItemId = requestItemParent.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestItem = requestWindow.requestOptions.requestItems.find(i => i.id == requestItemId);
		if (requestItem) {
			requestItem.trainedOption = item.val();
		}
	}
	
	async _onSelectorAdvantageDisadvantageChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemParent = item.parents('.requestItem');
		const requestItemId = requestItemParent.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestItem = requestWindow.requestOptions.requestItems.find(i => i.id == requestItemId);
		if (requestItem) {
			requestItem.advantageDisadvantage = item.val();
		}
	}
	
	async _onRollNumberChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		
		requestWindow.requestOptions.rollNumber = item.val();
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	async _onSelectorDcChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemParent = item.parents('.requestItem');
		const requestItemId = requestItemParent.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestItem = requestWindow.requestOptions.requestItems.find(i => i.id == requestItemId);
		if (requestItem) {
			requestItem.dc = item.val();
		}
	}
	
	async _onSelectorCustomBonusChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestItemParent = item.parents('.requestItem');
		const requestItemId = requestItemParent.data('id');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const requestItem = requestWindow.requestOptions.requestItems.find(i => i.id == requestItemId);
		if (requestItem) {
			requestItem.customBonus = item.val();
		}
	}
	
	async _onSelectorRollChange(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		const id = item.data("id");
		const val = item.val();
		
		const requestItem = requestWindow.requestOptions.requestItems.find(a => a.id === id);
		
		requestWindow.buildRollForDefault(requestItem, val);
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	

	buildRollForDefault(item, id) {
		var action = this.possibleActions.find(a => a.id == id);
		if (!action) { return item; }
		
		item.rollId = action.id;
		item.rollType = action.rollType;
		item.trainedOptions = LMRTFY.current.providerEngine.currentRollProvider.rollTrainedOptions(action.rollType, action.id);
		item.trainedOption = "";
		if (item.trainedOptions && item.trainedOptions.length) {
			item.trainedOption = item.trainedOptions.find(() => true);
		}
		item.customBonus = "";
		item.dc = "",
		item.advantageDisadvantage = "require-normal";
		item.allowDC = LMRTFY.current.providerEngine.currentRollProvider.allowDC(action.rollType, action.id);
		item.permitDC = LMRTFY.current.providerEngine.currentRollProvider.permitDC();
		item.permitAdvantageDisadvantage = LMRTFY.current.providerEngine.currentRollProvider.permitAdvantageDisadvantage();
		item.canCritSuccess = action.canCritSuccess;
		item.canCritFail = action.canCritFail;
	}
	
	async _onAddRoll(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		var nextId = 1;
		if (requestWindow.requestOptions.requestItems && requestWindow.requestOptions.requestItems.length) {
			nextId = Math.max(...requestWindow.requestOptions.requestItems.map(obj => obj.id)) + 1;
		}
		var newItem = new lmrtfy_RequestItem("", "", "", "", "allow-all");
		newItem.id = nextId;
		newItem.appId = requestWindow.appId;
		
		var firstItem = requestWindow.possibleActions.find(a => a.type === "roll");
		requestWindow.buildRollForDefault(newItem, firstItem.id);
		requestWindow.requestOptions.requestItems.push(newItem);
		const data = await requestWindow.getData();
		requestWindow.render(false, {action: "update", context: data});
	}
	
	async _onActorsClear(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => true, false);
	}
	
	async _onActorsAddAllNonPlayers(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => !u.isPlayer && u.isVisible, true);
	}
	
	async _onActorsAddAllPlayers(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.isPlayer && u.isVisible, true);

	}
	
	async _onActorsAddAllSecret(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.disposition === -2 && u.isVisible, true);
	}	
	
	
	async _onActorsAddAllEnemy(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.disposition === -1 && u.isVisible, true);
	}
	
	async _onActorsAddAllNeutral(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.disposition === 0 && u.isVisible, true);
	}
	
	async _onActorsAddAllFriendly(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.disposition === 1 && u.isVisible, true);
	}
	
	async regenerateErrors() {
		const errors = new Array();
		var preventsSubmission = false;
		var preventsMacro = false;
		if (!this.requestOptions.requestUsers.length) {
			errors.push({type: "error", preventsSubmission: true, preventsMacro: true, content: game.i18n.localize("LMRTFY.Errors.NoUsers")});
			preventsSubmission = true;
			preventsMacro = true;
		}
		if (!this.requestOptions.requestActors.length) {
			errors.push({type: "error", preventsSubmission: true, preventsMacro: true, content: game.i18n.localize("LMRTFY.Errors.NoActors")});
			preventsSubmission = true;
			preventsMacro = true;
		}
		if (!this.requestOptions.requestItems.length) {
			errors.push({type: "error", preventsSubmission: true, preventsMacro: true, content: game.i18n.localize("LMRTFY.Errors.NoRolls")});
			preventsSubmission = true;
			preventsMacro = true;
		}
		if (!preventsSubmission && !preventsMacro) {
			var hasActive = false;
			for (const ru of this.requestOptions.requestUsers) {
				const pu = this.possibleUsers.find(p => p.id == ru.userId);
				if (pu.active) {
					hasActive = true;
				}
			}
			if (!hasActive) {
				errors.push({type: "error", preventsSubmission: true, preventsMacro: false, content: game.i18n.localize("LMRTFY.Errors.NoActive")});
			}
		}
		this.preventsSubmission = preventsSubmission;
		this.preventsMacro = preventsMacro;
		this.errors = errors;
		
	}
	
	async regenerateActorVisibility(parentForm) {
		var actorShouldBeVisible = new Array();
		var isGmSelect = false;
		for (const possibleUser of this.possibleUsers.filter(u => u.isSelected)) {
			actorShouldBeVisible = actorShouldBeVisible.concat(possibleUser.ownership);
			if (possibleUser.role == 4) {
				isGmSelect = true;
			}
		}
		for (const possibleActor of this.possibleActors) {
			possibleActor.isVisible = isGmSelect || actorShouldBeVisible.some(a => a.id === possibleActor.actorId);
			if (!possibleActor.isVisible) {
				possibleActor.isSelected = false;
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).removeClass('selected');
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).addClass('not-selected');
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).removeClass('visible');
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).addClass('invisible');
			} else {
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).addClass('visible');
				parentForm.find(`.actor[data-id="${possibleActor.actorId}"]`).removeClass('invisible');
			}
		}
	}
	
	async _onActorSelect(event) {
		const item = $(event.currentTarget);
		const id = item.data("id");
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleActors(event, u => u.actorId === id, null);
	}
	
	async toggleActors(event, filterActors, state) {
		event.preventDefault();
		
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		
		const filteredActors = this.possibleActors.filter(filterActors);
		for (const actor of filteredActors) {
			if ((state === true || state === null) && !actor.isSelected) {
				actor.isSelected = true;
				if (!this.requestOptions.requestActors.some(u => u.actorId === actor.actorId)) {
					this.requestOptions.requestActors.push(new lmrtfy_RequestActor(actor.actorId, actor.name, actor.imgUrl));
				}
				parentForm.find(`.actor-select .actor[data-id="${actor.actorId}"]`).addClass("selected");
				parentForm.find(`.actor-select .actor[data-id="${actor.actorId}"]`).removeClass("not-selected");
			} else if ((state === false || state === null) && actor.isSelected) {
				actor.isSelected = false;
				if (this.requestOptions.requestActors.some(u => u.actorId === actor.actorId)) {
					this.requestOptions.requestActors = this.requestOptions.requestActors.splice(this.requestOptions.requestActors.findIndex(u => u.actorId === actor.actorId), 1);
				}
				parentForm.find(`.actor-select .actor[data-id="${actor.actorId}"]`).removeClass("selected");
				parentForm.find(`.actor-select .actor[data-id="${actor.actorId}"]`).addClass("not-selected");
			}
		}
	}
	
	async toggleUsers(event, filterUsers, state) {
		event.preventDefault();
		
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		
		const filteredUsers = this.possibleUsers.filter(filterUsers);
		for (const user of filteredUsers) {
			if ((state === true || state === null) && !user.isSelected) {
				user.isSelected = true;
				if (!this.requestOptions.requestUsers.some(u => u.userId === user.id)) {
					this.requestOptions.requestUsers.push(new lmrtfy_RequestUser(user.id, user.name, user.img));
				}
				parentForm.find(`.user-select .user[data-id="${user.id}"]`).addClass("selected");
				parentForm.find(`.user-select .user[data-id="${user.id}"]`).removeClass("not-selected");
			} else if ((state === false || state === null) && user.isSelected) {
				user.isSelected = false;
				if (this.requestOptions.requestUsers.some(u => u.userId === user.id)) {
					this.requestOptions.requestUsers = this.requestOptions.requestUsers.splice(this.requestOptions.requestUsers.findIndex(u => u.userId === user.id), 1);
				}
				parentForm.find(`.user-select .user[data-id="${user.id}"]`).removeClass("selected");
				parentForm.find(`.user-select .user[data-id="${user.id}"]`).addClass("not-selected");
			}
		}
		await this.regenerateActorVisibility(parentForm);
	}
	
	async _onUsersClear(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => true, false);
	}
	
	async _onUsersAddAllEveryone(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => true, true);
	}
	
	async _onUsersAddAllOnline(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.active, true);
	}
	
	async _onUsersAddAllPlayer(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.role === 1, true);
	}
	
	async _onUsersAddAllTrusted(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.role === 2, true);
	}
	
	async _onUsersAddAllAssistant(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.role === 3, true);
	}
	
	async _onUsersAddAllGm(event) {
		const item = $(event.currentTarget);
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.role === 4, true);
	}

	async _onUserSelect(event) {
		const item = $(event.currentTarget);
		const id = item.data("id");
		const parentForm = item.parents('.lmrtfy-form');
		const dataParent = parentForm.data('appid');
		const requestWindow = game.users.apps.find(a => a.appId == dataParent);
		await requestWindow.toggleUsers(event, u => u.id === id, null);
	}
	
	render(force, context={}) {
		const {action, data} = context;
		if (action && !["create", "update", "delete"].includes(action)) return;
		if (force !== true && !action) return;
		return super.render(force, context);
	}
	
	generateAdvantageDisadvantage(rollType, id) {
		const rp = LMRTFY.current.providerEngine.currentRollProvider;
		return {
			"id": id,
			"rollType": rollType,
			"allowAdvantage": rp.canActionAdvantage(rollType, id),
			"allowDisadvantage": rp.canActionDisadvantage(rollType, id)
		};
	}
	
	generatePossibleActions() {
		const currentRollProvider = LMRTFY.current.providerEngine.currentRollProvider;
		const availableRolls = currentRollProvider.getAvailableRolls();
		const actionTree = this.buildActionTree(0, availableRolls);
		actionTree.push({
			"type": "category",
			"selectable": false,
			"name": "LMRTFY.Actions.Dice",
			"depth": 0
		});
		for (const die of this.dice) {
			actionTree.push({
				"type": "roll",
				"id": `Roll.${die}`,
				"rollType": LMRTFYRoller.rollTypes().DICE,
				"selectable": true,
				"name": die,
				"depth": 1
			});
		}
		actionTree.push({
			"type": "category",
			"selectable": false,
			"name": "LMRTFY.Actions.Custom",
			"depth": 0
		});
		actionTree.push({
			"type": "roll",
			"id": 'Roll.Custom',
			"rollType": LMRTFYRoller.rollTypes().CUSTOM,
			"selectable": true,
			"name": "LMRTFY.Actions.Custom",
			"depth": 1
		});
		for (const item in actionTree) 
		{
			if (item.id && item.rollType)
			{
				item.advantageDisadvantage = this.generateAdvantageDisadvantage(item.rollType, item.id);
			}
		}
		return actionTree;
	}
	
	buildActionTree(depth, availableRolls) {
		var actionTree = new Array();
		for (const roll of availableRolls) {
			if (roll.type === "category") {
				actionTree.push({
					"type": "category",
					"value": "",
					"selectable": false,
					"name": roll.name,
					"depth": depth
				});
				actionTree = actionTree.concat(this.buildActionTree(depth + 1, roll.rolls));
			} else {
				actionTree.push({
					"type": "roll",
					"id": roll.id,
					"rollType": roll.rollType,
					"depth": depth,
					"name": roll.name,
					"selectable": true,
					"advantageDisadvantage": this.generateAdvantageDisadvantage(roll.rollType, roll.id)
				});
			}
		}
		return actionTree;
	}
	
	generatePossibleUsers() {
		const actors = game.actors.entities || game.actors.contents;
		const users = game.users.entities || game.users.contents;
		
		const possibleUsers = new Array();
		for (const usr of users) {
			possibleUsers.push({
				"id": usr._id,
				"role": usr.role,
				"name": usr.name,
				"img": usr.avatar,
				"color": usr.color,
				"active": usr.active,
				"isSelected": false,
				"ownership": this.buildOwnership(usr, actors)
			});
		}
		return possibleUsers;
	}
	
	buildOwnership(usr, actors) {
		var possibleOwnership = new Array();
		var userCharacter = usr.character ? usr.character.id : null;
		for (var actor of actors) {
			var id = actor._id;
			var isOwned = false;
			var isControlled = false;
			if (id === userCharacter) {
				isOwned = true;
				isControlled = true;
			} else {
				const ownership = actor.ownership[usr._id] ?? actor.ownership["default"];
				if (ownership === 3) {
					isOwned = true;
				}
			}
			if (isOwned || isControlled) {
				possibleOwnership.push({
					id: id,
					isOwned: isOwned,
					isControlled: isControlled
				});
			}
		}
		return possibleOwnership;
	}
	
	generatePossibleActors() {
		const currentRollProvider = LMRTFY.current.providerEngine.currentRollProvider;
		const possibleActors = new Array();
		const possibleRolls = this.buildAvailableRolls(currentRollProvider.getAvailableRolls());
		for (const actor of game.actors) {
			var possibleActor = new lmrtfy_RequestActor(actor._id, actor.name, actor.img);
			possibleActor.isSelected = false;
			possibleActor.isVisible = false;
			possibleActor.disposition = actor.prototypeToken.disposition;
			switch (possibleActor.disposition) {
				case -2:
					possibleActor.dispositionClass = 'secret';
					break;
				case -1:
					possibleActor.dispositionClass = 'enemy';
					break;
				case 0:
					possibleActor.dispositionClass = 'neutral';
					break;
				case 1:
					possibleActor.dispositionClass = 'friendly';
					break;
			}
			possibleActor.isPlayer = currentRollProvider.isPlayer(actor);
			possibleActors.push(possibleActor);
		}
		return possibleActors;
	}
	
	buildActorAvailableRolls(possibleRolls, actor) {
		const availableRolls = new Array();
		const currentRollProvider = LMRTFY.current.providerEngine.currentRollProvider;
		for (const roll of possibleRolls) {
			availableRolls.push({
				"id": roll.id,
				"name": roll.name,
				"isTrained": currentRollProvider.isActorTrained(actor, roll.rollType, roll.id),
				"canSee": currentRollProvider.canActorSeeRoll(actor, roll.rollType, roll.id, "HideUntrained"),
				"canRoll": currentRollProvider.canActorRoll(actor, roll.rollType, roll.id, "PreventUntrained")
			});
		}
		return availableRolls;
	}
	
	buildAvailableRolls(rolls) {
		var availableRolls = new Array();
		for (const r of rolls) {
			if(r.type === "Category") {
				availableRolls = availableRolls.concat(this.buildAvailableRolls(r.rolls));
				continue;
			}
			if (r.type === "Roll") {
				availableRolls.push({
					"id": r.id,
					"name": r.name,
					"rollType": r.rollType
				});
			}
		}
		return availableRolls;
	}
}