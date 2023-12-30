const sqlite3 = require('sqlite3').verbose();
const formidable = require('formidable');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  var form = new formidable.IncomingForm();
  console.log(form)
  form.maxFileSize = 1000000000;
  var filename;
  form.parse(req)
  form
    .on('fileBegin', (name, file) => {
      var dir = __dirname.split("\\");
      dir.splice(-4, 4)
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
    })
}