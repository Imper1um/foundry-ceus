import { lmrtfy_RollProvider_pf2e } from "./lmrtfy_RollProvider_pf2e.js";
import { lmrtfy_RollProvider_cof } from "./lmrtfy_RollProvider_cof.js";
import { lmrtfy_RollProvider_coc } from "./lmrtfy_RollProvider_coc.js";
import { lmrtfy_RollProvider_dnd5e } from "./lmrtfy_RollProvider_dnd5e.js";
import { lmrtfy_RollProvider_cd } from "./lmrtfy_RollProvider_cd.js";
import { lmrtfy_RollProvider_degenesis } from "./lmrtfy_RollProvider_degenesis.js";
import { lmrtfy_RollProvider_dnd5eJP } from "./lmrtfy_RollProvider_dnd5eJP.js";
import { lmrtfy_RollProvider_dnd35 } from "./lmrtfy_RollProvider_dnd35.js";
import { lmrtfy_RollProvider_ffd20 } from "./lmrtfy_RollProvider_ffd20.js";
import { lmrtfy_RollProvider_ose } from "./lmrtfy_RollProvider_ose.js";
import { lmrtfy_RollProvider_pf1 } from "./lmrtfy_RollProvider_pf1.js";
import { lmrtfy_RollProvider_sf1e } from "./lmrtfy_RollProvider_sf1e.js";
import { lmrtfy_RollProvider_sw5e } from "./lmrtfy_RollProvider_sw5e.js";

export class lmrtfy_ProviderEngine { 
	constructor() {
		this.externalRollProviders = [
            new lmrtfy_RollProvider_cd(),
            new lmrtfy_RollProvider_coc(),
            new lmrtfy_RollProvider_cof(),
            new lmrtfy_RollProvider_degenesis(),
            new lmrtfy_RollProvider_dnd5e(),
            new lmrtfy_RollProvider_dnd5eJP(),
            new lmrtfy_RollProvider_dnd35(),
            new lmrtfy_RollProvider_ffd20(),
            new lmrtfy_RollProvider_ose(),
            new lmrtfy_RollProvider_pf1(),
            new lmrtfy_RollProvider_pf2e(),
            new lmrtfy_RollProvider_sf1e(),
            new lmrtfy_RollProvider_sw5e()
        ];
	}
	
	async onReady() {
		this.currentRollProvider = this.externalRollProviders.find(e => e.systemIdentifiers() === game.system.id);
		if (!this.currentRollProvider) {
			console.error(`LMRTFY | No roll providers were found for ${game.system.id}. Unsupported System! Please add the RollProvider for this system.`);
		} else {
			await this.currentRollProvider.onReady();
		}
	}
}