export class lmrtfy_PlayerRequestWindow extends FormApplication {
	constructor(...args) {
		super(...args);
		game.users.apps.push(this);
		
		if (args.length) {
			const val = args[0];
			if (val instanceof lmrtfy_RequestOptions) {
				this.requestOptions = val;
				this.requestType = "self";
				if (args.length > 1) {
					this.requestType = args[1];
				}
				this.handleRequestOptions();
			}
		}
	}
}