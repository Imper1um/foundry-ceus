export class ceus_RequestUser {
	constructor(
		userId,
		name = null,
		imgUrl = null
	) {
		this.userId = userId;
		this.name = name;
		this.imgUrl = imgUrl;
	}
	
	shrink() {
		return new ceus_RequestUser(this.userId);
	}
}