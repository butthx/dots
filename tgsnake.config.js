require("dotenv").config();
module.exports = { 
  session : String(process.env.SESSION),
  botToken: String(process.env.BOT_TOKEN),
  tgSnakeLog : true,
  storeSession : true,
  apiId : Number(process.env.API_ID),
  apiHash : String(process.env.API_HASH),
  logger: "debug",
  useWSS : false
};