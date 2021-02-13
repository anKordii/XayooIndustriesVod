const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const discord = require('discord-rich-presence')('778898616597086210');

const data = Date.now();
let downloadLoc = 'null';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  mainWindow.setResizable(false)

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.on('close-app', (event, arg) => {
    app.exit(0)
  })

  ipcMain.on('start-download', (event, arg) => {
    if(downloadLoc === 'null')
      return statuslog(`Nie wybrano miejsca zapisu!`);
    if(arg.length === 0)
      return statuslog(`Nie podano żadnego url!`);

      ffmpeg(arg)
          .on('progress', function (progress) {
            //var statusD = progress.percent;
            statuslog(`<strong class="dl-time">Długość: </strong>${progress.timemark} <strong class="dl-kb">Szybkość Pobierania: </strong>${formatSizeUnits(progress.currentKbps*1024)} <strong class="dl-size">Rozmiar: </strong>${formatSizeUnits(progress.targetSize*1000)} <strong class="dl-klatki">Klatek: </strong>${progress.frames} `)
          })
          .outputOptions("-bsf:a aac_adtstoasc")
          .outputOptions("-vcodec copy")
          .outputOptions("-c copy")
          .outputOptions("-crf 50")
          .output (`${downloadLoc}/vod-${Date.now()}.mp4`)
          .on('end', function(err) {
            if(!err) { statuslog(`Pobieranie zakończone 😎`) }
          })
          .on('error', function(err){
            statuslog('Błąd: '+err)
          })
          .run()
  })
  
  ipcMain.on('select-dirs', async (event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    downloadLoc = result.filePaths;
    statuslog(`Wybrano lokalizacje: ${result.filePaths}`);
  })

  function statuslog(message){
    mainWindow.webContents.send('statusDownload', message);
  }

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
function formatSizeUnits(bytes){
  if      (bytes>=1073741824) {bytes=(bytes/1073741824).toFixed(2)+' GB';}
  else if (bytes>=1048576)    {bytes=(bytes/1048576).toFixed(2)+' MB';}
  else if (bytes>=1024)       {bytes=(bytes/1024).toFixed(2)+' KB';}
  else if (bytes>1)           {bytes=bytes+' bytes';}
  else if (bytes==1)          {bytes=bytes+' byte';}
  else                        {bytes='0 byte';}
  return bytes;
}
discord.updatePresence({
  state: 'Pobieranie zapisu stream',
  details: 'Główne menu',
  startTimestamp: data,
  largeImageKey: 'logo',
  largeImageText: 'xayooindustries.us',
  smallImageKey: '4uss',
  smallImageText: 'made by 3xanax',
  instance: true,
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
