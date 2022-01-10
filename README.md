## Requirements 
- nodejs@16 or latest
- yarn@1 or latest
```bash
npm i -g yarn
```
## Env 
- `SESSION` - tgsnake string session, get it from https://replit.com/@butthx/TgSnakeGenerateSessions don't forget to login as bot.
- `BOT_TOKEN` - Your bot token, get it from [botFather](https://t.me/botfather).
- `API_HASH` - Your api hash, get it from my.telegram.org 
- `API_ID` - Your api id, get it from my.telegram.org 
- `MONGODB_URI` - Your mongodbURI.

## Local Deploy 
```bash 
$ git clone https://github.com/butthx/dots 
$ cd dots 
$ yarn install 
```
create `.env` file and fill the [env value](#value)
```bash 
$ yarn build 
$ yarn start
```
## Cloud Deploy 
<center>

[![]()](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FOhYoonHee%2Fcaptcha_bot%2Ftree%2Fmaster&envs=BOT_TOKEN%2CDB_URI&BOT_TOKENDesc=BOT_TOKEN+from+%40botfather&DB_URIDesc=Your+MongoDb+URI)

</center>