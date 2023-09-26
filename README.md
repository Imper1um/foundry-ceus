# Ceus
Ceus is a module that helps Game Masters ask for rolls for specific players. This speeds up the game as you don't have players hunting their character sheet for rolls, or asking what things to add that the GM is looking for, or even reminding players what kind of roll they should be doing. It also can roll for players when you want to do an en masse roll without worrying about the players doing it, or letting them know it exists.

## What is a Ceus?
It's simple to say, pronounced like 'cues.' The name's inspired by Coeus, a Greek Titan linked to intelligence. This project is a fork of LMRTFY, but honestly, the name was a pain to type and had a negative vibe, since it was linked to "LMGTFY (Let Me Google That For You)", a website commenters use as a snarky response when someone asks a simple question that could be answered by a 5 second Google search. Plus, I've changed so much of the code that it was time for a fresh start. Imper1um thought it was clever he made it.

# Rebrand / Refactor
This new functionality completely changes how the asking for rolls works. Ceus no longer supports any legacy versions of `RollProvider` and those systems are now removed to prevent collisions. The code remaining is just kept around for documentation.

For information on how to use Ceus and its features check out [USAGE.md](USAGE.md).

## Abstracting Roll functionality

Each system has a different way of accomplishing rolls. As such, asking for a roll is handled by each `RefactorRollProvider`. All of the figuring out how to roll will be handled by the Provider, rather than a weird way of handling it in the rolling system.

## Updated Request system
New request system allows you to ask how you, as the GM, want a roll to be accomplished. Want a Knowledge: Nature OR a Knowledge: Geography check (but not both)? You can set it in a way that only one can be rolled per player. Want everyone to roll a Fort AND a Will save? You can do that.

## New Results Window
New Results window shows who hasn't rolled, and gives you the opportunity to roll for people.

## New Report system
New report system allows you to report to the players how you want to show it. Want players only to see Successes/Failures? You can do that! Want players to only see the results once everyone has rolled? You can do that!

# This Branch
This new branch is a new way of thinking on how rolls can be accomplished, completely different than how LMRTFY accomplished asking for rolls. It no longer relies on putting individual mechanics for each system in the main module systems, and now it allows for each system's `RollProvider` to provide the mechanics for how to roll, and how to handle each system. It also makes categories agnostic.

For more information, see the [REFACTOR.md](/REFACTOR.md) .

## Updated Systems:
- Starfinder - 1st Edition (SFRPG)

Updating LMRTFY on this branch with systems requires that you adhere to the [REFACTOR.md](/REFACTOR.md) rules. Legacy systems for LMRTFY on this branch will no longer be accepted. Once you have created a new `RefactorRollProvider`, you can check out [CONTRIBUTING.md](/CONTRIBUTING.md) on instructions on how to create a Pull Request.

## Planned Systems:
These systems are planned on upgrading to Ceus-compatible. I have ordered these in priority:

1. Pathfinder - 1st Edition (pf1e)
2. Pathfinder - 2nd Edition (pf2e)
3. Dungeons and Dragons - 5th Edition (dnd5e)
4. Dungeons and Dragons - 3.5 Edition (D35E)

## Unplanned Systems
These systems were compatible with the old LMRTFY, but I do not have any immediate plans on upgrading their functionality. Check out [CONTRIBUTING.md](/CONTRIBUTING.md) if you want to help!

- Chroniques Oubliées Fantasy (cof)
- Chroniques Oubliées Contemporain (coc)
- Dungeons and Dragons - 5th Edition (JP) (dnd5eJP)
- Old-School Essentials (ose)
- Shadow of the Demon Lord (demonlord)
- Starfinder - 1st Edition (sfrpg)
- Star Wars - 5th Edition (sw5e)

## Incompatible Systems
The following systems do not have Foundry v11 support and will not be upgraded until there is a v11 version of the system:

- Final Fantasy RPG (ffd20)

## Unknown Systems
The following systems could not be located in the repository, and, therefore, could not be downloaded and figured out. There is no plan on upgrading for these systems.

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
