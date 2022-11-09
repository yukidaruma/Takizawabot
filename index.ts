import { readFile, writeFile } from "fs/promises";
import { TwitterApi } from "twitter-api-v2";
import { schedule } from "node-cron";
import { format } from "date-fns";

import { DATA_FILE, TARGET_USER_ID, TWEET_DATE_FORMAT } from "./constants";

const client = new TwitterApi({
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
});

const log = (...args: any[]) => {
  console.log(new Date(), ...args);
};

type LastDataType = Record<"bio", string | null>;
let lastData: LastDataType = {
  bio: null,
};
const main = async () => {
  lastData = await readFile(DATA_FILE)
    .catch(() => null)
    .then((content) => {
      if (content) {
        try {
          return JSON.parse(content) as LastDataType;
        } catch {
          // no-op
        }
      }
      return { bio: null };
    });

  bot();
  schedule("* * * * *", bot);
};

const sendTweet = async (tweet: string) => {
  log(`Sending a Tweet: ${JSON.stringify(tweet)}`);

  if (process.env.NO_TWEET) {
    log("Skipped tweeting because process.env.NO_TWEET is set.");
    return false;
  } else {
    await client.v2.tweet(tweet);
    log("Successfully sent a Tweet.");
    return true;
  }
};

const bot = async () => {
  try {
    log("Fetching bio...");
    const bio = await fetchBio();

    if (lastData.bio === bio) {
      log("No bio update found. Skipping.");
      return;
    }

    log("Detected bio update.");

    if (lastData.bio === null) {
      log("Skipped tweeting bio because no last data was set.");
    } else {
      const maxTweetLen = 140 - (TWEET_DATE_FORMAT.length + 1); // The last 1 stands for space between timestamp and bio
      const ellipsis = "...";
      let tweet =
        bio.length > maxTweetLen
          ? bio.substring(0, maxTweetLen - ellipsis.length) + ellipsis
          : bio;
      tweet = format(new Date(), TWEET_DATE_FORMAT) + "\n" + tweet;
      await sendTweet(tweet);
    }

    lastData.bio = bio;
    await writeFile(DATA_FILE, JSON.stringify(lastData));

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
