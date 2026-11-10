const mineflayer = require('mineflayer');
const express = require('express');

// Express server for the Render web service health check.
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft Bot is active and running!');
});

app.listen(PORT, () => {
  console.log(`Keep-alive web server listening on port ${PORT}`);
});

// Configure credentials in Render's environment variables; never commit passwords.
const ACCOUNT_PASSWORD = process.env.ACCOUNT_PASSWORD;
const HOST = process.env.MINECRAFT_HOST || 'mc.cwresports.lk';
const SERVER_PORT = Number(process.env.MINECRAFT_PORT || 25565);
const USERNAME = process.env.MINECRAFT_USERNAME || 'guavafahh';

if (!ACCOUNT_PASSWORD) {
  console.error('Missing required environment variable: ACCOUNT_PASSWORD');
  process.exit(1);
}

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: SERVER_PORT,
    username: USERNAME,
    auth: 'offline'
  });

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let hasLoggedIn = false;

  bot.on('spawn', async () => {
    if (hasLoggedIn) {
      console.log('Bot respawned/changed dimension. Skipping auth sequence.');
      return;
    }

    console.log(`${bot.username} spawned in ${HOST}.`);
    console.log('Waiting 5 seconds before executing commands...');

    await sleep(5000);

    console.log('Sending /register command...');
    bot.chat(`/register ${ACCOUNT_PASSWORD} ${ACCOUNT_PASSWORD}`);
    await sleep(1500);

    console.log('Sending /login command...');
    bot.chat(`/login ${ACCOUNT_PASSWORD}`);
    await sleep(2000);

    hasLoggedIn = true;

    console.log('Sending /lifesteal command...');
    bot.chat('/lifesteal');
    await sleep(3000);

    console.log('Sending /afk command...');
    bot.chat('/afk');
    console.log('All setup commands executed successfully.');
  });

  bot.on('end', (reason) => {
    console.log(`Bot disconnected: ${reason}. Reconnecting in 5 seconds...`);
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
  });
}

createBot();
