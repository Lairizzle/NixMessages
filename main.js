const { app, BrowserWindow, Tray, Menu, Notification, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let configPath = path.join(app.getPath('userData'), 'window-state.json');
let windowState = loadWindowState();

// Load window size/position
function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return { width: 1200, height: 800, x: undefined, y: undefined, darkMode: true };
  }
}

function saveWindowState() {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  windowState.width = bounds.width;
  windowState.height = bounds.height;
  windowState.x = bounds.x;
  windowState.y = bounds.y;
  fs.writeFileSync(configPath, JSON.stringify(windowState));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')  // CSS injection happens here
    }
  });

  mainWindow.loadURL('https://messages.google.com/web');

  // Apply saved theme
  nativeTheme.themeSource = windowState.darkMode ? 'dark' : 'light';

  // Minimize to tray on close
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    saveWindowState();
  });

  // Notifications on new messages (title change)
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    if (title.includes('(')) {
      new Notification({
        title: 'New Message',
        body: 'You have a new message!'
      }).show();
    }
  });

  // --- Build dynamic menu ---
  function createMenu() {
    return Menu.buildFromTemplate([
      {
        label: 'Application',
        submenu: [
          {
            label: windowState.darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode',
            click: () => {
              windowState.darkMode = !windowState.darkMode;
              nativeTheme.themeSource = windowState.darkMode ? 'dark' : 'light';

              // Tell the web page to toggle its injected dark mode CSS
              mainWindow.webContents.send('toggle-dark', windowState.darkMode);

              // Refresh the menu label
              Menu.setApplicationMenu(createMenu());
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            click: () => {
              app.isQuiting = true;
              saveWindowState();
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ]);
  }

  Menu.setApplicationMenu(createMenu());
  mainWindow.setMenuBarVisibility(true);
  mainWindow.autoHideMenuBar = false;
}


app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Messages',
      click: () => mainWindow.show()
    },
    {
      label: windowState.darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode',
      click: () => {
        windowState.darkMode = !windowState.darkMode;
        nativeTheme.themeSource = windowState.darkMode ? 'dark' : 'light';
        tray.setContextMenu(createTrayMenu()); // refresh labels
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        saveWindowState();
        app.quit();
      }
    }
  ]);

  function createTrayMenu() {
    return Menu.buildFromTemplate([
      { label: 'Show Messages', click: () => mainWindow.show() },
      {
        label: windowState.darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode',
        click: () => {
          windowState.darkMode = !windowState.darkMode;
          nativeTheme.themeSource = windowState.darkMode ? 'dark' : 'light';
          tray.setContextMenu(createTrayMenu());
        }
      },
      { type: 'separator' },
      { label: 'Quit', click: () => { app.isQuiting = true; saveWindowState(); app.quit(); } }
    ]);
  }

  tray.setToolTip('NixMessages');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


