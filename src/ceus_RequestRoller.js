export class ceus_RequestRoller {
	constructor(requestOptions, requestActor, requestItem) {
		this.requestActor = requestActor;
		this.requestItem = requestItem;
		this.requestOptions = requestOptions;
	}
	
	roll() {
		const actors = game.actors.entities || game.actors.contents;
		const actor = actors.find(a => a._id === requestActor.id);
		if (!actor) { return null; }
		const roll = this.flattenRolls(Ceus.current.providerEngine.currentRollProvider.getAvailableRolls()).find(r => r.id === requestItem.id);
		if (!roll || roll.method === undefined) { return null; }
		this.result = roll.method(this.requestOptions, actor, this.requestItem);
	}
	
	flattenRolls(rollList) {
		var flat = new Array();
		for (const r in rollList) {
			flat.push(r);
			if (r.rolls) {
				flat.concat(this.flattenRolls(r.rolls));
			}
		}
		return flat;
	}
}