import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { join } from 'path'
import { BrowserWindow } from 'electron'

export interface ScriptData {
  script: { [key: string]: string | number | boolean }
  scriptName: string
}

export interface Run {
  scriptName: string
  groups: string[]
}

export const generateScript = (data: ScriptData, mainWindow: BrowserWindow): void => {
  try {
    const yamlData = yaml.dump(data.script)
    const scriptFolderPath = join(__dirname, '../../ansible-data/scripts')
    fs.ensureDirSync(scriptFolderPath)
    const filePath = join(scriptFolderPath, `${data.scriptName}.yml`)
    fs.writeFileSync(filePath, yamlData)
    mainWindow.webContents.send('generate-script-success', 'Data written to file successfully.')
  } catch (error: any) {
    // Notify the renderer process of the error
    mainWindow.webContents.send('generate-script-error', error.message)
  }
}

export const addGroup = (data: any, mainWindow: BrowserWindow): void => {
  try {
    const yamlData = yaml.dump(data)
    const scriptFolderPath = join(__dirname, '../../ansible-data/groups')
    fs.ensureDirSync(scriptFolderPath)
    const filePath = join(scriptFolderPath, `test.yml`)
    fs.writeFileSync(filePath, yamlData)
    mainWindow.webContents.send('add-group-success', 'Data written to file successfully.')
  } catch (error: any) {
    // Notify the renderer process of the error
    mainWindow.webContents.send('add-group-error', error.message)
  }
}

// export const addRun = (data: Run, mainWindow: BrowserWindow): void => {
//   try {
//     const yamlData = yaml.dump(data)
//     const datetime = new Date().toISOString().replace(/:/g, '-')
//     const scriptFolderPath = join(__dirname, '../../ansible-data/runs')
//     const filePath = join(scriptFolderPath, `${data.scriptName}-${datetime}.yml`)
//     fs.writeFileSync(filePath, yamlData)
//     mainWindow.webContents.send('add-run-success', 'Data written to file successfully.')
//   } catch (error: any) {
//     // Notify the renderer process of the error
//     mainWindow.webContents.send('add-run-error', error.message)
//   }
// }
