@echo off
echo Generating self-signed SSL certificates for localhost...

openssl req -x509 -out localhost.pem -keyout localhost-key.pem ^
  -newkey rsa:2048 -nodes -sha256 ^
  -subj "/CN=localhost" -extensions EXT -config ^
  -days 365

echo.
echo Certificates generated:
echo - localhost.pem (certificate)
echo - localhost-key.pem (private key)
echo.
echo You can now run: pnpm dev:https