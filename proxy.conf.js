const path = require('path');
const fs = require('fs');

const PROXY_CONFIG = {
  "/puzzles_data": {
    "target": "http://localhost:4200",
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
      if (req.url.startsWith('/puzzles_data')) {
        const filePath = path.join(process.cwd(), 'docs', req.url);
        if (fs.existsSync(filePath)) {
          // Serve JSON directly to bypass proxy
          res.setHeader('Content-Type', 'application/json');
          const data = fs.readFileSync(filePath);
          res.end(data);
          return false; // Tell Vite/Webpack NOT to proxy this request
        }
      }
      return req.url;
    }
  }
};

module.exports = PROXY_CONFIG;
