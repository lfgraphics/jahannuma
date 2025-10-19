const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create self-signed certificate if it doesn't exist
const keyPath = path.join(__dirname, "localhost-key.pem");
const certPath = path.join(__dirname, "localhost.pem");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log("Generating self-signed certificates...");
  const { execSync } = require("child_process");

  try {
    // Generate self-signed certificate
    const opensslPath =
      process.platform === "win32"
        ? '"C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe"'
        : "openssl";
    execSync(
      `${opensslPath} req -x509 -out "${certPath}" -keyout "${keyPath}" -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -days 365`,
      { stdio: "inherit" }
    );
    console.log("Certificates generated successfully!");
  } catch (error) {
    console.error(
      "Failed to generate certificates. Please install OpenSSL or generate certificates manually."
    );
    console.log('Alternative: Use "pnpm dev" for HTTP development');
    process.exit(1);
  }
}

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log(
        "> Note: You may need to accept the self-signed certificate in your browser"
      );
    });
});
