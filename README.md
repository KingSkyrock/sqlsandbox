# SandboxSQL
https://sandboxsql.com/
A tool for running SQL code and learning.

### Requirements

In order to deploy this app, you will need a file called `config.json` in the application root directory with contents that look like the following:

```json
{
  "clientid": "yourid.apps.googleusercontent.com",
  "maintainerEmail": "youremail@example.com",
  "openaiKey": "sk-abcdefgh"
}
```
- `clientid` should be the Google OAuth ID for your app.
- `maintainerEmail` should be the email to contact for security and critical bug notices related to Greenlock.
- `openaiKey` should be an API key from OpenAI

These values are privately set for the hosted instance of SandboxSQL.com
