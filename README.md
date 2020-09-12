# tstick-dl
Google Cloud function microservice that lets you download a Telegram sticker pack as a zip file.

### Usage

1. Deploy from `main` branch with `entry` as the entry function. The downloading process requires a Telegram bot account, simply provide your bot token as env. variable`TELEGRAM_BOT_TOKEN`. 
2. Send a GET request to the cloud function endpoint with parameter `name` which represents the name/id of the Telegram sticker pack (for example `riley` from `telegram.me/addstickers/riley`).
3. Wait a few seconds, eventually you will get the sticker pack in a zip format. 

#### Dev. Env
Clone the repository and start the local cloud functions framework:
```
git clone https://github.com/Weilbyte/tstick-dl
cd tstick-dl
yarn start
``` 

The function should now be up at `127.0.0.1:8080/` 

