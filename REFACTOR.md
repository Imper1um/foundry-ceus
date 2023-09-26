# Ceus Refactor
This branch refactors how Ceus is dealing with individual systems.

## Lang Refactor
Lang files are changed to use the cascading way of taking a JSON File.

Lang files should only include items that are exclusive to Ceus-alone. Systems should no longer use Ceus for System-Specific Lang translations, and should use System-Specific Lang translations.

## esmodules Refactor
The main subsystem no longer uses "scripts", instead uses "esmodules," which is more preferred to use for running JS.

Every .js file should use the `import` directive to determine which files to use.

## RollProvider Refactor
The `RollProvider` system now has a fork. Old, legacy systems will use `lmrtfy_RollProvider`, while updated systems will now use `lmrtfy_RefactoRollProvider.` Old RollProviders will **not** work with the Ceus refactor.