const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const darkStyle = document.createElement('style');
  darkStyle.id = 'custom-dark-style';
  darkStyle.textContent = `
    html, body {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }
    * {
      scrollbar-color: #444 #222;
    }
  `;
  document.head.appendChild(darkStyle);

  ipcRenderer.on('toggle-dark', (event, isDark) => {
    const style = document.getElementById('custom-dark-style');
    if (style) {
      style.disabled = !isDark;
    }
  });
});


