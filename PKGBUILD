pkgname=nixmessages
pkgver=1.0.1
pkgrel=1
pkgdesc="Unofficial Google Messages desktop wrapper for Linux (Electron-based)"
arch=('x86_64')
url="https://github.com/lairizzle/nixmessages"
license=('MIT')
depends=('electron')
makedepends=('nodejs' 'npm')
source=("$pkgname-$pkgver.tar.gz::https://github.com/lairizzle/nixmessages/releases/download/v$pkgver/$pkgname-$pkgver.tar.gz")
sha256sums=('4aed903bf396a9031c88016ae6a0104d515b16b9faf7205f461f983c88f933d8') 

build() {
  cd "$srcdir/$pkgname"
  npm install
  npx electron-builder --linux dir
}

package() {
  install -d "$pkgdir/opt/$pkgname"
  cp -r "$srcdir/$pkgname/dist/linux-unpacked/"* "$pkgdir/opt/$pkgname"

  install -d "$pkgdir/usr/bin"
  ln -s "/opt/$pkgname/nixmessages" "$pkgdir/usr/bin/nixmessages"

  install -d "$pkgdir/usr/share/applications"
  cat > "$pkgdir/usr/share/applications/nixmessages.desktop" <<EOF
[Desktop Entry]
Name=NixMessages
Exec=nixmessages
Icon=/opt/$pkgname/resources/app/icon.png
Type=Application
Categories=Network;Chat;
EOF
}

