const path = require('path');
const fs = require('fs');

const PROXY_CONFIG = {
  "/puzzles_data": {
    "target": "http://localhost:4200",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      if (req.url.startsWith('/puzzles_data')) {
        const basePath = path.resolve(process.cwd(), 'docs');
        const filePath = path.join(basePath, req.url);
        const resolvedPath = path.resolve(filePath);

        // Ensure the resolved path strictly stays within the intended base path
        if (resolvedPath.startsWith(basePath + path.sep) && fs.existsSync(resolvedPath)) {
          // Serve JSON directly to bypass proxy
          res.setHeader('Content-Type', 'application/json');
          const data = fs.readFileSync(resolvedPath);
          res.end(data);
          return false; // Tell Vite/Webpack NOT to proxy this request
        }
      }
      return req.url;
    }
  }
};

module.exports = PROXY_CONFIG;
