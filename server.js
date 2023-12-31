const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

var appServ;

app.prepare().then(() => {
  appServ = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
 
      if (!pathname.includes("api")) {
        await app.render(req, res, pathname, query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

if (process.env.NODE_ENV === "production") {
  const pkg = require("./package.json");
  const Greenlock = require("@root/greenlock");

  var gl = Greenlock.create({
    packageRoot: __dirname,
    configDir: "./greenlock.d/",
    packageAgent: pkg.name + "/" + pkg.version,
    maintainerEmail: "koxaha7706@kembung.com",
    cluster: false,
    notify: function (event, details) {
        if ("error" === event) {
            console.error('greenlock notify :' + event, details);
        }
    },
  });
  
  gl.manager.defaults({
    subscriberEmail: 'koxaha7706@kembung.com',
    agreeToTerms: true,
    challenges: {
      "http-01": {
        module: "acme-http-01-standalone",
      }
    }
  });

  gl.add({
    subject: 'sandboxsql.com',
    altnames: ['sandboxsql.com', 'www.sandboxsql.com']
  });
}
