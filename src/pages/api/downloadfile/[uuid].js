import fs from 'fs'
export const config = {
  api: {
    externalResolver: true,
  },
}
export default function handler(req, res) {
  res.send(fs.readFileSync(`data/${req.query.uuid}.sqlite`));
}