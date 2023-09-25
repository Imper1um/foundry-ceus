import { Ceus } from "./ceus.js";
import { CeusRoller } from "./roller.js";
import { ceus_PlayerRequestWindow } from "./ceus_PlayerRequestWindow.js";
import { ceus_LogEngine } from "./ceus_LogEngine.js";

export class ceus_SocketEngine {
	async onReady() {
		game.socket.on('module.ceus', this.onRequest);
		
		console.log("Ceus | Socket Engine Ready");
		
		this.onLegacyRequests = [];
		this.onRefactorRequests = [];
		this.onCompleteRequests = [];
		this.onCancelRequests = [];
		this.log = new ceus_LogEngine("SocketEngine");
	}
	
	addRefactorWatcher(id, method, filterMethod) {
		this.log.Trace("addRefactorWatcher", id);
		this.onRefactorRequests.push({id, method, filterMethod});
	}
	
	removeRefactorWatcher(id) {
		this.log.Trace("removeRefactorWatcher", id);
		this.onRefactorRequests = this.onRefactorRequests.filter(item => item.id !== id);
	}
	
	addCompleteWatcher(id, method, filterMethod) {
		this.log.Trace("addCompleteWatcher", id);
		this.onCompleteRequests.push({id, method, filterMethod});
	}
	
	removeCompleteWatcher(id) {
		this.log.Trace("removeCompleteWatcher", id);
		this.onCompleteRequests = this.onCompleteRequests.filter(item => item.id !== id);
	}
	
	addCancelWatcher(id, method, filterMethod) {
		this.log.Trace("addCancelWatcher", id);
		this.onCancelRequests.push({id, method, filterMethod});
	}
	
	removeCancelWatcher(id) {
		this.log.Trace("removeCancelWatcher", id);
		this.onCancelRequests = this.onCancelRequests.filter(item => item.id !== id);
	}
	
	async onRequest(data) {
		this.log.Trace("onRequest", data);
		switch (data.type) {
			case 'refactor':
				await Ceus.current.socketEngine.onRefactorRequest(data.request);
				break;
			case 'cancel':
				await Ceus.current.socketEngine.onRequestCancel(data.request);
				break;
			case 'complete':
				await Ceus.current.socketEngine.onRequestComplete(data.request);
				break;
		}
	}

	async onRefactorRequest(data) {
		this.log.Trace("onRefactorRequest", data);
		for (const w of this.onRefactorRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	
	async onRequestCancel(data) {
		this.log.Trace("onRequestCancel", data);
		for (const w of this.onCancelRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	async onRequestComplete(data) {
		this.log.Trace("onRequestComplete", data);
		//console.log(data);
		for (const w of this.onCompleteRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	
	async pushRefactorRequest(request) {
		this.log.Trace("pushRefactorRequest", request);
		await game.socket.emit('module.ceus', {type: 'refactor', request});
		ui.notifications.info(game.i18n.localize("Ceus.Requestor.Sent"));
	}
	async pushCancelResponse(request, userid) {
		this.log.Trace("pushCancelResponse", {request, userid});
		await game.socket.emit('module.ceus', {type: 'cancel', request: {
			userid,
			request
		}});
	}
	async pushCompleteResponse(request, userid, response) {
		this.log.Trace("onRefactorRequest", {request,userid,response});
		await game.socket.emit('module.ceus', {type: 'complete', request: {
			userid,
			request,
			response
		}});
	}
}