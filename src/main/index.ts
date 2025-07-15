import { app, Tray, BrowserWindow } from 'electron/main'
import { shell, nativeImage, NativeImage } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { electronApp, is } from '@electron-toolkit/utils'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function getTrayIcon(): NativeImage {
  const iconPath = join(__dirname, '../../resources/icon.png')
  const image = nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 })
  return image
}

function createTrayWindow(): void {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 335,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon: getTrayIcon() } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('blur', () => {
    mainWindow?.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  tray = new Tray(getTrayIcon())

  tray.setToolTip('Tray App')

  createTrayWindow()

  tray.on('click', () => {
    if (!mainWindow) return

    const isVisible = mainWindow.isVisible()

    if (isVisible) {
      mainWindow.hide()
    } else {
      const trayBounds = tray!.getBounds()
      const windowBounds = mainWindow.getBounds()

      const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
      const y = Math.round(trayBounds.y + trayBounds.height + 4)

      mainWindow.setPosition(x, y, false)
      mainWindow.show()
      mainWindow.focus()
    }
  })
})
