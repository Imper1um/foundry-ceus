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
	}
	
	static get log() {
		if (!ceus_SocketEngine._log) {
			ceus_SocketEngine._log = new ceus_LogEngine("ceus_SocketEngine");
		}
		return ceus_SocketEngine._log;
	}
	
	addRefactorWatcher(id, method, filterMethod) {
		ceus_SocketEngine.log.Trace("addRefactorWatcher", id);
		this.onRefactorRequests.push({id, method, filterMethod});
	}
	
	removeRefactorWatcher(id) {
		ceus_SocketEngine.log.Trace("removeRefactorWatcher", id);
		this.onRefactorRequests = this.onRefactorRequests.filter(item => item.id !== id);
	}
	
	addCompleteWatcher(id, method, filterMethod) {
		ceus_SocketEngine.log.Trace("addCompleteWatcher", id);
		this.onCompleteRequests.push({id, method, filterMethod});
	}
	
	removeCompleteWatcher(id) {
		ceus_SocketEngine.log.Trace("removeCompleteWatcher", id);
		this.onCompleteRequests = this.onCompleteRequests.filter(item => item.id !== id);
	}
	
	addCancelWatcher(id, method, filterMethod) {
		ceus_SocketEngine.log.Trace("addCancelWatcher", id);
		this.onCancelRequests.push({id, method, filterMethod});
	}
	
	removeCancelWatcher(id) {
		ceus_SocketEngine.log.Trace("removeCancelWatcher", id);
		this.onCancelRequests = this.onCancelRequests.filter(item => item.id !== id);
	}
	
	async onRequest(data) {
		ceus_SocketEngine.log.Trace("onRequest", data);
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
		ceus_SocketEngine.log.Trace("onRefactorRequest", data);
		for (const w of this.onRefactorRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	
	async onRequestCancel(data) {
		ceus_SocketEngine.log.Trace("onRequestCancel", data);
		for (const w of this.onCancelRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	async onRequestComplete(data) {
		ceus_SocketEngine.log.Trace("onRequestComplete", data);
		//console.log(data);
		for (const w of this.onCompleteRequests) {
			if (w.filterMethod && !(await w.filterMethod(data))) {
				continue;
			}
			await w.method(data);
		}
	}
	
	async pushRefactorRequest(request) {
		ceus_SocketEngine.log.Trace("pushRefactorRequest", request);
		const data = {type: 'refactor', request};
		await game.socket.emit('module.ceus', data);
		await this.onRefactorRequest(data.request);
		ui.notifications.info(game.i18n.localize("Ceus.Requestor.Sent"));
	}
	async pushCancelResponse(request, userid) {
		ceus_SocketEngine.log.Trace("pushCancelResponse", {request, userid});
		const data = {type: 'cancel', request: {
			userid,
			request
		}};
		await game.socket.emit('module.ceus', data);
		await this.onRequestCancel(data.request);
	}
	async pushCompleteResponse(request, userid, response) {
		ceus_SocketEngine.log.Trace("onRefactorRequest", {request,userid,response});
		const data = {type: 'complete', request: {
			userid,
			request,
			response
		}};
		await game.socket.emit('module.ceus', data);
		await this.onRequestComplete(data.request);
	}
}