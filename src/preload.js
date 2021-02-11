const { ipcRenderer } = require('electron')

process.once('loaded', () => {
    ipcRenderer.on("statusDownload", (event, data) => {
        document.getElementById("vod-status").innerHTML = data;
    });
    window.addEventListener('message', evt => {
        if (evt.data.type === 'select-dirs') {
            ipcRenderer.send('select-dirs')
        }else if(evt.data.type === 'close-app'){
            ipcRenderer.send('close-app')
        }else if(evt.data.type === 'start-download'){
            ipcRenderer.send('start-download', evt.data.url)
        }
    })
})