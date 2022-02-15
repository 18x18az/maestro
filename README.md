# Talos
## Branch Info
- this branch is for developing logging cycle times
- will probably need to edit state/field.ts, but need to test
- we want to save cycle times in a csv file, and we also want to send it to showman so we can see it in the control panel
### concept of operations/requirements
1. when the first (not practice or skills) match is started, create a csv file. the headers should be match,time. the match will be whatever match (Q1, Q41, R-16-1, etc) and the time will be how long it took from the previous match to the current. so, the line Q2,2:13 will mean it took 2 min 13 seconds from the start of Q1 to begin running Q2. this means that Q1 will always be 0:00
2. this means that we will need to detect when we see a 0:15 and AUTO in whatever field state we have. when we do see a 0:15 and AUTO (ie when match starts) we should start a timer. then, the next time we see 0:15 and AUTO, we should stop the timer, create a new row for the new match, and input the recorded time
3. we need to figure out a way to not break when something needs to get restarted. we can check if there is a csv file or not, idk. 
4. we need a way to send this data to showman so we can have cycle times shown in the control panel. we wanna send raw data even if its not clean (for instance, the match right after lunch will have an insanely large timer, because lunch) and have showman do whatever it wants with the data (filter, etc, not important for talos purposes).
5. figure out a way for talos to differentiate between events so we can create new csv files for new events. could add a thing in .env

### TODO
- [x] get delta in minutes
- [ ] save to .csv according to .env
- [x] calculate rolling average
- [x] broadcast stuff about cycleTime/matchstart
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
