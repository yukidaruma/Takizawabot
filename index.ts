import { readFile, writeFile } from "fs/promises";
import { TwitterApi } from "twitter-api-v2";
import { schedule } from "node-cron";
import { format } from "date-fns";

import { BIO_FILE, TARGET_USER_ID, TWEET_DATE_FORMAT } from "./constants";

const client = new TwitterApi({
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
});

const log = (...args: any[]) => {
  console.log(new Date(), ...args);
};

let lastBio: string | null = null;
const main = async () => {
  lastBio = (await readFile(BIO_FILE).catch(() => null))?.toString() ?? null;

  bot();
  schedule("*/5 * * * *", bot);
};

const bot = async () => {
  try {
    log("Fetching bio...");
    const bio = (await fetchBio()).trim();
    if (lastBio === bio) {
      log("No bio update found. Skipping.");
      return;
    }

    log("Detected bio update.");

    await writeFile(BIO_FILE, bio);

    if (lastBio !== null) {
      const maxTweetLen = 140 - (TWEET_DATE_FORMAT.length + 1); // The last 1 stands for space between timestamp and bio
      const ellipsis = "...";
      let tweet =
        bio.length > maxTweetLen
          ? bio.substring(0, maxTweetLen - ellipsis.length) + ellipsis
          : bio;
      tweet = format(new Date(), TWEET_DATE_FORMAT) + "\n" + tweet;

      log(`Sending a Tweet: ${JSON.stringify(tweet)}`);

      if (process.env.NO_TWEET) {
        log("Skipped tweeting because process.env.NO_TWEET is set.");
      } else {
        await client.v2.tweet(tweet);
        log("Successfully sent a Tweet.");
      }
    }

    lastBio = bio;

    log("Completed cron job.");
  } catch (e) {
    log("ERROR", e);
  }
};

const fetchBio = async () => {
  const user = await client.v2.user(TARGET_USER_ID, {
    "user.fields": ["description"],
  });
  return user.data.description ?? "";
};

main();
