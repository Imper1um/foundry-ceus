import { LMRTFYRoller } from "./roller.js";

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
	}
	
	async onRequestCancel(data) {
	}
	async onRequestComplete(data) {
	}
}