# Talos
## Branch Info
- this branch is for developing logging cycle times
- will probably need to edit state/field.ts, but need to test
- we want to save cycle times in a csv file, and we also want to send it to showman so we can see it in the control panel
### concept of operations/requirements
1. when the first (not practice or skills) match is started, create a csv file. the headers should be match,time
1a. the match will be whatever match (Q1, Q41, R-16-1, etc) and the time will be how long it took from the previous match to the current
1b. so, the line Q2,2:!3 will mean it took 2 min 13 seconds from the start of Q1 to begin running Q2
1c. this means that Q1 will always be 0:00
2. this means that we will need to detect when we see a 0:15 and AUTO in whatever field state we have
3. we need to figure out a way when something needs to get restarted. we can check if there is a csv file or not, idk

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
