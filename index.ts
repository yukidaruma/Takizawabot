import { readFile, writeFile } from "fs/promises";
import { TwitterApi } from "twitter-api-v2";
import { schedule } from "node-cron";

import { BIO_FILE } from "./constants";

const client = new TwitterApi({
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
  appKey: process.env.APP_KEY!,
  appSecret: process.env.APP_SECRET!,
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
    const bio = await fetchBio();
    if (lastBio === bio) {
      log("No bio update found. Skipping.");
      return;
    }

    log("Detected bio update.");

    await writeFile(BIO_FILE, bio);

    if (lastBio !== null) {
      log("Sending a Tweet...");

      await client.v2.tweet(`滝沢秀明さんのプロフィールが変更されました:

旧: ${lastBio}

新: ${bio}`);

      log("Successfully sent a Tweet.");
    }

    lastBio = bio;

    log("Completed cron job.");
  } catch (e) {
    log("ERROR", e);
  }
};

const fetchBio = async () => {
  const user = await client.v2.userByUsername("h_Takizawa329", {
    "user.fields": ["description"],
  });
  return user.data.description!;
};

main();
