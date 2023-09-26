# Adding System support
Ceus uses an abstracted way of rolling for each system, based on its required functionality.

This was originally forked from LMRTFY, but the way rolls were gathered and asked for has changed significantly. Before you begin, you will need to grab the id of the system, which is located in the `system.json` in the root directory for the Ruleset.

## 1. Implement ceus_RefactorRollProvider
Create a new file called ceus_RollProvider_<SystemID> for example, Starfinder 1st Edition would be `ceus_RollProvider_sfrpg`.

### Considerations
All classes must `export` the class, and must `extends ceus_RefactorRollProvider`. `ceus_RefactorRollProvider` provides a lot of base functionality that prevents you from doing things over and over again. Here's a few things you *must* do in order to make your system class compatible with Ceus:

1. Implement `systemIdentifiers`. You must use the name of the system identifier used in `system.json` for your ruleset.
2. Implement `isPlayer(actor)`. This is a formatting thing, but it helps a lot. Generally, you'll need to provide true if the actor is a player character sheet.
3. Implement `getAvailableRolls()`. This must return an array that gives a listing of rolls that will be shown. For an example on how to format available rolls, check out `ceus_RollProvider_sf1e.getAvailableRolls()`
4. Implement `getContextList(requestOptions)`. If you are planning on enabling Ceus to show a dialog for rolling for any roll that assigns a player a place in combat (Initiative), you will need to provide the Context list. Initiative in Foundry cannot be assigned without Context, so that will be necessary.

## 2. Import your Roll Provider
Roll Providers need to be added to `ceus_ProviderEngine`. The file needs to be imported at the top of the class, and added to `externalRollProviders`.

## 3. Update module.json
In `module.json`, you need to add your system to `systems`, and you need to add the system information to `relationships.systems`.

## 4. Create a Pull Request!
Create a Pull Request to merge your changes into the code base!