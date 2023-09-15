export class lmrtfy_RequestActor {
	constructor(
		actorId,
		name = null,
		imgUrl = null
	) {
		this.actorId = actorId;
		this.name = name;
		this.imgUrl = imgUrl;
	}
	
	shrink() {
		return new lmrtfy_RequestActor(this.actorId);
	}
}