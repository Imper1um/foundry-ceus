export class lmrtfy_RequestItem {
	constructor(rollId, trainedOption = null, dc = null, customBonus = null, advantageDisadvantage = "allow-all") {
		this.rollId = id;
		this.customBonus = customBonus;
		this.trainedOption = trainedOption;
		this.dc = null;
		this.advantageDisadvantage = advantageDisadvantage;
	}
	
	shrink() {
		return new lmrtfy_RequestItem(this.rollId, this.trainedOption, this.dc, this.customBonus, this.advantageDisadvantage);
	}
}