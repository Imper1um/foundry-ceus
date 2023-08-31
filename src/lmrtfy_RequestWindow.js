import { LMRTFY } from "./lmrtfy.js";
import { LMRTFYRoller } from "./roller.js";
import { lmrtfy_RequestOptions } from "./lmrtfy_RequestOptions.js";
import { lmrtfy_RequestUser } from "./lmrtfy_RequestUser.js";
import { lmrtfy_RequestActor } from "./lmrtfy_RequestActor.js";

export class lmrtfy_RequestWindow extends FormApplication {
	constructor(...args) {
		super(...args);
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
		options.id = "lmrtfy-requestor";
		options.template = LMRTFY.current.providerEngine.currentRollProvider.requestRollTemplate();
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 750;
		options.height = "auto";
		options.classes = ["lmrtfy", "lmrtfy-requestor", "lmrtfy-refactor"];
		if (game.settings.get('lmrtfy', 'enableParchmentTheme')) {
			options.classes.push('lmrtfy-parchment');
		}
		return options;
	}
	
	async getData() {
		const rp = LMRTFY.current.providerEngine.currentRollProvider;
		return {
			options: this.requestOptions,
			possibleActors: this.possibleActors,
			possibleUsers: this.possibleUsers,
			possibleActions: this.possibleActions,
			trainedOptions: this.trainedOptions,
			permitAdvantageDisadvantage: rp.permitAdvantageDisadvantage(),
			needsContext: rp.needsContext(this.requestOptions),
			possibleContexts: this.possibleContexts,
			permitDC: rp.permitDC(),
			errors: this.errors
		};
	}
	
	activateListeners(html) {
		super.activateListeners(html);
		//Users
		html.find(".user-select").click(this._onUserSelect);
		html.find("#users-addAll-gm").click(this._onUsersAddAllGm);
		html.find("#users-addAll-assistant").click(this._onUsersAddAllAssistant);
		html.find("#users-addAll-trusted").click(this._onUsersAddAllTrusted);
		html.find("#users-addAll-player").click(this._onUsersAddAllPlayer);
		html.find("#users-addAll-online").click(this._onUsersAddAllOnline);
		html.find("#users-addAll-everyone").click(this._onUsersAddAllEveryone);
		html.find("#users-clear").click(this._onUsersClear);
		//Actors
		html.find(".actor-select").click(this._onActorSelect);
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
		html.find("#button-macro-gmroll").click(this.onMacroGmRoll);
		html.find("#button-macro-ask").click(this.onMacroAsk);
	}
	
	async regenerateErrors() {
		const errors = new Array();
		if (!this.requestOptions.requestUsers) {
			errors.push({type: "error", preventsSubmission: true, content: game.i18n.format("LMRTFY.Errors.NoUsers")});
		}
		if (!this.requestOptions.requestActors) {
			errors.push({type: "error", preventsSubmission: true, content: game.i18n.format("LMRTFY.Errors.NoActors")});
		}
		if (!this.requestOptions.requestItems) {
			errors.push({type: "error", preventsSubmission: true, content: game.i18n.format("LMRTFY.Errors.NoRolls")});
		}
		//#TODO: Errors and warnings that may cause issues.
		this.errors = errors;
	}
	
	async regenerateActorVisibility() {
		var actorShouldBeVisible = new Array();
		for (const possibleUser of this.possibleUsers) {
			actorShouldBeVisible = actorShouldBeVisible.concat(possibleUser.ownership);
		}
		for (const possibleActor of this.possibleActors) {
			possibleActor.isVisible = actorShouldBeVisible.some(a => a.id === possibleActor.actorId);
			if (!possibleActor.isVisible) {
				possibleActor.isSelected = false;
			}
		}
	}
	
	async _onActorSelect(event) {
		event.preventDefault();
		const item = $(event.currentTarget);
		const id = item.data("id");
		
		const possibleActor = this.possibleActors.find(pa => pa.id === id);
		if (!possibleActor) { return; }
		if (possibleActor.isSelected) {
			possibleActor.isSelected = false;
			const index = this.requestOptions.requestActors.findIndex(u => u.actorId === id);
			
			if (index > -1) {
				this.requestOptions.requestActors.splice(index, 1);
			}
		} else {
			possibleActor.isSelected = true;
			this.requestOptions.requestActors.push(new lmrtfy_RequestActor(possibleActor.id, possibleActor.name, possibleActor.img));
		}
		this.render();
	}
	
	async _onUsersClear(event) {
		event.preventDefault();
		
		for (const user of this.possibleUsers) {
			if (user.isSelected) {
				user.isSelected = false;
			}
		}
		this.requestOptions.requestUsers = new Array();
		await this.regenerateActorVisibility();
		this.render();
	}
	
	async _onUsersAddAllEveryone(event) {
		event.preventDefault();
		
		for (const user of this.possibleUsers) {
			if (!user.isSelected) {
				user.isSelected = true;
				if (!this.requestOptions.requestUsers.some(u => u.userId === user.id)) {
					this.requestOptions.requestUsers.push(new lmrtfy_RequestUser(user.id, user.name, user.img));
				}
			}
		}
		await this.regenerateActorVisibility();
		this.render();
	}
	
	async _onUsersAddAllOnline(event) {
		event.preventDefault();
		
		const gmUsers = this.possibleUsers.filter(u => u.active);
		for (const user of gmUsers) {
			if (!user.isSelected) {
				user.isSelected = true;
				if (!this.requestOptions.requestUsers.some(u => u.userId === user.id)) {
					this.requestOptions.requestUsers.push(new lmrtfy_RequestUser(user.id, user.name, user.img));
				}
			}
		}
		await this.regenerateActorVisibility();
		this.render();
	}
	
	async _onUsersAddAllPlayer(event) {
		event.preventDefault();
		
		await _addUserRoles(1);
		this.render();
	}
	
	async _onUsersAddAllTrusted(event) {
		event.preventDefault();
		
		await _addUserRoles(2);
		this.render();
	}
	
	async _onUsersAddAllAssistant(event) {
		event.preventDefault();
		
		await _addUserRoles(3);
		this.render();
	}
	
	async _onUsersAddAllGm(event) {
		event.preventDefault();
		
		await _addUserRoles(4);
		this.render();
	}
	
	async _addUserRoles(role) {
		const gmUsers = this.possibleUsers.filter(u => u.role === role);
		for (const user of gmUsers) {
			if (!user.isSelected) {
				user.isSelected = true;
				if (!this.requestOptions.requestUsers.some(u => u.userId === user.id)) {
					this.requestOptions.requestUsers.push(new lmrtfy_RequestUser(user.id, user.name, user.img));
				}
			}
		}
		await this.regenerateActorVisibility();
	}
	
	async _onUserSelect(event) {
		event.preventDefault();
		const item = $(event.currentTarget);
		const id = item.data("id");
		
		const possibleActor = this.possibleUsers.find(pa => pa.id === id);
		if (!possibleActor) { return; }
		if (possibleActor.isSelected) {
			possibleActor.isSelected = false;
			const index = this.requestOptions.requestUsers.findIndex(u => u.userId === id);
			
			if (index > -1) {
				this.requestOptions.requestUsers.splice(index, 1);
			}
		} else {
			possibleActor.isSelected = true;
			this.requestOptions.requestUsers.push(new lmrtfy_RequestUser(possibleActor.id, possibleActor.name, possibleActor.img));
		}
		this.render();
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
			if (roll.type === "Category") {
				actionTree.push({
					"type": "category",
					"value": "",
					"selectable": false,
					"name": roll.name,
					"depth": depth
				});
				actionTree = actionTree.concat(buildActionTree(depth + 1, actionTree.rolls));
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
				const ownership = actor.ownership[id] ?? actor.ownership["default"];
				if (ownership === 4) {
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
			possibleActor.disposition = actor.disposition;
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