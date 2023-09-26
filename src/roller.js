import { Ceus } from "./ceus.js";

export class CeusRoller  {
	static rollTypes() {
		return {
            ABILITY: "ability",
            SAVE: "save",
            SKILL: "skill",
            PERCEPTION: "perception",
			INITIATIVE: "initiative",
			DEATHSAVE: "deathsave",
			DICE: "dice",
			CUSTOM: "custom"
        };
	}
}
