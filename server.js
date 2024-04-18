const { parse } = require('url')
const next = require('next')
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();
const formidable = require('formidable');
const fs = require('fs');
 
const DATA_DIR = path.join(__dirname, './data');
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const server = express();

server.use(bodyParser.urlencoded({
  extended: true
}))

server.use(bodyParser.json())

server.use('/data', express.static(DATA_DIR));

app.prepare().then(() => {
  server.get('*', (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
 
      if (!pathname.includes("api")) {
        app.render(req, res, pathname, query);
      } 
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  });

  server.post('/api/getschema', (req, res) => {
    var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

    data.all("PRAGMA table_info(" + "'" + req.body.table + "'" + ")", function(error, rows) {
      if (error) {
        res.status(422).json({
          error: {
            message: error.message,
            errno: error.errno,
            code: error.code
          }
        });
        res.end();
      } else {
        res.status(200).json({
          rows: rows
        });
        res.end();
      }
    })
  });

  server.post('/api/loadtemplate', (req, res) => {
    var template = ""
    if (req.body.template == 1) {
      template = "public/Northwind_small.sqlite"
    } else if (req.body.template == 2) {
      template = "public/Hospital.sqlite"
    } else if (req.body.template == 3) {
      template = "public/PlanetExpress.sqlite"
    }
    fs.copyFile(template, `data/${req.body.id}.sqlite`, () => {
      var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

      data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function(error, rows) {
        if (error) {
          res.status(422).json({
            error: {
              message: error.message,
              errno: error.errno,
              code: error.code
            }
          });
          res.end();
        } else {
          res.status(200).json({
            tables: rows
          });
          res.end();
        }
      });
    });
  });

  server.post('/api/runsql', (req, res) => {
    var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

    new Promise(function(resolve, reject) {
      data.all(req.body.code, function(error, rows) {
        if (error) {
          return reject(error);
        } else {
          return resolve(rows);
        }
      });
   
      setTimeout(function() {
        return reject(408);
      }, 5000)
    }).then((result) => {
      res.status(200).json({
        rows: result
      });
      res.end();
    }, (error) => {
      if (error == 408) {
        res.status(408).json({
          error: {
            message: "Time limit of 5 seconds exceeded.",
          }
        });
        res.end();
      } else {
        res.status(422).json({
          error: {
            message: error.message,
            errno: error.errno,
            code: error.code
          }
        });
        res.end();
      }
    })
  });
  
  server.post('/api/startsql', (req, res) => {
    var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

    new Promise(function(resolve, reject) {
      data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function(error, rows) {
        if (error) {
          return reject(error);
        } else {
          return resolve(rows);
        }
      });

      setTimeout(function() {
        return reject(408);
      }, 5000)
    }).then((result) => {
      res.status(200).json({
        tables: result
      });
      res.end();
    }, (error) => {
      if (error == 408) {
        res.status(408).json({
          error: {
            message: "Time limit of 5 seconds exceeded.",
          }
        });
        res.end();
      } else {
        res.status(422).json({
          error: {
            message: error.message,
            errno: error.errno,
            code: error.code
          }
        });
        res.end();
      }
    })
  });

  server.post('/api/uploadfile', (req, res) => {
    var form = new formidable.IncomingForm();
    form.maxFileSize = 1000000000;
    var filename;
    form.parse(req)
    form
      .on('fileBegin', (name, file) => {
        var dir = __dirname.split("\\");
        file.newFileName = filename = file.originalFilename
        file.filepath = dir.join("\\") + '/data/' + file.originalFilename
      }).on('aborted', (name, file) => {
        res.status(422)
        res.end();
      }).on('error', (name, file) => {
        res.status(500)
        res.end();
      }).on('end', (name, file) => {
        var data = new sqlite3.Database('data/' + filename);
  
        data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function (error, rows) {
          if (error) {
            res.status(422).json({
              error: {
                message: error.message,
                errno: error.errno,
                code: error.code
              }
            });
            res.end();
          } else {
            res.status(200).json({
              tables: rows
            });
            res.end();
          }
        });
      });
  });
});

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

