document.getElementById('dirs').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'select-dirs',
  })
})
document.getElementById('close-btn').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'close-app',
  })
})
document.getElementById('cape-load').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'start-download',
    url: document.getElementById('vod-dvr').value,
  })
})