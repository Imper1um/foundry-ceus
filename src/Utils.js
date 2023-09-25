export class Utils {
	/**
    * Generates a UUID v4 compliant ID. 
    *
    * This code is an evolution of the following Gist.
    * https://gist.github.com/jed/982883
    *
    * There is a public domain / free copy license attached to it that is not a standard OSS license...
    * https://gist.github.com/jed/982883#file-license-txt
    *
    * @returns {string} UUIDv4
    */
	static uuidv4()
	{
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
	}
	
	static flattenRolls(rollList)
	{
		var flat = new Array();
		for (const r of rollList) {
			flat.push(r);
			if (r.rolls) {
				flat = flat.concat(Utils.flattenRolls(r.rolls));
			}
		}
		return flat;
	}
	
	static doesUserControlActor(actor, user) {
		if (user.isGM) {
			return true;
		}
		if (user.character && user.character._id == actor._id) {
			return true;
		}
		var ownership = actor.ownership["default"];
		if (actor.ownership[user._id]) { ownership = actor.ownership[user._id]; }
		return ownership >= 3;
	}
}