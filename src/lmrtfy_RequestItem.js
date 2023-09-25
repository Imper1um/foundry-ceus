export class lmrtfy_RequestItem {
	constructor(rollId, trainedOption = null, dc = null, customBonus = null, advantageDisadvantage = "allow-all", canCritSuccess = false, canCritFail = false) {
		this.rollId = rollId;
		this.customBonus = customBonus;
		this.trainedOption = trainedOption;
		this.dc = dc;
		this.advantageDisadvantage = advantageDisadvantage;
		this.canCritSuccess = canCritSuccess;
		this.canCritFail = canCritFail;
	}
	
	shrink() {
		return new lmrtfy_RequestItem(this.rollId, this.trainedOption, this.dc, this.customBonus, this.advantageDisadvantage, this.canCritSuccess, this.canCritFail);
	}
}