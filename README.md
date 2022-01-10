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

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fbutthx%2Fdots&envs=BOT_TOKEN%2CSESSION%2CAPI_HASH%2CAPI_ID%2CMONGODB_URI&BOT_TOKENDesc=Your+bot+token%2C+get+it+from+botFather&SESSIONDesc=tgsnake+string+session%2C+get+it+from+https%3A%2F%2Freplit.com%2F%40butthx%2FTgSnakeGenerateSessions+don%27t+forget+to+login+as+bot.&API_HASHDesc=Your+api+hash%2C+get+it+from+my.telegram.org+&API_IDDesc=Your+api+id%2C+get+it+from+my.telegram.org+&MONGODB_URIDesc=Your+mongodb+URI&referralCode=yBcg2F)

</center>
---
<center>

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/butthx)

</center>