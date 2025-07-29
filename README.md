# NixMessages

NixMessages is a lightweight Electron-based desktop wrapper for [Google Messages Web](https://messages.google.com/web), designed for Linux (and cross-platform).  
It supports **tray minimization, dark mode toggling, saved window state, and notifications** when new messages arrive.

---

## Features

- Runs Google Messages as a standalone desktop app  
- System tray integration (hide/restore easily)  
- Toggleable **dark mode** (persists across sessions)  
- Remembers window size and position  
- Desktop notifications for new messages  
- Simple **Help → About** dialog with external links

---

## Installation

### Installation (Arch Linux)

```bash
# Download the PKGBUILD from GitHub
wget https://github.com/lairizzle/nixmessages/releases/latest/download/PKGBUILD

# Build and install
makepkg -si
```

### Usage

Launch the app. 

```bash
nixmessages
```
Sign into Google Messages Web normally.

The app will:
    - Remember your login state
    - Notify you of new messages
    - Minimize to tray when closed (click tray icon to restore)

### Configuration / Behavior

Tray support: 
    - Clicking the window close button will hide it to tray.
Dark mode: 
    - Toggles both Electron native theme and injected web styles.
Window state: 
    - Position and size saved to window-state.json in app data.
