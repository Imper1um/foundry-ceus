import { ceus_RollProvider_dnd5e } from "./ceus_RollProvider_dnd5e.js";

export class ceus_RollProvider_sw5e extends ceus_RollProvider_dnd5e {
	systemIdentifiers() {
		return 'sw5e';
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
	
	create5eAbilities() {
		let abbr = {};
        
        for (let key in CONFIG.DND5E.abilities) { 
            let abb = game.i18n.localize(key);
            let upperFirstLetter = abb.charAt(0).toUpperCase() + abb.slice(1);
			var localizedAbility = `SW5E.Ability${upperFirstLetter}`;
			abbr[abb] = localizedAbility;
            //abbr[`${abb}`] = `SW5E.Ability${upperFirstLetter}`;
        }
		
		

        return abbr;
	}
}