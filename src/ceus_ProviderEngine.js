import { ceus_RollProvider_pf2e } from "./ceus_RollProvider_pf2e.js";
import { ceus_RollProvider_cof } from "./ceus_RollProvider_cof.js";
import { ceus_RollProvider_coc } from "./ceus_RollProvider_coc.js";
import { ceus_RollProvider_dnd5e } from "./ceus_RollProvider_dnd5e.js";
import { ceus_RollProvider_cd } from "./ceus_RollProvider_cd.js";
import { ceus_RollProvider_degenesis } from "./ceus_RollProvider_degenesis.js";
import { ceus_RollProvider_dnd5eJP } from "./ceus_RollProvider_dnd5eJP.js";
import { ceus_RollProvider_dnd35 } from "./ceus_RollProvider_dnd35.js";
import { ceus_RollProvider_ffd20 } from "./ceus_RollProvider_ffd20.js";
import { ceus_RollProvider_ose } from "./ceus_RollProvider_ose.js";
import { ceus_RollProvider_pf1 } from "./ceus_RollProvider_pf1.js";
import { ceus_RollProvider_sf1e } from "./ceus_RollProvider_sf1e.js";
import { ceus_RollProvider_sw5e } from "./ceus_RollProvider_sw5e.js";

export class ceus_ProviderEngine { 
	constructor() {
		this.externalRollProviders = [
            new ceus_RollProvider_cd(),
            new ceus_RollProvider_coc(),
            new ceus_RollProvider_cof(),
            new ceus_RollProvider_degenesis(),
            new ceus_RollProvider_dnd5e(),
            new ceus_RollProvider_dnd5eJP(),
            new ceus_RollProvider_dnd35(),
            new ceus_RollProvider_ffd20(),
            new ceus_RollProvider_ose(),
            new ceus_RollProvider_pf1(),
            new ceus_RollProvider_pf2e(),
            new ceus_RollProvider_sf1e(),
            new ceus_RollProvider_sw5e()
        ];
	}
	
	async onReady() {
		this.currentRollProvider = this.externalRollProviders.find(e => e.systemIdentifiers() === game.system.id);
		if (!this.currentRollProvider) {
			console.error(`Ceus | No roll providers were found for ${game.system.id}. Unsupported System! Please add the RollProvider for this system.`);
		} else {
			await this.currentRollProvider.onReady();
		}
	}
}