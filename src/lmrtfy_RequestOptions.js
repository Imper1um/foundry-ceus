import { lmrtfy_RequestItem } from "./lmrtfy_RequestItem.js";
import { lmrtfy_RequestActor } from "./lmrtfy_RequestActor.js";
import { lmrtfy_RequestUser } from "./lmrtfy_RequestUser.js";

export class lmrtfy_RequestOptions {
	constructor(title, message, requestId = null, resultId = null, contextId = null, rollNumber = "any", rollPrivacy = "public", rollRequirePrivacy = false, requestItems = new Array(), requestActors = new Array(), requestUsers = new Array(), id = null) {
		this.id = id || this.generateUuid();
		
		this.title = title;
		this.message = message;
		this.requestId = requestId;
		this.resultId = resultId;
		this.contextId = contextId;
		this.rollNumber = rollNumber;
		this.rollPrivacy = rollPrivacy;
		this.rollRequirePrivacy = rollRequirePrivacy;
		this.requestItems = requestItems;
		this.requestActors = requestActors;
		this.requestUsers = requestUsers;
	}
	
	generateUuid() {
		const uuid = require('uuid');

		return uuid.v4();
	}
	
	shrink() {
		var requestItems = this.requestItems.map(ri => new lmrtfy_RequestItem(ri.id, ri.trainedOption, ri.dc, ri.customBonus, ri.advantageDisadvantage);
		var requestActors = this.requestActors.map(ra => new lmrtfy_RequestActor(ra.actorId));
		var requestUsers = this.requestUsers.map(ru => new lmrtfy_RequestUser(ru.userId));
		
		return new lmrtfy_RequestOptions(this.title, this.message, this.requestId, 
			this.resultId, this.contextId, this.rollNumber, this.rollPrivacy, 
			this.rollRequirePrivacy, requestItems, requestActors, requestUsers, this.id);
	}
}