import { LMRTFYRoller } from "./roller.js";
import { lmrtfy_PlayerRequestWindow } from "./lmrtfy_PlayerRequestWindow.js";

export class lmrtfy_SocketEngine {
	async onReady() {
		game.socket.on('module.lmrtfy.request.legacy', this.onLegacyRequest);
		game.socket.on('module.lmrtfy.request.refactor', this.onRefactorRequest);
		game.socket.on('module.lmrtfy.request.cancel', this.onRequestCancel);
		game.socket.on('module.lmrtfy.request.complete', this.onRequestComplete);
		
		console.log("LMRTFY | Socket Engine Ready");
	}
	
	async onLegacyRequest(data) {
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
        new LMRTFYRoller(actors, data).render(true);
	}
	async onRefactorRequest(data) {
		const w = new lmrtfy_PlayerRequestWindow(data);
		if (w.needsToBeDisplayed) {
			w.render(true);
		}
	}
	
	async onRequestCancel(data) {
		if (!game.user.isGM) { return; }
		
		const resultWindow = game.users.apps.find(a => a.appId === data.request.resultId);
		if (!resultWindow) { return; }
	
		const u = game.users.get(data.userid);
		if (!u) { return; }
	
		ui.notifications.info(`${u.name} closed their request window.`);
	}
	async onRequestComplete(data) {
		if (!game.user.isGM) { return; }
		
		const resultWindow = game.users.apps.find(a => a.appId === data.request.resultId);
		if (!resultWindow) { return; }
		await resultWindow.appendResult(data.response);
	}
	
	async pushRefactorRequest(request) {
		game.socket.emit('module.lmrtfy.request.refactor', request);
		ui.notifications.info(game.i18n.localize("LMRTFY.Requestor.Sent"));
	}
	async pushCancelResponse(request, userid) {
		game.socket.emit('module.lmrtfy.request.cancel', {
			userid,
			request
		});
	}
	async pushCompleteResponse(request, userid, response) {
		game.socket.emit('module.lmrtfy.request.complete', {
			userid,
			request,
			response
		});
	}
}