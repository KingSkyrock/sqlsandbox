const { parse } = require('url')
const next = require('next')
const express = require('express');
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const server = express();

app.prepare().then(() => {
  server.all('*', (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
 
      if (!pathname.includes("api")) {
        app.render(req, res, pathname, query)
      } else {
        handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  });
})

if (process.env.NODE_ENV === "production") {
  require("greenlock-express")
      .init({
          packageRoot: __dirname,
          configDir: "./greenlock.d",
          maintainerEmail: "koxaha7706@kembung.com",

          cluster: false
      })
      .serve(server);
} else {
  server.listen(port, function () {
    console.log('App listening on port: ' + port);
  });
}
