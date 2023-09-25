import { Ceus } from "./ceus.js";

export class ceus_SettingsEngine {
	get baseSettings() {
		return [
			{
				id: "enableParchmentTheme",
				name: game.i18n.localize("Ceus.Setting.EnableParchmentTheme.Name"),
				hint: game.i18n.localize("Ceus.Setting.EnableParchmentTheme.Hint"),
				scope: 'client',
				config: true,
				type: Boolean,
				default: true,
				onChange: Ceus.current.onThemeChange
			},
			{
				id: "deselectOnRequestorRender",
				name: game.i18n.localize("Ceus.Setting.DeselectOnRequestorRender.Name"),
				hint: game.i18n.localize("Ceus.Setting.DeselectOnRequestorRender.Hint"),
				scope: 'client',
				config: true,
				type: Boolean,
				default: true,
				onChange: Ceus.current.onThemeChange
			},
			{
				id: 'deselectOnRequestorRender',
				name: game.i18n.localize("Ceus.Setting.UseTokenImageOnRequester.Name"),
				hint: game.i18n.localize("Ceus.Setting.UseTokenImageOnRequester.Hint"),
				scope: 'world',
				config: true,
				type: Boolean,
				default: false,
				onChange: () => window.location.reload()
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
		
		Ceus.settings = this;
		console.log("Ceus | Game settings ready.");
	}
	
	get EnableParchmentTheme() {
		return game.settings.get('ceus', ceus_SettingsEngine.SETTING.EnableParchmentTheme.id);
	}
	
	get DeselectOnRequestorRender() {
		return game.settings.get('ceus', ceus_SettingsEngine.SETTING.DeselectOnRequestorRender.id);
	}
	
	get UseTokenImageOnRequester() {
		return game.settings.get('ceus', ceus_SettingsEngine.SETTING.UseTokenImageOnRequester.id);
	}
	
	get ShowFailButtons() {
		return game.settings.get('ceus', ceus_SettingsEngine.SETTING.ShowFailButtons.id);
	}
}