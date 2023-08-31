import { LMRTFY } from "./lmrtfy.js";

export class lmrtfy_SettingsEngine {
	get baseSettings() {
		return [
			{
				id: "enableParchmentTheme",
				name: game.i18n.localize("LMRTFY.Setting.EnableParchmentTheme.Name"),
				hint: game.i18n.localize("LMRTFY.Setting.EnableParchmentTheme.Hint"),
				scope: 'client',
				config: true,
				type: Boolean,
				default: true,
				onChange: LMRTFY.current.onThemeChange
			},
			{
				id: "deselectOnRequestorRender",
				name: game.i18n.localize("LMRTFY.Setting.DeselectOnRequestorRender.Name"),
				hint: game.i18n.localize("LMRTFY.Setting.DeselectOnRequestorRender.Hint"),
				scope: 'client',
				config: true,
				type: Boolean,
				default: true,
				onChange: LMRTFY.current.onThemeChange
			},
			{
				id: 'deselectOnRequestorRender',
				name: game.i18n.localize("LMRTFY.Setting.UseTokenImageOnRequester.Name"),
				hint: game.i18n.localize("LMRTFY.Setting.UseTokenImageOnRequester.Hint"),
				scope: 'world',
				config: true,
				type: Boolean,
				default: false,
				onChange: () => window.location.reload()
			}
		];
	}
	
	async onReady() {
		const settings = this.baseSettings.concat(LMRTFY.current.providerEngine.currentRollProvider.getSettings());
		for (const setting of settings) {
			game.settings.register('lmrtfy', setting.id, {
				name: setting.name,
				hint: setting.hint,
				scope: setting.scope,
				config: setting.config,
				type: setting.type,
				default: setting.default,
				onChange: setting.onChange
			});
		}
		
		LMRTFY.settings = this;
		console.log("LMRTFY | Game settings ready.");
	}
	
	get EnableParchmentTheme() {
		return game.settings.get('lmrtfy', lmrtfy_SettingsEngine.SETTING.EnableParchmentTheme.id);
	}
	
	get DeselectOnRequestorRender() {
		return game.settings.get('lmrtfy', lmrtfy_SettingsEngine.SETTING.DeselectOnRequestorRender.id);
	}
	
	get UseTokenImageOnRequester() {
		return game.settings.get('lmrtfy', lmrtfy_SettingsEngine.SETTING.UseTokenImageOnRequester.id);
	}
	
	get ShowFailButtons() {
		return game.settings.get('lmrtfy', lmrtfy_SettingsEngine.SETTING.ShowFailButtons.id);
	}
}