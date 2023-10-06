import { ceus_LogEngine } from "./ceus_LogEngine.js";
import { ceus_PlayerRequestWindow } from "./ceus_PlayerRequestWindow.js";
import { ceus_ProviderEngine } from "./ceus_ProviderEngine.js";
import { ceus_RequestActor } from "./ceus_RequestActor.js";
import { ceus_RequestItem } from "./ceus_RequestItem.js";
import { ceus_RequestOptions } from "./ceus_RequestOptions.js";
import { ceus_RequestUser } from "./ceus_RequestUser.js";
import { ceus_RequestWindow } from "./ceus_RequestWindow.js";
import { ceus_ResultsWindow } from "./ceus_ResultsWindow.js";
import { ceus_SettingsEngine } from "./ceus_SettingsEngine.js";
import { ceus_SocketEngine } from "./ceus_SocketEngine.js";
import { Utils } from "./Utils.js";

export class Ceus {
	constructor() {
		this.requestWindows = new Array();
		this.resultWindows = new Array();
		this.askWindows = new Array();
		this.providerEngine = new ceus_ProviderEngine();
		this.settingsEngine = new ceus_SettingsEngine();
		this.socketEngine = new ceus_SocketEngine();
		
		globalThis.Ceus = this;
	}
	
	static current = new Ceus();
	static get log() {
		if (!Ceus._log) {
			Ceus._log = new ceus_LogEngine("ceus");
		}
		return Ceus._log;
	}
	
	
	async onInit() {
		this.registerHandlebarsHelpers();
		Hooks.on('getSceneControlButtons', this.getSceneControlButtons);
		Hooks.on('renderChatMessage', this.onChatMessage);
	}
	
	async onChatMessage(app, html, data) {
		if (Ceus.current && Ceus.current.settingsEngine) { Ceus.log.Trace("onChatMessage", {app, html, data}); } //Avoids conflicts when starting up.
		if (game.user.isGM) { return; }
		if (html.hasClass("sensitive") && html.hasClass("ceus")) {
			html.find('.result-total').text('???');
			html.find('.result-breakdown').remove();
			html.removeClass('pass');
			html.removeClass('fail');
			html.removeClass('crit-success');
			html.removeClass('crit-fail');
		}
		for (const i of html.find('.ceus.sensitive')) {
			const item = $(i);
			item.find('.result-total').text('???');
			item.find('.result-breakdown').remove();
			item.removeClass('pass');
			item.removeClass('fail');
			item.removeClass('crit-success');
			item.removeClass('crit-fail');
		}
	}
	
	
	async onReady() {
		await this.providerEngine.onReady();
		await this.settingsEngine.onReady();
		await this.socketEngine.onReady();
		
		this.socketEngine.addRefactorWatcher(0, this.onRefactorRequest);
	}
	
	onRefactorRequest(data) {
		Ceus.log.Trace("onRefactorRequest", data);
		const w = new ceus_PlayerRequestWindow(data);
		if (w.needsToBeDisplayed) {
			w.render(true);
		}
	}	
	
	getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")

        if (tokenButton) {
			tokenButton.tools.push({
				name: "request-roll",
				title: game.i18n.localize('Ceus.ControlTitle'),
				icon: "fas fa-dice-d20",
				visible: game.user.isGM,
				onClick: () => Ceus.current.requestRoll(),
				button: true
			});
        }
    }
	
	requestRoll() {
		const requestwindow = new ceus_RequestWindow();
		this.requestWindows.push(requestwindow);
		requestwindow.render(true);
    }
	
	async registerHandlebarsHelpers() {
		console.log("LMRFTY | Registering Handlebars Helpers...");
		Handlebars.registerHelper('ceus-controlledToken', function (actor) {
			const actorsControlledToken = canvas.tokens?.controlled.find(t => t.actor.id === actor.id);
			if (actorsControlledToken) {
				return true;
			} else {
				return false;
			}
		});

		Handlebars.registerHelper('ceus-showTokenImage', function (actor) {
			if (game.settings.get('ceus', 'useTokenImageOnRequester')) {
				return true;
			} else {
				return false;
			}
		});
		
		Handlebars.registerHelper('ceus-advantageDisadvantage', function(requestItem) {
			const allowAdvantage = Ceus.current.providerEngine.currentRollProvider.canActionAdvantage(requestItem.rollType, requestItem.rollId);
			const allowDisadvantage = Ceus.current.providerEngine.currentRollProvider.canActionDisadvantage(requestItem.rollType, requestItem.rollId);
			
			if (!allowDisadvantage && !allowAdvantage) { return ""; }
			var html = `<select id="advdis-$1{requestItem.id}" name="advdis-${requestItem.id}" class="selector-advantageDisadvantage" data-id="${requestItem.id}">`;
			html += '<option value="require-normal" '+ (requestItem.advantageDisadvantage === "require-normal" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.RequireNormal") + '</option>';
			if (allowAdvantage) {
				html += '<option value="require-advantage" '+ (requestItem.advantageDisadvantage === "require-advantage" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.RequireAdvantage") + '</option>';
				html += '<option value="allow-normal-advantage"> '+ (requestItem.advantageDisadvantage === "allow-normal-advantage" ? 'selected' : '') +'' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.AllowNormalAdvantage") + '</option>';
			}
			if (allowDisadvantage) {
				html += '<option value="require-disadvantage" '+ (requestItem.advantageDisadvantage === "require-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.RequireDisadvantage") + '</option>';
				html += '<option value="allow-normal-disadvantage" '+ (requestItem.advantageDisadvantage === "allow-normal-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.AllowNormalDisadvantage") + '</option>';
			}
			if (allowAdvantage && allowDisadvantage) {
				html += '<option value="allow-advantage-disadvantage" '+ (requestItem.advantageDisadvantage === "allow-advantage-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.AllowAdvantageDisadvantage") + '</option>';
				html += '<option value="allow-all" '+ (requestItem.advantageDisadvantage === "allow-all" ? 'selected' : '') +'>' + game.i18n.localize("Ceus.Requestor.SelectRolls.AdvantageDisadvantage.AllowAll") + '</option>';
			}
			html += "</select>";
			return new Handlebars.SafeString(html);
		});
		
		Handlebars.registerHelper('ceus-rollSelector', function(requestItem) {
			const appId = requestItem.appId;
			const requestWindow = game.users.apps.find(a => a.appId == appId);
			const possibleActions = requestWindow.possibleActions;
			
			var html = `<select id="roll-${requestItem.id}" name="roll-${requestItem.id}" class="selector-roll" data-id="${requestItem.id}">`;
			const action = possibleActions.find(pa => pa.id == requestItem.rollId);
			for (const possibleAction of possibleActions) {
				const append = Array(possibleAction.depth + 1).join('&nbsp;');
				
				if (possibleAction.type === "category") {
					html += `<option class="category depth-${possibleAction.depth}" disabled>${append}` + game.i18n.localize(possibleAction.name) + '</option>';
				} else if (possibleAction.type === "roll") {
					const isAction = (action && possibleAction.id === action.id) ? " selected" : "";
					html += `<option value="${possibleAction.id}" class="roll depth-${possibleAction.depth}"${isAction} data-id="${possibleAction.id}" data-rolltype="${possibleAction.rollType}">${append}` + game.i18n.localize(possibleAction.name) + '</option>';
				}
			}
			html += '</select>';
			return new Handlebars.SafeString(html);
		});
		
		Handlebars.registerHelper('ceus-trainedSelector', function(requestItem) {
			const trainedOptions = requestItem.trainedOptions;
			if (!trainedOptions || trainedOptions.length === 0) {
				return new Handlebars.SafeString(html);
			}
			
			var html = `<select id="trained-${requestItem.id}" name="trained-${requestItem.id}" class="selector-trained" data-id="${requestItem.id}">`;
			const opt = trainedOptions.find(to => to === requestItem.trainedOption);
			for (const trainedOption of trainedOptions) {
				const isOption = trainedOption === requestItem.trainedOption ? " selected" : "";
				html += `<option value="${trainedOption}"${isOption}>` + game.i18n.localize(`Ceus.Requestor.SelectRolls.Trained.${trainedOption}`) + '</option>';
			}
			return new Handlebars.SafeString(html);
		});
	}
	
	expandMacroData(data) {
		const requestOptions = new ceus_RequestOptions(
			data.title,
			data.message,
			Utils.uuidv4(),
			Utils.uuidv4(),
			data.rollNumber,
			data.rollPrivacy,
			data.rollRequirePrivacy
		);
		const requestItems = [];
		const requestActors = [];
		const requestUsers = [];
		const requestWindow = new ceus_RequestWindow();
		const rp = Ceus.current.providerEngine.currentRollProvider;
		const actors = game.actors.entities || game.actors.contents;
		const users = game.users.entities || game.users.contents;
		for (const requestItem of data.requestItems) {
			const newRi = new ceus_RequestItem(
				requestItem.rollId,
				requestItem.trainedOption,
				requestItem.dc,
				requestItem.customBonus,
				requestItem.advantageDisadvantage,
				requestItem.canCritSuccess,
				requestItem.canCritFail
			);
			const possibleAction = requestWindow.possibleActions.find(pa => pa.id == requestItem.rollId);
			if (!possibleAction) { continue; }
			newRi.rollType = possibleAction.rollType;
			newRi.trainedOptions = rp.rollTrainedOptions(possibleAction.rollType, possibleAction.rollId);
			newRi.allowDC = rp.allowDC(possibleAction.rollType, possibleAction.rollId);
			newRi.permitDC = rp.permitDC();
			newRi.permitAdvantageDisadvantage = rp.permitAdvantageDisadvantage();
			requestItems.push(newRi);
		}
		
		for (const requestActor of data.requestActors) {
			const actor = actors.find(a => a._id === requestActor.actorId);
			const possibleActor = requestWindow.possibleActors.find(pa => pa.actorId === requestActor.actorId);
			if (!actor || !possibleActor) { continue; }

			const newRa = new ceus_RequestActor(
				requestActor.actorId,
				actor.name,
				possibleActor.imgUrl
			);
			requestActors.push(newRa);
		}
		
		for (const requestUser of data.requestUsers) {
			const user = users.find(u => u._id === requestUser.userId);
			const possibleUser = requestWindow.possibleUsers.find(pu => pu.id === requestUser.userId);
			if (!user || !possibleUser) { continue; }
			
			const newRu = new ceus_RequestUser(
				requestUser.userId,
				user.name,
				possibleUser.img
			);
			requestUsers.push(newRu);
		}
		requestOptions.requestActors = requestActors;
		requestOptions.requestItems = requestItems;
		requestOptions.requestUsers = requestUsers;
		
		Ceus.log.Debug("expandMacroData:requestOptions", requestOptions);
		
		return requestOptions;
	}
	
	async macro_gmRoll(data) {
		if (!game.user.isGM) { return; }
		Ceus.log.Debug("macro_gmRoll", data);
		
		data = this.expandMacroData(data);
		
		const resultsWindow = new ceus_ResultsWindow(data, "gmroll");
		resultsWindow.handleRequestOptions();
		await resultsWindow.render(true);
		await resultsWindow.roll(data.requestActors.map(a => a.actorId));
	}
	
	async macro_openRequest(data) {
		if (!game.user.isGM) { return; }
		Ceus.log.Debug("macro_openRequest", data);
		
		data = this.expandMacroData(data);
		
		const requestWindow = new ceus_RequestWindow();
		requestWindow.fill(data);
		this.requestWindows.push(requestWindow);
		await requestWindow.render(true);
	}
	
	async macro_requestRollWindow(data) {
		if (!game.user.isGM) { return; }
		Ceus.log.Debug("macro_requestRollWindow", data);
		
		data = this.expandMacroData(data);
		
		const resultsWindow = new ceus_ResultsWindow(data, "ask");
		resultsWindow.handleRequestOptions();
		await resultsWindow.render(true);
		await resultsWindow.notify(data.requestActors.map(a => a.actorId));
		
	}
}