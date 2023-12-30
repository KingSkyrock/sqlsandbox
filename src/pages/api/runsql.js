const sqlite3 = require('sqlite3').verbose();
export const config = {
  api: {
    externalResolver: true,
  },
}
export default function handler(req, res) {
  var data = new sqlite3.Database(`data/${req.body.id}.sqlite`);

  data.all(req.body.code, function(error, rows) {
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
}