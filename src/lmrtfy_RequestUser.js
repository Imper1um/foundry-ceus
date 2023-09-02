export class lmrtfy_RequestUser {
	constructor(
		userId,
		name = null,
		imgUrl = null
	) {
		this.userId = userId;
		this.name = name;
		this.imgUrl = imgUrl;
	}
}