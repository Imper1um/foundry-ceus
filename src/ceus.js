import { ceus_RequestWindow } from "./ceus_RequestWindow.js";
import { ceus_PlayerRequestWindow } from "./ceus_PlayerRequestWindow.js";
import { ceus_ProviderEngine } from "./ceus_ProviderEngine.js";
import { ceus_SocketEngine } from "./ceus_SocketEngine.js";
import { ceus_SettingsEngine } from "./ceus_SettingsEngine.js";
import { ceus_ResultsWindow } from "./ceus_ResultsWindow.js";
import { ceus_LogEngine } from "./ceus_LogEngine.js";
import { CeusRequestor } from "./requestor.js";


export class Ceus {
	constructor() {
		this.requestWindows = new Array();
		this.resultWindows = new Array();
		this.askWindows = new Array();
		this.providerEngine = new ceus_ProviderEngine();
		this.settingsEngine = new ceus_SettingsEngine();
		this.socketEngine = new ceus_SocketEngine();
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
		Ceus.log.Trace("onChatMessage", {app, html, data});
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
	
	onThemeChange(enabled) {
        $(".ceus.ceus-requestor,.ceus.ceus-roller").toggleClass("ceus-parchment", enabled);
        if (!this.requestor) { return; }
        if (enabled) {
            this.requestor.options.classes.push("ceus-parchment");
        } else {
            this.requestor.options.classes = this.requestor.options.classes.filter(c => c !== "ceus-parchment");
		}
        // Resize to fit the new theme
        if (this.requestor.element.length) {
            this.requestor.setPosition({ width: "auto", height: "auto" });
		}
    }
	
	requestRoll() {
		if (this.providerEngine.currentRollProvider.rollProviderType() === 'legacy') {
			if (this.requestor === undefined) {
				this.requestor = new CeusRequestor();
			}
			this.requestor.render(true);
		} else if (this.providerEngine.currentRollProvider.rollProviderType() === 'refactor') {
			const requestwindow = new ceus_RequestWindow();
			this.requestWindows.push(requestwindow);
			requestwindow.render(true);
		}
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
	
	static gmRoll(data) {
		if (!game.user.isGM) { return; }
		
		const resultsWindow = new ceus_ResultsWindow(data, "gmroll");
		resultsWindow.render(true);
		resultsWindow.roll(data.requestActors.map(a => a.actorId));
	}
	
	static openRequest(data) {
		if (!game.user.isGM) { return; }
		
		const requestWindow = new ceus_RequestWindow();
			this.requestWindows.push(requestwindow);
			requestwindow.render(true);
	}
	
	static requestRoll(data) {
		if (!game.user.isGM) { return; }
	}

    /*async onReady() {
		this.providerEngine.onReady();
		this.socketEngine.onReady();

        

        if (game.settings.get('ceus', 'deselectOnRequestorRender')) {
            Hooks.on("renderCeusRequestor", () => {
                canvas.tokens.releaseAll();
            });
        }
		
		
		Hooks.on('renderChatMessage', this.hideBlind);
    }*/

    /* 
	results() {
		if (this.results === undefined) {
			this.results = new Array();
		}
		return this.results;
	}
	addResults(newResults) {
		const r = results();
		r.push(newResults);
		this.results = r;
	}
	getResults(id) {
		return results.find(r => r.id == id);
	}

    

    

    async hideBlind(app, html, msg) {
        if (msg.message.flags && msg.message.flags.ceus) {
            if (msg.message.flags.ceus.blind && !game.user.isGM) {
                msg.content = '<p>??</p>';

                let idx = html[0].innerHTML.indexOf('<div class="message-content">');
                html[0].innerHTML = html[0].innerHTML.substring(0, idx);
                html[0].innerHTML += `<div class="message-content">${msg.content}</div>`;
            }
        }
    }

    fromUuid(uuid) {
        let parts = uuid.split(".");
        let doc;

        if (parts.length === 1) return game.actors.get(uuid);
        // Compendium Documents
        if (parts[0] === "Compendium") {
            return undefined;
        }

        // World Documents
        else {
            const [docName, docId] = parts.slice(0, 2);
            parts = parts.slice(2);
            const collection = CONFIG[docName].collection.instance;
            doc = collection.get(docId);
        }

        // Embedded Documents
        while (parts.length > 1) {
            const [embeddedName, embeddedId] = parts.slice(0, 2);
            doc = doc.getEmbeddedDocument(embeddedName, embeddedId);
            parts = parts.slice(2);
        }
        if (doc.actor) doc = doc.actor;
        return doc || undefined;
    } */
}