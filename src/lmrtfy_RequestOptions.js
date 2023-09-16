import { lmrtfy_RequestItem } from "./lmrtfy_RequestItem.js";
import { lmrtfy_RequestActor } from "./lmrtfy_RequestActor.js";
import { lmrtfy_RequestUser } from "./lmrtfy_RequestUser.js";
import { Utils } from "./Utils.js";

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
		return Utils.uuidv4();
	}
	
	shrink() {
		return new lmrtfy_RequestOptions(this.title, this.message, this.requestId, 
			this.resultId, this.contextId, this.rollNumber, this.rollPrivacy, 
			this.rollRequirePrivacy, this.requestItems.map(ri => ri.shrink()), this.requestActors.map(ra => ra.shrink()), this.requestUsers.map(ru => ru.shrink()), this.id);
	}
	
	
}