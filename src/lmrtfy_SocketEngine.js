import { LMRTFY } from "./lmrtfy.js";
import { LMRTFYRoller } from "./roller.js";
import { lmrtfy_PlayerRequestWindow } from "./lmrtfy_PlayerRequestWindow.js";

export class lmrtfy_SocketEngine {
	async onReady() {
		game.socket.on('module.lmrtfy', this.onRequest);
		
		console.log("LMRTFY | Socket Engine Ready");
		
		this.onLegacyRequests = [];
		this.onRefactorRequests = [];
		this.onCompleteRequests = [];
		this.onCancelRequests = [];
	}
	
	addLegacyWatcher(id, method) {
		this.onLegacyRequests.push({id, method});
	}
	
	removeLegacyWatcher(id) {
		this.onLegacyRequests = this.onLegacyRequests.filter(item => item.id !== id);
	}
	
	addRefactorWatcher(id, method, filterMethod) {
		this.onRefactorRequests.push({id, method, filterMethod});
	}
	
	removeRefactorWatcher(id) {
		this.onRefactorRequests = this.onRefactorRequests.filter(item => item.id !== id);
	}
	
	addCompleteWatcher(id, method, filterMethod) {
		this.onCompleteRequests.push({id, method, filterMethod});
	}
	
	removeCompleteWatcher(id) {
		this.onCompleteRequests = this.onCompleteRequests.filter(item => item.id !== id);
	}
	
	addCancelWatcher(id, method, filterMethod) {
		this.onCancelRequests.push({id, method, filterMethod});
	}
	
	removeCancelWatcher(id) {
		this.onCancelRequests = this.onCancelRequests.filter(item => item.id !== id);
	}
	
	async onRequest(data) {
		switch (data.type) {
			case 'refactor':
				await LMRTFY.current.socketEngine.onRefactorRequest(data.request);
				break;
			case 'legacy':
				await LMRTFY.current.socketEngine.onLegacyRequest(data.request);
				break;
			case 'cancel':
				await LMRTFY.current.socketEngine.onRequestCancel(data.request);
				break;
			case 'complete':
				await LMRTFY.current.socketEngine.onRequestComplete(data.request);
				break;
		}
	}
	
	async onLegacyRequest(data) {
		console.log("LMRTFY | onLegacyRequest");
		console.log(data);
		if (data.user === "character" &&
            (!game.user.character || !data.actors.includes(game.user.character.id))) {
            return;
        } else if (!["character", "tokens"].includes(data.user) && data.user !== game.user.id) {
            return;
        }
        
        let actors = [];
        if (data.user === "character") {
            actors = [game.user.character];
        } else if (data.user === "tokens") {
            actors = canvas.tokens.controlled.map(t => t.actor).filter(a => data.actors.includes(a.id));
        } else {
            actors = data.actors.map(aid => this.fromUuid(aid));
        }
        actors = actors.filter(a => a);
        
        // remove player characters from GM's requests
        if (game.user.isGM) {
            actors = actors.filter(a => !a.hasPlayerOwner);
        }        
        if (actors.length === 0) return;
		for (const w of this.onLegacyRequests) {
			w.method(actors, data);
		}
        //new LMRTFYRoller(actors, data).render(true);
	}
	async onRefactorRequest(data) {
		console.log("LMRTFY | onRefactorRequest");
		for (const w of this.onRefactorRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
		//console.log(data);
		// const w = new lmrtfy_PlayerRequestWindow(data);
		// if (w.needsToBeDisplayed) {
			// w.render(true);
		// }
	}
	
	async onRequestCancel(data) {
		console.log("LMRTFY | onRequestCancel");
		for (const w of this.onCancelRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	async onRequestComplete(data) {
		console.log("LMRTFY | onRequestComplete");
		//console.log(data);
		for (const w of this.onCompleteRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
		// if (!game.user.isGM) { return; }
		
		// const resultWindow = game.users.apps.find(a => a.appId === data.request.resultId);
		// if (!resultWindow) { return; }
		// await resultWindow.appendResult(data.response);
	}
	
	async pushRefactorRequest(request) {
		await game.socket.emit('module.lmrtfy', {type: 'refactor', request});
		ui.notifications.info(game.i18n.localize("LMRTFY.Requestor.Sent"));
	}
	async pushCancelResponse(request, userid) {
		await game.socket.emit('module.lmrtfy', {type: 'cancel', request: {
			userid,
			request
		}});
	}
	async pushCompleteResponse(request, userid, response) {
		await game.socket.emit('module.lmrtfy', {type: 'complete', request: {
			userid,
			request,
			response
		}});
	}
}