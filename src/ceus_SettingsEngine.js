import { Ceus } from "./ceus.js";

export class ceus_SettingsEngine {
	get baseSettings() {
		return [
			{
				id: "logLevel",
				name: game.i18n.localize("Ceus.Setting.LogLevel.Name"),
				hint: game.i18n.localize("Ceus.Setting.LogLevel.Hint"),
				scope: 'client',
				config: true,
				type: String,
				default: "Info",
				choices: {
					"Fatal": "Ceus.Setting.Levels.Fatal",
					"Error": "Ceus.Setting.Levels.Error",
					"Warning": "Ceus.Setting.Levels.Warning",
					"Info": "Ceus.Setting.Levels.Info",
					"Debug": "Ceus.Setting.Levels.Debug",
					"Trace": "Ceus.Setting.Levels.Trace"
				}
			},
			{
				id: "notifyLevel",
				name: game.i18n.localize("Ceus.Setting.NotifyLevel.Name"),
				hint: game.i18n.localize("Ceus.Setting.NotifyLevel.Hint"),
				scope: 'client',
				config: true,
				type: String,
				default: "Warning",
				choices: {
					"Fatal": "Ceus.Setting.Levels.Fatal",
					"Error": "Ceus.Setting.Levels.Error",
					"Warning": "Ceus.Setting.Levels.Warning",
					"Info": "Ceus.Setting.Levels.Info",
					"Debug": "Ceus.Setting.Levels.Debug",
					"Trace": "Ceus.Setting.Levels.Trace"
				}
			}
		];
	}
	
	async onReady() {
		const settings = this.baseSettings.concat(Ceus.current.providerEngine.currentRollProvider.getSettings());
		for (const setting of settings) {
			game.settings.register('ceus', setting.id, {
				name: setting.name,
				hint: setting.hint,
				scope: setting.scope,
				config: setting.config,
				type: setting.type,
				default: setting.default,
				onChange: setting.onChange
			});
		}
		
		console.log("Ceus | Game settings ready.");
	}
	
	get LogLevel() {
		return game.settings.get('ceus', "logLevel");
	}
	
	get NotifyLevel() {
		return game.settings.get('ceus', "notifyLevel");
	}
}