# Let Me Roll That For You!

LMRTFY is a module that helps Game Masters ask for rolls for specific players. This speeds up the game as you don't have players hunting their character sheet for rolls, or asking what things to add that the GM is looking for, or even reminding players what kind of roll they should be doing. It also can roll for players when you want to do an en masse roll without worrying about the players doing it, or letting them know it exists.

# This Branch

This new branch is a new way of thinking on how rolls can be accomplished in LMRTFY. It no longer relies on putting individual mechanics for each system in the main module systems, and now it allows for each system's `RollProvider` to provide the mechanics for how to roll, and how to handle each system. It also makes categories agnostic.

For more information, see the [REFACTOR.md](/REFACTOR.md) .

## Updated Systems:
- Starfinder - 1st Edition (SFRPG)

Updating LMRTFY on this branch with systems requires that you adhere to the [REFACTOR.md](/REFACTOR.md) rules. Legacy systems for LMRTFY on this branch will no longer be accepted. Once you have created a new `RefactorRollProvider`, you can check out [CONTRIBUTING.md](/CONTRIBUTING.md) on instructions on how to create a Pull Request.

## Legacy Systems:
- Chroniques Oubliées Fantasy (cof)
- Chroniques Oubliées Contemporain (coc)
- Dungeons and Dragons - 5th Edition (dnd5e)
- Dungeons and Dragons - 5th Edition (JP) (dnd5eJP)
- Dungeons and Dragons - 3.5 Edition (D35E)
- Old-School Essentials (ose)
- Pathfinder - 2nd Edition (pf2e)
- Pathfinder - 1st Edition (pf1e)
- Shadow of the Demon Lord (demonlord)
- Starfinder - 1st Edition (sfrpg)
- Star Wars - 5th Edition (sw5e)

These systems use the old, legacy system for rolling, and no longer are supported by this branch/fork.

## Old, Unconfirmed Versions
The following systems have support on this module, but do not support Foundry v11 and could not be confirmed if they operate with this module's latest version.
- Final Fantasy RPG (ffd20)

## No longer Working Versions
The following systems are no longer supported by this module, and need to be fixed in order to work again.
- Chromatic Dungeons (foundry-chromatic-Dungeons)

# Installation
As of now, there is no way to grab the latest package for automatic installation. You will need to download the source code and add it to your server manually while the packaging system is being worked on.

## License
This Foundry VTT module, writen by KaKaRoTo and Refactored by Imper1um, is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).

# Attributions

## REFACTOR

- Main Refactor by `@Imper1um`

## Translations

- Japanese translation by `@Brother Sharp`
- German translation by `@Acd-Jake`
- Portuguese translation by `@rinnocenti`
- Spanish translation by `@SanaRinomi`
- French translation by `@Elfenduil`
- Chinese translation by `@hmqgg`
- Taiwanese translation by `@zeteticl`
