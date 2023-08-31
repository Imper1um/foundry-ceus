import { LMRTFY } from "./lmrtfy.js";

Hooks.once('init', () => {
	console.log("LMRTFY | Initializing...");
	LMRTFY.current.onInit();
	console.log("LMRTFY | Initialized.");
});

Hooks.once('ready', () => {
	console.log("LMRTFY | Readying...");
	LMRTFY.current.onReady();
	console.log("LMRTFY | Ready!");
});