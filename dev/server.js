const { trace, tracing } = require("../src/helpers");
// enable console log tracing
tracing(true);

const http = require("http");
const fs = require("fs").promises;
const { execSync } = require("node:child_process");
const { exit } = require("node:process");

const host = "localhost";
const port = 8081;

const cachedFiles = [
  { path: "index.html", type: "text/html" },
  { path: "index.css", type: "text/css" },
  { path: "crosswords.css", type: "text/css" },
  { path: "crosswords.js", type: "text/javascript" },
  { path: "../src/helpers.js", type: "text/javascript" },
  { path: "vendor/jquery/jquery.min.js", type: "text/javascript" },
  { path: "vendor/jquery/jquery.min.map", type: "application/json" },
  { path: "favicon.ico", type: "image/x-icon" },
];

let cache = [];

// Convert a relative path to an absolute path
toAbsPath = (relpath) => {
  return `${__dirname}/${relpath}`;
};

async function getFileBuffers(relfilePaths) {
  // Retrieve a static file asynchronously
  async function getContent(relFilePath) {
    return fs.readFile(toAbsPath(relFilePath));
  }

  try {
    // Promise waits on _all_ files to be retrieved
    return Promise.all(relfilePaths.map(getContent));
  } catch (err) {
    trace(`Error: File caching failed.\n${err}`);
    exit(1);
  }
}

/**
 * **lessc** - asynchronously compile a '.less' file to css
 * @param {*} src pathspec for less file
 * @param {*} dst pathspec for css file
 * @returns a Promise containing the compilation in a sub-process
 */
async function lessc(src, dst) {
  // compile asynchronously
  async function compile(s, d) {
    trace(`compiling: ${src} to ${dst}`);
    const cmdline = ["npx lessc", toAbsPath(s), toAbsPath(d)].join(" ");
    return execSync(cmdline);
  }

  try {
    return Promise.all([compile(src, dst)]);
  } catch (err) {
    trace(`Error: css compilation failed for (${src}).\n${err}`);
    exit(1);
  }
}

const requestListener = function (req, res) {
  trace(`request: ${req.url}`);
  // Trim off leading slash '/'
  let reqFilePath = req.url.toLowerCase().slice(1);
  // Handle special cases for root page (index.html)
  reqFilePath = ["", "index.htm"].includes(reqFilePath)
    ? "index.html"
    : reqFilePath;
  // Look through cached files for reqFilePath
  const matches = cachedFiles.filter((x) => x.path === reqFilePath);
  const cachedFile = matches ? matches[0] : null;
  if (cachedFile) {
    // Found in cache
    trace(`  cache-hit: ${cachedFile.path}`);
    res.writeHead(200, { "Content-Type": `${cachedFile.type}` });
    res.end(cache[cachedFile.path]);
  } else {
    // No match
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`Error: Resource not found (${req.url})`);
  }
};

// Create and start the webserver...
async function bootStrapServer() {
  const filePaths = cachedFiles.map((x) => x.path);
  // Compile .less files to .css
  await lessc("../src/crosswords.less", "crosswords.css");
  // Cache static files - dependent on ./crosswords.css
  const fileBuffers = await getFileBuffers(filePaths);
  // Populate cache
  filePaths.map((element, index) => {
    trace(`caching: ${element}`);
    cache[element] = fileBuffers[index].toString();
  });

  // Create server
  const server = http.createServer(requestListener);

  // Open for business!
  server.listen(port, host, () => {
    trace(`Server is running on http://${host}:${port}`);
  });
}

bootStrapServer();
