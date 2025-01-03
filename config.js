const fs = require('fs');

var appConfig;
try {
  appConfig = JSON.parse(fs.readFileSync("config.json").toString());
  const { clientid, maintainerEmail, openaiKey } = appConfig;

  console.log("Configuration successfully initiated with:");
  console.log(appConfig);

} catch (error) {
  console.log(error);
  console.log("Missing config.json with required keys `clientid`, `maintainerEmail`, and `openaiKey`");
  process.exit();
}

module.exports = appConfig;