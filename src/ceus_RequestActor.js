export class ceus_RequestActor {
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
		return new ceus_RequestActor(this.actorId);
	}
}