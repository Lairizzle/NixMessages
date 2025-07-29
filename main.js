const { app, BrowserWindow, Tray, Menu, Notification, nativeTheme, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let configPath = path.join(app.getPath('userData'), 'window-state.json');
let windowState = loadWindowState();

let aboutWindow;

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
	
function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 600,
    height: 350,
    title: 'About NixMessages',
    resizable: false,
    minimizable: false,
    maximizable: false,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  aboutWindow.setMenu(null); // Hide menu bar

  aboutWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <center>
    <h1>About NixMessages</h1>
    <p>Version: 1.0.1</p>
    <p>Author: Keith Henderson</p>
    <p><a href="https://www.rizzforge.org">www.rizzforge.org</a></p>
    <p>A simple desktop client for Google Messages.</p>
    <p><a href="https://github.com/lairizzle/nixmessages">GitHub</a></p>
    <button onclick="window.close()">Close</button>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { margin-top: 0; }
      button { margin-top: 20px; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
		<center>
  `));

  // Force links to open in user's default browser
  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  aboutWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

mainWindow.loadURL('https://messages.google.com/web');

mainWindow.webContents.on('did-finish-load', () => {
  mainWindow.setTitle('NixMessages');

  mainWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault();

    // Extract unread count if present
    const match = title.match(/\((\d+)\)/); // looks for "(number)"
    const count = match ? ` (${match[1]})` : '';

    // Set the window title to always include "NixMessages"
    mainWindow.setTitle(`NixMessages${count}`);
  });
});



  // Apply saved theme
  nativeTheme.themeSource = windowState.darkMode ? 'dark' : 'light';
  
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
        label: 'Options',
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
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
            createAboutWindow();
          }
        }
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
