import { app, shell, BrowserWindow, ipcMain, IpcMainEvent, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { generateScript, ScriptData, addGroup } from './utils/generateScript'
import { getItem, setItem, electronStore } from './utils/store'
import { getSystemInfo } from './utils/getSystemInfo'
import { runScript } from './utils/runScript'
import { executeExportScript } from './utils/exportScript'
import { loadAnsibleFile, filePath } from './utils/loadFile'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    minWidth: 1024,
    height: 768,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ipcMain.on('generate-script', (_event: IpcMainEvent, data: ScriptData) => {
    generateScript(data, mainWindow)
  })

  ipcMain.on('get-system-info', () => {
    const info = getSystemInfo()
    mainWindow.webContents.send('get-system-info-success', info)
  })

  ipcMain.on('add-group', (_event: IpcMainEvent, data: any) => {
    addGroup(data, mainWindow)
  })

  ipcMain.on('run-script', async (_event: IpcMainEvent, data: any) => {
    await runScript(data.scriptName, data.groupName)
      .then((result) => {
        console.log(result)
        mainWindow.webContents.send('run-script-update', result)
        // success notification
        new Notification({
          title: 'Success',
          body: 'Script run successfully.'
        }).show()
      })
      .catch((error) => {
        // error notification
        console.log(error)
        new Notification({
          title: 'Error',
          body: 'Script run failed.'
        }).show()
        mainWindow.webContents.send('run-script-update', error)
      })
  })

  ipcMain.on('load-data', (_event: IpcMainEvent, data: filePath) => {
    const result = loadAnsibleFile(data)
    mainWindow.webContents.send('load-data-success', result)
  })

  ipcMain.on('save-storage', (_event: IpcMainEvent, data: any) => {
    console.log(data)
    setItem(data.key, data.value, mainWindow)
    console.log(electronStore.store, 'save')
  })

  ipcMain.on('load-storage', (_event: IpcMainEvent, data: any) => {
    console.log(data)
    getItem(data, mainWindow)
    console.log(electronStore.store, 'load')
  })

  ipcMain.on('export-script', async (_event: IpcMainEvent, data: any) => {
    await executeExportScript(data)
      .then((result) => {
        console.log(result)
        new Notification({
          title: 'Success',
          body: 'Exported successfully to downloads'
        }).show()
      })
      .catch((error) => {
        // error notification
        console.log(error)
      })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    getSystemInfo()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
