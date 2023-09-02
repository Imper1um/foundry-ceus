export class lmrtfy_Result {
	constructor(requestId, requestActorId, requestItemId, rolledUserId = null, rolledAmount = null, isRolled = false, isPass = false, rolledAdvantageDisadvantage = null) {
		this.requestId = requestId;
		this.requestActorId = requestActor;
		this.requestItemId = requestItem;
		this.rolledUserId = rolledUser;
		this.rolledAmount = rolledAmount;
		this.isRolled = isRolled;
		this.isPass = isPass;
		this.rolledAdvantageDisadvantage = rolledAdvantageDisadvantage;
	}
	
}