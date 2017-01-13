Rogalia MMO game client available in the browser and on Steam.

- [Steam](http://store.steampowered.com/app/528460/)
- [Browser](http://rogalia.ru/play)

## Express
```
npm install
npm run load-metadata
npm run server
```

Then navigate to `localhost:8080`

If you want to use a Steam account you need to run a nw.js executable, see below.
The other option is to use a test server. Ask for a link in the [discord](https://discord.gg/eCxFe8w) channel.

## Windows build instructions

The Rogalia client requires [Node](https://nodejs.org/en/) to be installed. Currently the LTS suffices.

Then use express to run the web server.

When building on Windows, asset symlinks won't work. To set up NTFS hardlinks run the following commands in Git Bash:
```
sh scripts/fix-symlinks.sh
git rm-symlinks
```

## Webserver

Another option is to run the client on a webserver e.g. Apache or NGINX.
Navigate to `localhost/index.html`

## NW.js executable

To run the client in a Webkit executable [NW.js](https://github.com/nwjs/nw.js) (for Windows x32 is required).

* Extract the NW.js binary package
* Drag the Rogalia directory, not the package.json itself, on to the NW.js executable (nwjs.exe) in your NW.JS directory.

or run in the client root directory

```
nw .
```

NOTE: Make sure your Steam client is running in the background.

## Discussion / contact

Join our [Discord](https://discord.gg/eCxFe8w) channel.
