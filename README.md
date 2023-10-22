Talos Tournament Orchestration service backend

# Naming conventions

There are currently parts of the code that do not follow this. However, going forward, this should be followed.

## File names

File names should use hyphens rather than camel case. E.g. qual-list and not qualList

Files in a module should be (generally) in the format module.function.ts or module.function.spec.ts for tests.

## Pluralization

The plural form should be used for routes, the singular form should be used for file names. E.g. the team module will have a team.publisher.ts which publishes the complete team list to `teams` and an individual team info to `teams/127C`

# Folder layout

The following are typical components of a folder

* foo.controller.ts

REST or message bus inputs to a module (e.g if it accepts a POST request to /api/foo/bar, or it listens for messages on /foo). This stage is also responsible for authentication/authorization as well as basic data sanitization (e.g. make sure that integers are actually integers)

* foo.service.ts

Main business logic.

* foo.module.ts

Needed to define the module

* foo.repo.ts

Responsible for database interaction

* foo.publisher.ts

Publish information related to the module to the data bus

* foo.interface.ts

Defines data types used in the module which may be needed by other services

* index.ts

Public exports that may be needed by other services

## Contents of index.ts

index.ts should export * from the interface, export the main module from foo.module.ts, and should export any service exported by the module for use in other services

