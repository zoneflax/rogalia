Rogalia MMO game client available in the browser and on Steam

- [Steam](store.steampowered.com/app/528460/)
- [Browser](http://rogalia.ru/play)

## Windows build instructions

The Rogalia client requires [Node](https://nodejs.org/en/) to be installed. Currently the LTS suffices.
Also [NW.js](https://github.com/nwjs/nw.js) x32 is required to run the Rogalia client locally.


In the client directory run the following command
> npm install

Extract NW.js somewhere on your system.

Create the file *steam_appid.txt* with the following ID in it
> 528460

Drag the Rogalia directory, not the package.json itself on to the NW.js executable (nwjs.exe) in your NW.JS directory.