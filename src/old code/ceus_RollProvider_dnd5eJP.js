import { ceus_RollProvider_dnd5e } from "./ceus_RollProvider_dnd5e.js";

export class ceus_RollProvider_dnd5eJP extends ceus_RollProvider_dnd5e {
	systemIdentifiers() {
		return 'dnd5eJP';
	}
	
	advantageRollEvent() {
		return new ceus_RollEvent(false, true, false);
	}
	
	disadvantageRollEvent() {
		return new ceus_RollEvent(false, false, true);
	}
	
	normalRollEvent() {
		return new ceus_RollEvent(true, false, false);
	}
}