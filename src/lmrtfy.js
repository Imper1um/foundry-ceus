import { lmrtfy_RequestWindow } from "./lmrtfy_RequestWindow.js";
import { lmrtfy_ProviderEngine } from "./lmrtfy_ProviderEngine.js";
import { lmrtfy_SocketEngine } from "./lmrtfy_SocketEngine.js";
import { lmrtfy_SettingsEngine } from "./lmrtfy_SettingsEngine.js";
import { LMRTFYRequestor } from "./requestor.js";


export class LMRTFY {
	constructor() {
		this.requestWindows = new Array();
		this.resultWindows = new Array();
		this.askWindows = new Array();
		this.providerEngine = new lmrtfy_ProviderEngine();
		this.settingsEngine = new lmrtfy_SettingsEngine();
		this.socketEngine = new lmrtfy_SocketEngine();
	}
	
	static current = new LMRTFY();
	
	async onInit() {
		this.registerHandlebarsHelpers();
		Hooks.on('getSceneControlButtons', this.getSceneControlButtons);
	}
	
	async onReady() {
		await this.providerEngine.onReady();
		await this.settingsEngine.onReady();
		await this.socketEngine.onReady();
		
		this.d20Svg = '<svg class="lmrtfy-dice-svg-normal" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
            'viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">' +
            '<g transform="translate(-246.69456,-375.66745)">' +
                '<path d="M278.2,382.1c-0.1,0-0.2,0-0.3,0.1L264.8,398c-0.2,0.3-0.2,0.3,0.1,0.3l26.4-0.1c0.4,0,0.4,0,0.1-0.3l-13-15.8' +
                'C278.4,382.1,278.3,382.1,278.2,382.1L278.2,382.1z M280.7,383.5l11.9,14.5c0.2,0.2,0.2,0.2,0.5,0.1l6.3-2.9' +
                'c0.4-0.2,0.4-0.2,0.1-0.4L280.7,383.5z M275.2,384c0,0-0.1,0.1-0.3,0.2l-17.3,11.4l5.4,2.5c0.3,0.1,0.4,0.1,0.5-0.1l11.4-13.6' +
                'C275.1,384.1,275.2,384,275.2,384L275.2,384z M300.3,395.8c-0.1,0-0.1,0-0.3,0.1l-6.4,2.9c-0.2,0.1-0.2,0.2-0.1,0.4l7.5,19' +
                'l-0.5-22.1C300.4,395.9,300.4,395.8,300.3,395.8L300.3,395.8z M257.1,396.4l-0.7,21.5l6.3-18.6c0.1-0.3,0.1-0.3-0.1-0.4' +
                'L257.1,396.4L257.1,396.4z M291.6,399.2l-27,0.1c-0.4,0-0.4,0-0.2,0.3l13.7,23.1c0.2,0.4,0.2,0.3,0.4,0l13.2-23.2' +
                'C291.9,399.3,291.9,399.2,291.6,399.2L291.6,399.2z M292.7,399.8c0,0-0.1,0.1-0.1,0.2l-13.3,23.3c-0.1,0.2-0.2,0.3,0.2,0.3' +
                'l21.1-2.9c0.3-0.1,0.3-0.2,0.2-0.5l-7.9-20.2C292.7,399.9,292.7,399.8,292.7,399.8L292.7,399.8z M263.6,400c0,0,0,0.1-0.1,0.3' +
                'l-6.7,19.8c-0.1,0.4-0.1,0.6,0.3,0.7l20.1,2.9c0.4,0.1,0.3-0.1,0.2-0.3l-13.7-23.1C263.6,400,263.6,400,263.6,400L263.6,400z' +
                'M258.3,421.9l19.7,11.2c0.3,0.2,0.3,0.1,0.3-0.2l-0.4-7.9c0-0.3,0-0.4-0.3-0.4L258.3,421.9L258.3,421.9z M299.1,421.9l-20,2.8' +
                'c-0.3,0-0.2,0.2-0.2,0.4l0.4,8c0,0.2,0,0.3,0.3,0.2L299.1,421.9z"/>' +
            '</g>' +
        '</svg>';
		
		this.socketEngine.addRefactorWatcher(0, onRefactorRequest);
	}
	
	onRefactorRequest(data) {
		const w = new lmrtfy_PlayerRequestWindow(data);
		if (w.needsToBeDisplayed) {
			w.render(true);
		}
	}	
	
	getSceneControlButtons(buttons) {
        let tokenButton = buttons.find(b => b.name == "token")

        if (tokenButton) {
			tokenButton.tools.push({
				name: "request-roll",
				title: game.i18n.localize('LMRTFY.ControlTitle'),
				icon: "fas fa-dice-d20",
				visible: game.user.isGM,
				onClick: () => LMRTFY.current.requestRoll(),
				button: true
			});
        }
    }
	
	onThemeChange(enabled) {
        $(".lmrtfy.lmrtfy-requestor,.lmrtfy.lmrtfy-roller").toggleClass("lmrtfy-parchment", enabled);
        if (!this.requestor) { return; }
        if (enabled) {
            this.requestor.options.classes.push("lmrtfy-parchment");
        } else {
            this.requestor.options.classes = this.requestor.options.classes.filter(c => c !== "lmrtfy-parchment");
		}
        // Resize to fit the new theme
        if (this.requestor.element.length) {
            this.requestor.setPosition({ width: "auto", height: "auto" });
		}
    }
	
	requestRoll() {
		if (this.providerEngine.currentRollProvider.rollProviderType() === 'legacy') {
			if (this.requestor === undefined) {
				this.requestor = new LMRTFYRequestor();
			}
			this.requestor.render(true);
		} else if (this.providerEngine.currentRollProvider.rollProviderType() === 'refactor') {
			const requestwindow = new lmrtfy_RequestWindow();
			this.requestWindows.push(requestwindow);
			requestwindow.render(true);
		}
    }
	
	async registerHandlebarsHelpers() {
		console.log("LMRFTY | Registering Handlebars Helpers...");
		Handlebars.registerHelper('lmrtfy-controlledToken', function (actor) {
			const actorsControlledToken = canvas.tokens?.controlled.find(t => t.actor.id === actor.id);
			if (actorsControlledToken) {
				return true;
			} else {
				return false;
			}
		});

		Handlebars.registerHelper('lmrtfy-showTokenImage', function (actor) {
			if (game.settings.get('lmrtfy', 'useTokenImageOnRequester')) {
				return true;
			} else {
				return false;
			}
		});
		
		Handlebars.registerHelper('lmrtfy-advantageDisadvantage', function(requestItem) {
			const allowAdvantage = LMRTFY.current.providerEngine.currentRollProvider.canActionAdvantage(requestItem.rollType, requestItem.rollId);
			const allowDisadvantage = LMRTFY.current.providerEngine.currentRollProvider.canActionDisadvantage(requestItem.rollType, requestItem.rollId);
			
			if (!allowDisadvantage && !allowAdvantage) { return ""; }
			var html = `<select id="advdis-$1{requestItem.id}" name="advdis-${requestItem.id}" class="selector-advantageDisadvantage" data-id="${requestItem.id}">`;
			html += '<option value="require-normal" '+ (requestItem.advantageDisadvantage === "require-normal" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.RequireNormal") + '</option>';
			if (allowAdvantage) {
				html += '<option value="require-advantage" '+ (requestItem.advantageDisadvantage === "require-advantage" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.RequireAdvantage") + '</option>';
				html += '<option value="allow-normal-advantage"> '+ (requestItem.advantageDisadvantage === "allow-normal-advantage" ? 'selected' : '') +'' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.AllowNormalAdvantage") + '</option>';
			}
			if (allowDisadvantage) {
				html += '<option value="require-disadvantage" '+ (requestItem.advantageDisadvantage === "require-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.RequireDisadvantage") + '</option>';
				html += '<option value="allow-normal-disadvantage" '+ (requestItem.advantageDisadvantage === "allow-normal-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.AllowNormalDisadvantage") + '</option>';
			}
			if (allowAdvantage && allowDisadvantage) {
				html += '<option value="allow-advantage-disadvantage" '+ (requestItem.advantageDisadvantage === "allow-advantage-disadvantage" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.AllowAdvantageDisadvantage") + '</option>';
				html += '<option value="allow-all" '+ (requestItem.advantageDisadvantage === "allow-all" ? 'selected' : '') +'>' + game.i18n.localize("LMRTFY.Requestor.SelectRolls.AdvantageDisadvantage.AllowAll") + '</option>';
			}
			html += "</select>";
			return new Handlebars.SafeString(html);
		});
		
		Handlebars.registerHelper('lmrtfy-rollSelector', function(requestItem) {
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
		
		Handlebars.registerHelper('lmrtfy-trainedSelector', function(requestItem) {
			const trainedOptions = requestItem.trainedOptions;
			if (!trainedOptions || trainedOptions.length === 0) {
				return new Handlebars.SafeString(html);
			}
			
			var html = `<select id="trained-${requestItem.id}" name="trained-${requestItem.id}" class="selector-trained" data-id="${requestItem.id}">`;
			const opt = trainedOptions.find(to => to === requestItem.trainedOption);
			for (const trainedOption of trainedOptions) {
				const isOption = trainedOption === requestItem.trainedOption ? " selected" : "";
				html += `<option value="${trainedOption}"${isOption}>` + game.i18n.localize(`LMRTFY.Requestor.SelectRolls.Trained.${trainedOption}`) + '</option>';
			}
			return new Handlebars.SafeString(html);
		});
	}

    /*async onReady() {
		this.providerEngine.onReady();
		this.socketEngine.onReady();

        

        if (game.settings.get('lmrtfy', 'deselectOnRequestorRender')) {
            Hooks.on("renderLMRTFYRequestor", () => {
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
        if (msg.message.flags && msg.message.flags.lmrtfy) {
            if (msg.message.flags.lmrtfy.blind && !game.user.isGM) {
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