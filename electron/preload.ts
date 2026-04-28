/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { ipcRenderer, contextBridge } = require('electron')

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (event: any, ...args: any[]) => void) {
    return ipcRenderer.on(channel, (event: any, ...args: any[]) => listener(event, ...args))
  },
  off(channel: string, ...args: any[]) {
    return ipcRenderer.off(channel, ...args)
  },
  send(channel: string, ...args: any[]) {
    return ipcRenderer.send(channel, ...args)
  },
  invoke(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args)
  },

  // You can expose other apis here
})
