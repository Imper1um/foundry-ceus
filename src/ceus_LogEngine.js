import { Ceus } from "./ceus.js";

export class ceus_LogEngine {
	constructor(system) {
		this.system = system;
	}
	
	Fatal(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		if (system) {
			console.error(`LMRTFY | FATAL ${module} ${system}: ${message}`);
			ui.notifications.error("${system}: ${message}");
		} else {
			console.error(`LMRTFY | FATAL ${module} ${system}: ${message}`);
			ui.notifications.error("${system}: ${message}");
		}
		if (error) {
			console.error(error);
		}
		
	}
	
	Error(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		const logLevel = Ceus.current.settingsEngine.LogLevel;
		const notifyLevel = Ceus.current.settingsEngine.NotifyLevel;
		const level = "Error";
		
		if (system) {
			if (this.IsLevelHighEnough(logLevel, level)) { console.error(`LMRTFY | ${system} ${module} : ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.error("${system}: ${message}"); }
		} else {
			if (this.IsLevelHighEnough(logLevel, level)) { console.error(`LMRTFY | ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.error("${message}"); }
		}
		if (error && this.IsLevelHighEnough(logLevel, level)) {
			console.error(error);
		}
	}
	
	Warn(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		const logLevel = Ceus.current.settingsEngine.LogLevel;
		const notifyLevel = Ceus.current.settingsEngine.NotifyLevel;
		const level = "Warning";
		
		if (system) {
			if (this.IsLevelHighEnough(logLevel, level)) { console.warn(`LMRTFY | ${system} ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.warn("${system}: ${message}"); }
		} else {
			if (this.IsLevelHighEnough(logLevel, level)) { console.warn(`LMRTFY | ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.warn("${message}"); }
		}
		if (error && this.IsLevelHighEnough(logLevel, level)) {
			console.warn(error);
		}
	}
	
	Info(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		const logLevel = Ceus.current.settingsEngine.LogLevel;
		const notifyLevel = Ceus.current.settingsEngine.NotifyLevel;
		const level = "Info";
		
		if (system) {
			if (this.IsLevelHighEnough(logLevel, level)) { console.log(`LMRTFY | ${system} ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${system}: ${message}"); }
		} else {
			if (this.IsLevelHighEnough(logLevel, level)) { console.log(`LMRTFY | ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${message}"); }
		}
		if (error && this.IsLevelHighEnough(logLevel, level)) {
			console.info(error);
		}
	}
	
	Debug(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		const logLevel = Ceus.current.settingsEngine.LogLevel;
		const notifyLevel = Ceus.current.settingsEngine.NotifyLevel;
		const level = "Debug";
		
		if (system) {
			if (this.IsLevelHighEnough(logLevel, level)) { console.debug(`LMRTFY | ${system} ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${system}: ${message}"); }
		} else {
			if (this.IsLevelHighEnough(logLevel, level)) { console.debug(`LMRTFY | ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${message}"); }
		}
		if (error && this.IsLevelHighEnough(logLevel, level)) {
			console.debug(error);
		}
	}
	
	Trace(module, message, error = null, system = null) {
		if (system == null) { system = this.system; }
		if (typeof message !== "string") { message = JSON.stringify(message); }
		const logLevel = Ceus.current.settingsEngine.LogLevel;
		const notifyLevel = Ceus.current.settingsEngine.NotifyLevel;
		const level = "Trace";
		
		if (system) {
			if (this.IsLevelHighEnough(logLevel, level)) { console.trace(`LMRTFY | ${system} ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${system}: ${message}"); }
		} else {
			if (this.IsLevelHighEnough(logLevel, level)) { console.trace(`LMRTFY | ${module}: ${message}`); }
			if (this.IsLevelHighEnough(notifyLevel, level)) { ui.notifications.info("${message}"); }
		}
		if (error && this.IsLevelHighEnough(logLevel, level)) {
			console.trace(error);
		}
	}
	
	
	IsLevelHighEnough(settingLevel, requiredLevel) {
		const requiredLevels = {
			"Fatal": ["Fatal"],
			"Error": ["Error", "Fatal"],
			"Warning": ["Warning", "Error", "Fatal"],
			"Info": ["Info", "Warning", "Error", "Fatal"],
			"Debug": ["Debug", "Info", "Warning", "Error", "Fatal"],
			"Trace": ["Trace", "Debug", "Info", "Warning", "Error", "Fatal"]
		};
		
		if (!requiredLevels.hasOwnProperty(settingLevel)) {
			throw new Exception(`SettingLevel ${settingLevel} not found!`);
		}
		
		const validLevels = requiredLevels[settingLevel];
		return validLevels.includes(requiredLevel);
	}
}