const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const ffmpeg = require("fluent-ffmpeg");
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
            var statusD = progress.percent;
            statuslog(`Pobrano: ${statusD.toFixed(2)}% \n${progress.frames} Klatek`);
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
