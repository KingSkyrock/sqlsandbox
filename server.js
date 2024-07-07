const { parse } = require('url')
const next = require('next')
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const sqlite3 = require('sqlite3').verbose();
const formidable = require('formidable');
const fs = require('fs');
const { jwtDecode } = require('jwt-decode');

const DATA_DIR = path.join(__dirname, './data');
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const server = express();

const accounts = new sqlite3.Database(`accounts.sqlite`);
accounts.all("CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, learning_progress TEXT);", function(error, rows) {
  if (error) {
    console.log(error)
  }
});

const learning_tasks = [[0,0]]

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: fs.readFileSync("openai.key").toString() });

async function main() {
  assistant = await openai.beta.assistants.create({
    name: "SQL Bot",
    instructions: "You are a helpful assistant to assist people with fixing their SQLite queries and learning SQLite. Help write queries and teach.",
    model: "gpt-4o"
  });
}
//main();

server.use(bodyParser.urlencoded({
  extended: true
}))

server.use(cookieParser());

server.use(bodyParser.json())

server.use('/data', express.static(DATA_DIR));

function googleJWTValid(token) {
  return token?.email && token.email_verified && token.exp >= Date.now()/1000
}

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

  server.post('/api/assistant', (req, res) => {
    async function talk() {
      const thread = await openai.beta.threads.create();
      const message = await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: "test message"
        }
      );
      const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistant.id
      })
        .on('textCreated', (text) => process.stdout.write('\nassistant > '))
        .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
        .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta, snapshot) => {
          if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
              process.stdout.write(toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
              process.stdout.write("\noutput >\n");
              toolCallDelta.code_interpreter.outputs.forEach(output => {
                if (output.type === "logs") {
                  process.stdout.write(`\n${output.logs}\n`);
                }
              });
            }
          }
        });
      res.status(200);
      res.end();
    }

    if (assistant.id)
      talk();
    
  });

  server.post('/api/google_oauth', (req, res) => {
    var cred = jwtDecode(req.body.credential);
    if (googleJWTValid(cred)) {
      res.cookie('token', req.body.credential, {httpOnly: true});
      accounts.all(`INSERT INTO accounts(email,learning_progress) VALUES ("${cred.email}", "${JSON.stringify(learning_tasks)}")`, function(error, rows) {
        if (error) {
          res.status(401).json({
            error: {
              message: "Login failed"
            }
          });
        } else {
          res.status(200).json({
            email: cred.email
          });
        }
        res.end();
      });
    } else {
      res.status(401).json({
        error: {
          message: "Login failed"
        }
      });
      res.end();
    }
  })

  server.post('/api/check_logged_in', (req, res) => {
    var cred = jwtDecode(req.cookies.token);
    var loggedIn = googleJWTValid(cred);
    res.status(200).json({
      loggedIn: loggedIn
    });
    res.end()
  })

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
    if (req.body.id.endsWith("-l")) {
      var cred = jwtDecode(req.cookies.token);
      var loggedIn = googleJWTValid(cred);
      if (!loggedIn) {
        res.status(401).json({
          error: {
            message: "You must sign in before using the learning template."
          }
        });
        res.end();
        return;
      } else {
        var accounts = new sqlite3.Database("accounts.sqlite");
      }
    }

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

