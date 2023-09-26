import { Ceus } from "./ceus.js";

Hooks.once('init', () => {
	console.log("Ceus | Initializing...");
	Ceus.current.onInit();
	console.log("Ceus | Initialized.");
});

Hooks.once('ready', () => {
	console.log("Ceus | Readying...");
	Ceus.current.onReady();
	console.log("Ceus | Ready!");
});