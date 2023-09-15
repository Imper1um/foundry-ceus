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
		return lmrtfy_RequestOptions.uuidv4();
	}
	
	shrink() {
		var requestItems = this.requestItems.map(ri => new lmrtfy_RequestItem(ri.id, ri.trainedOption, ri.dc, ri.customBonus, ri.advantageDisadvantage));
		var requestActors = this.requestActors.map(ra => new lmrtfy_RequestActor(ra.actorId));
		var requestUsers = this.requestUsers.map(ru => new lmrtfy_RequestUser(ru.userId));
		
		return new lmrtfy_RequestOptions(this.title, this.message, this.requestId, 
			this.resultId, this.contextId, this.rollNumber, this.rollPrivacy, 
			this.rollRequirePrivacy, requestItems.map(ri => ri.shrink()), requestActors.map(ra => ra.shrink()), requestUsers.map(ru => ru.shrink()), this.id);
	}
	
	/**
    * Generates a UUID v4 compliant ID. 
    *
    * This code is an evolution of the following Gist.
    * https://gist.github.com/jed/982883
    *
    * There is a public domain / free copy license attached to it that is not a standard OSS license...
    * https://gist.github.com/jed/982883#file-license-txt
    *
    * @returns {string} UUIDv4
    */
	static uuidv4()
	{
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
	}
}