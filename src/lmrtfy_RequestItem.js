export class lmrtfy_RequestItem {
	constructor(id, trainedOption = null, dc = null, customBonus = null, advantageDisadvantage = "allow-all") {
		this.id = id;
		this.customBonus = customBonus;
		this.trainedOption = trainedOption;
		this.dc = null;
		this.advantageDisadvantage = advantageDisadvantage;
	}
}