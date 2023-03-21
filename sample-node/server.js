// References:
// https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

const http = require("http");
const { dirname } = require("path");
const fs = require("fs").promises;

const host = "localhost";
const port = 8082;

const cachedFilePaths = [
  "index.html",
  "index.css",
  "crosswords.css",
  "vendor/jquery/jquery.min.js",
  "vendor/jquery/jquery.min.map",
];

let cache = [];

async function getCachedBuffers(relfilePaths) {
  // Retrieve a static file asynchronously
  async function getContent(relFilePath) {
    return fs.readFile(`${__dirname}/${relFilePath}`);
  }

  try {
    // Promise waits on _all_ files to be retrieved
    return Promise.all(relfilePaths.map(getContent));
  } catch (err) {
    console.log(`Error: File caching failed.\n${err}`);
    exit(1);
  }
}

const requestListener = function (req, res) {
  const resUrl = req.url.toLowerCase();

  switch (resUrl) {
    case "/":
    case "/index.html":
    case "/index.htm":
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(cache["index.html"]);
      break;
    case "/index.css":
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(cache["index.css"]);
      break;
      case "/crossword.css":
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(cache["crosswords.css"]);
        break;
      case "/vendor/jquery/jquery.min.js":
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.end(cache["vendor/jquery/jquery.min.js"]);
      break;
    case "/vendor/jquery/jquery.min.map":
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(cache["vendor/jquery/jquery.min.map"]);
      break;
    default:
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`Error: Resource not found (${resUrl})`);
  }
};

(async function bootStrapServer() {
  // Cache static files...
  const cachedFileBuffers = await getCachedBuffers(cachedFilePaths);
  // Populate cache object...
  cachedFilePaths.map((element, index) => {
    cache[element] = cachedFileBuffers[index].toString();
  });

  // Create server...
  const server = http.createServer(requestListener);

  // Open for business!
  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log();
  });
})();
