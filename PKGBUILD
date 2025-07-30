pkgname=nixmessages
pkgver=1.0.2
pkgrel=1
pkgdesc="Unofficial Google Messages desktop wrapper for Linux (Electron-based)"
arch=('x86_64')
url="https://github.com/lairizzle/nixmessages"
license=('MIT')
depends=('electron')
makedepends=('nodejs' 'npm')
source=("$pkgname-$pkgver.tar.gz::https://github.com/lairizzle/nixmessages/releases/download/v$pkgver/$pkgname-$pkgver.tar.gz")
sha256sums=('c3b534f3ffab750c8adec3e037a9ac1ad7057f05b611432ab642205b8af988c9')

build() {
  cd "$srcdir/$pkgname"
  npm install
  npx electron-builder --linux dir
}

package() {
  # Install app
  install -d "$pkgdir/opt/$pkgname"
  cp -r "$srcdir/$pkgname/dist/linux-unpacked/"* "$pkgdir/opt/$pkgname"

  # Install binary symlink
  install -d "$pkgdir/usr/bin"
  ln -s "/opt/$pkgname/nixmessages" "$pkgdir/usr/bin/nixmessages"

  # Install icon to hicolor (512x512 for menus)
  install -d "$pkgdir/usr/share/icons/hicolor/512x512/apps"
  cp "$srcdir/$pkgname/icon.png" \
     "$pkgdir/usr/share/icons/hicolor/512x512/apps/nixmessages.png"

  # Desktop entry (use icon name, not full path)
  install -d "$pkgdir/usr/share/applications"
  cat > "$pkgdir/usr/share/applications/nixmessages.desktop" <<EOF
[Desktop Entry]
Name=NixMessages
Exec=nixmessages
Icon=nixmessages
Type=Application
Categories=Network;Chat;
EOF
}


