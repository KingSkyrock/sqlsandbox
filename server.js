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

const appConfig = require('./config');

const accounts = new sqlite3.Database(`accounts.sqlite`);
//should eventually make this specific to the db and not the account
accounts.all("CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, tasks_done TEXT, learning_progress INTEGER);", function(error, rows) {
  if (error) {
    console.log(error)
  }
});

const learning_tasks = [[0,0], [0,0,0], [0,0,0], [0,0]]
const task_answers = [  
  [
    "SELECT * FROM Customer",
    "SELECT FirstName,LastName FROM Employee"
  ],
  [
    "SELECT * FROM 'Order'",
    "SELECT * FROM Employee ORDER BY BirthDate ASC",
    "SELECT * FROM Employee ORDER BY BirthDate DESC",
  ],
  [
    "SELECT Address FROM Employee WHERE Country = \"USA\"",
    "SELECT * from Customer WHERE ContactTitle='Sales Representative' OR ContactTitle='Sales Manager' ORDER BY City ASC",
    "SELECT DISTINCT UnitPrice from Product WHERE UnitPrice BETWEEN 10 AND 20",
  ], ["SELECT * FROM Customer", "SELECT FirstName,LastName FROM Employee"]
]

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: appConfig.openaiKey });

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

  server.post('/api/aierrorhelp', (req, res) => {
    //WIP
  });

  server.post('/api/google_oauth', (req, res) => {
    var cred = jwtDecode(req.body.credential);
    if (googleJWTValid(cred)) {
      res.cookie('token', req.body.credential, {httpOnly: true});
      let params = { $email: cred.email, $tasks_done: JSON.stringify(learning_tasks) };
      accounts.all("INSERT OR IGNORE INTO accounts(email,tasks_done,learning_progress) VALUES ($email, $tasks_done, 0)", params, function(error, rows) {
        if (error) {
          console.log(error)
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
    if (req.cookies?.token) {
      var cred = jwtDecode(req.cookies?.token);
      var loggedIn = googleJWTValid(cred);
      res.status(200).json({
        loggedIn: loggedIn
      });
      res.end()
    } else {
      res.status(200).json({
        loggedIn: false
      });
      res.end()
    }
    
  })

  server.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200);
    res.end();
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

  server.post('/api/get_learning_progress', (req, res) => {
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
      let params = { $email: cred.email };
      accounts.all("SELECT tasks_done,learning_progress FROM accounts WHERE email = $email", params, function(error, rows) {
        if (error) {
          res.status(500).json({
            error: {
              message: "Internal server error. This is not a problem with your SQL code."
            }
          });
          res.end();
        } else {
          res.status(200).json({
            progress: rows[0].learning_progress,
            tasks: rows[0].tasks_done
          })
        }
      });
    }
  });

  server.post('/api/skip_learning', (req, res) => {
    var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);
    var cred = jwtDecode(req.cookies?.token);
    if (req.body.id.endsWith("-l")) {
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
        let params = { $email: cred.email };
        accounts.all("SELECT tasks_done,learning_progress FROM accounts WHERE email = $email", params, function(error, rows) {
          if (error) {
            res.status(500).json({
              error: {
                message: "Internal server error"
              }
            });
            res.end();
          } else {
            let learning_progress = rows[0].learning_progress;
            let tasks_done = JSON.parse(rows[0].tasks_done);
            tasks_done[learning_progress] = new Array(tasks_done[learning_progress].length).fill(1);
            learning_progress += 1;
            let params = { $email: cred.email, $tasks_done: JSON.stringify(tasks_done), $learning_progress: learning_progress };
            accounts.all("UPDATE accounts SET tasks_done = $tasks_done, learning_progress = $learning_progress WHERE email = $email", params, function(error, rows) {
              if (error) {
                console.log(error)
                res.status(500).json({
                  error: {
                    message: "Internal server error"
                  }
                });
                res.end();
              } else {
                res.status(200);
                res.end();
              }
            });
          }
        });
      }
    }
  });

  server.post('/api/runsql', (req, res) => {
    var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);
    var cred;
    if (req.cookies?.token) {
      cred = jwtDecode(req.cookies?.token);
    }
    var possible_answers = [];

    function run_sql() {
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
        var completed_task = null;
        for (const [answer, task_location] of possible_answers) {
          if (JSON.stringify(answer) == JSON.stringify(result)) {
            completed_task = task_location;
            let params = { $email: cred.email };
            accounts.all("SELECT tasks_done,learning_progress FROM accounts WHERE email = $email", params, function(error, rows) {
              if (error) {
                res.status(500).json({
                  error: {
                    message: "Internal server error"
                  }
                });
                res.end();
              } else {
                let learning_progress = rows[0].learning_progress;
                let tasks_done = JSON.parse(rows[0].tasks_done);
                tasks_done[task_location[0]][task_location[1]] = 1;
                if (tasks_done[task_location[0]].every(val => val == 1)) {
                  learning_progress += 1;
                }
                let params = { $tasks_done: JSON.stringify(tasks_done), $learning_progress: learning_progress, $email: cred.email };
                accounts.all("UPDATE accounts SET tasks_done = $tasks_done, learning_progress = $learning_progress WHERE email = $email", params, function(error, rows) {
                  if (error) {
                    console.log(error)
                    res.status(500).json({
                      error: {
                        message: "Internal server error"
                      }
                    });
                    res.end();
                  }
                });
              }
            });
            break;
          }
        }
        res.status(200).json({
          rows: result,
          completed_task: completed_task
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
              code: error.code,
              sql: req.body.code
            }
          });
          res.end();
        }
      })
    }

    if (req.body.id.endsWith("-l")) {
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
        let params = { $email: cred.email };
        accounts.all("SELECT tasks_done,learning_progress FROM accounts WHERE email = $email", params, function(error, rows) {
          if (error) {
            res.status(500).json({
              error: {
                message: "Internal server error. This is not a problem with your SQL code."
              }
            });
            res.end();
          } else {
            var relevant_tasks = JSON.parse(rows[0].tasks_done)[rows[0].learning_progress]
            var relevant_tasks_answers = task_answers[rows[0].learning_progress]
            if (relevant_tasks) {
              for (let i = 0; i < relevant_tasks.length; i++) {
                data.all(relevant_tasks_answers[i], function(error, rows2) {
                  if (error) {
                    console.log(error);
                  } else {
                    possible_answers.push([rows2, [rows[0].learning_progress, i]]);
                    if (i == relevant_tasks.length - 1) {
                      run_sql();
                    }
                  }
                });
              }
            } else {
              run_sql();
            }
          }
        });
      }
    } else {
      run_sql();
    }
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
        maintainerEmail: appConfig.maintainerEmail,

        cluster: false
    })
    .serve(server);
} else {
  server.listen(port, function () {
    console.log('App listening on port: ' + port);
  });
}

