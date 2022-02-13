# Talos
## Branch Info
- this branch is for developing logging cycle times
- will probably need to edit state/field.ts, but need to test
- we want to save cycle times in a csv file, and we also want to send it to showman so we can see it in the control panel

## Build Requirements
- `yarn`

For automated scene-switching in OBS...
- `obs-websocket == 4.x.x`
### Build Instructions
```bat
:: clone the project
$ git clone git@github.com:18x18az/talos.git
$ cd talos

:: do build stuff
$ yarn install

:: run the project
yarn dev
```
