export class lmrtfy_RequestOptions {
	constructor(title, message, requestId = null, context = null, rollNumber = "any", requestItems = new Array(), requestActors = new Array(), requestUsers = new Array()) {
		this.title = title;
		this.message = message;
		this.requestId = requestId;
		this.context = context;
		this.rollNumber = rollNumber;
		this.requestItems = requestItems;
		this.requestActors = requestActors;
		this.requestUsers = requestUsers;
	}
}