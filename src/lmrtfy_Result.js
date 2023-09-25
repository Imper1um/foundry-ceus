export class lmrtfy_Result {
	constructor(requestId, resultId, requestActorId, requestItemId, rolledUserId = null, rolledAmount = null, isRolled = false, isPass = false, rolledAdvantageDisadvantage = null, rollBreakdown = null, critFail = false, critSuccess = false) {
		this.requestId = requestId;
		this.resultId = resultId;
		this.requestActorId = requestActorId;
		this.requestItemId = requestItemId;
		this.rolledUserId = rolledUserId;
		this.rolledAmount = rolledAmount;
		this.isRolled = isRolled;
		this.isPass = isPass;
		this.rolledAdvantageDisadvantage = rolledAdvantageDisadvantage;
		this.rollBreakdown = rollBreakdown;
		this.critFail = critFail;
		this.critSuccess = critSuccess;
	}
	
}