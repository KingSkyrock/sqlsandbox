const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const DATA_DIR = path.join(__dirname, '../data');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('file-system');
const formidable = require('formidable');

app.use(express.static(DIST_DIR));

app.get('/api', (req, res) => {
  res.send(mockResponse);
});

app.get('*', (req, res) => {
  res.sendFile(HTML_FILE);
});

app.use(express.static(DATA_DIR));

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())

app.post('/startsql', (req, res) => {
  console.log(req.body.id);
  data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

  data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function(error, rows) {
    console.log(data)
    if (error) {
      console.log(error)
      res.status(422);
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        error: {
          message: error.message,
          errno: error.errno,
          code: error.code
        }
      }));
      res.end();
    } else {
      console.log(rows)
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        tables: rows
      }));
      res.end();
    }
  });
})

app.post('/uploadfile', (req, res) => {
  var form = new formidable.IncomingForm();
  form.maxFileSize = 1000000000;
  var filename;
  form.parse(req)
    .on('fileBegin', (name, file) => {
      console.log(file)
      var dir = __dirname.split("\\");
      dir.pop();
      file.newFileName = filename = file.originalFilename
      file.filepath = dir.join("\\") + '/data/' + file.originalFilename
    }).on('aborted', (name, file) => {
      res.statusCode = 422;
      res.end();
    }).on('error', (name, file) => {
      res.statusCode = 500;
      res.end();
    }).on('end', (name, file) => {
      var data = new sqlite3.Database('data/' + filename);
 
      data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function (error, rows) {
        console.log(data)
        if (error) {
          console.log(error)
          res.status(422);
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({
            error: {
              message: error.message,
              errno: error.errno,
              code: error.code
            }
          }));
          res.end();
        } else {
          console.log(rows)
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({
            tables: rows
          }));
          res.end();
        }
      });
    })
});

app.post('/loadtemplate', (req, res) => {
  console.log(req.body.id);
  var template = ""
  if (req.body.template == 1) {
    template = "Northwind_small.sqlite"
  } else if (req.body.template == 2) {
    template = "Hospital.sqlite"
  } else if (req.body.template == 3) {
    template = "PlanetExpress.sqlite"
  }
  fs.copyFile(template, `data/${req.body.id}.sqlite`, {
    done: function(err) {
      var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

      data.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", function(error, rows) {
        console.log(data)
        if (error) {
          console.log(error)
          res.status(422);
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({
            error: {
              message: error.message,
              errno: error.errno,
              code: error.code
            }
          }));
          res.end();
        } else {
          console.log(rows)
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({
            tables: rows
          }));
          res.end();
        }
      });
    }
  });
})

app.post('/getSchema', (req, res) => {
  var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);
  console.log(req.body.table)

  data.all("PRAGMA table_info(" + "'" + req.body.table + "'" + ")", function(error, rows) {
    if (error) {
      console.log(error)
      res.status(422);
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        error: {
          message: error.message,
          errno: error.errno,
          code: error.code
        }
      }));
      res.end();
    } else {
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        rows: rows
      }));
      res.end();
    }
  })
})

app.post('/runsql', (req, res) => {
  console.log(req.body.code);
  var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

  data.all(req.body.code, function(error, rows) {
    if (error) {
      console.log(error)
      res.status(422);
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        error: {
          message: error.message,
          errno: error.errno,
          code: error.code
        }
      }));
      res.end();
    } else {
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        rows: rows
      }));
      res.end();
    }
  })
})

if (process.env.NODE_ENV === "production") {
  require("greenlock-express")
      .init({
          packageRoot: __dirname + "/..",
          configDir: "./greenlock.d",
          maintainerEmail: "koxaha7706@kembung.com",

          cluster: false
      })
      .serve(app);
} else {
  app.listen(port, function () {
    console.log('App listening on port: ' + port);
  });
}
