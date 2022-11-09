import { readFile, writeFile } from "fs/promises";
import { TwitterApi } from "twitter-api-v2";
import { schedule } from "node-cron";

import { DATA_FILE, TARGET_USER_ID } from "./constants";
import {
  composeTweet,
  DataType,
  lastDataKeys,
  LastDataType,
  truncateTweet,
} from "./util";

const client = new TwitterApi({
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
});

const log = (...args: any[]) => {
  console.log(new Date(), ...args);
};

let lastData: LastDataType = {};
const main = async () => {
  try {
    const content = await readFile(DATA_FILE);
    lastData = JSON.parse(content.toString()) as unknown as LastDataType;
  } catch (e) {
    log(e);
  }

  bot();
  schedule("* * * * *", bot);
};

const sendTweet = async (rawStatus: string, image?: Buffer) => {
  log(`Sending a Tweet: ${JSON.stringify(rawStatus)}`);
  const [truncated, status] = truncateTweet(rawStatus);
  if (truncated) {
    log(`Tweet was truncated. ${JSON.stringify(status)}`);
  }

  if (process.env.NO_TWEET) {
    log("Skipped tweeting because process.env.NO_TWEET is set.");
    return false;
  } else {
    await client.v2.tweet(status);
    log("Successfully sent a Tweet.");
    return true;
  }
};

const bot = async () => {
  try {
    log("Fetching user data...");
    const userData = await fetchUserData();

    for (const key of lastDataKeys) {
      const value = userData[key];
      if (lastData[key] === value) {
        log(`No ${key} update found. Skipping.`);
        continue;
      }

      if (key in lastData) {
        log(`Detected ${key} update.`);
        const tweet = composeTweet(key, value || "(なし)");
        await sendTweet(tweet);
        log(`Successfully sent a Tweet for ${key} update.`);
      } else {
        log(`Skipped tweeting ${key} because no last data was set.`);
      }

      lastData[key] = value;
    }
    await writeFile(DATA_FILE, JSON.stringify(lastData));

    log("Completed cron job.");
  } catch (e) {
    log("ERROR", e);
  }
};

const v1Client = new TwitterApi({
  accessToken: process.env.V1_ACCESS_TOKEN,
  accessSecret: process.env.V1_ACCESS_SECRET,
  appKey: process.env.V1_APP_KEY,
  appSecret: process.env.V1_APP_SECRET,
}).v1;
const fetchUserData = async () => {
  const user = await v1Client.user({ user_id: TARGET_USER_ID });
  const result: DataType = {
    bio: user.description ?? "",
    banner: user.profile_banner_url,
    location: user.location,
    website: user.url,
  };
  return result;
};

main();
