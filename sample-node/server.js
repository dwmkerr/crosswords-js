// References:
// https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

const http = require("http");
// const { dirname } = require("path");
const fs = require("fs").promises;
const { trace } = require("../src/helpers");

const host = "localhost";
const port = 8082;

const cachedFiles = [
  { path: "index.html", type: "text/html" },
  { path: "index.css", type: "text/css" },
  { path: "crosswords.css", type: "text/css" },
  { path: "vendor/jquery/jquery.min.js", type: "text/javascript" },
  { path: "vendor/jquery/jquery.min.map", type: "application/json" },
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
  // trim off leading slash '/'
  let reqFilePath = req.url.toLowerCase().slice(1);
  // handle special cases
  reqFilePath = ["", "index.htm"].find(reqFilePath)
    ? "index.html"
    : reqFilePath;
  const cachedFile = cachedFiles.filter((x) => {
    x.path === reqFilePath;
  });

  if (cachedFile) {
    res.writeHead(200, { "Content-Type": `${cachedFile.type}` });
    res.end(cache[cachedFile.path]);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`Error: Resource not found (${req.url})`);
  }
};

(async function bootStrapServer() {
  // Cache static files...
  const cachedFilePaths = cachedFiles.map((x) => {
    x.path;
  });
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
