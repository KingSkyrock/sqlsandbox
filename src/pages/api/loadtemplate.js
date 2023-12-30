const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
export const config = {
  api: {
    externalResolver: true,
  },
}
export default function handler(req, res) {
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
}