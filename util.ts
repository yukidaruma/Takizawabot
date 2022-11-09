import { format } from "date-fns";
import { TWEET_DATE_FORMAT } from "./constants";

export type DataKeyType = "bio" | "banner";
export type LastDataType = Record<DataKeyType, string | null>;

export const truncateTweet = (tweet: string): [boolean, string] => {
  let truncated = false;
  const MAX_TWEET_LENGTH = 140;
  const ellipsis = "...";
  if (tweet.length > MAX_TWEET_LENGTH) {
    truncated = true;
    tweet = tweet.substring(0, MAX_TWEET_LENGTH - ellipsis.length) + ellipsis;
  }

  return [truncated, tweet];
};

export const composeTweet = (key: DataKeyType, value: string) => {
  switch (key) {
    case "banner":
      return `[自動] ヘッダー画像の変更を検知しました。\n${value}`;
    case "bio":
      return format(new Date(), TWEET_DATE_FORMAT) + "\n" + value;
  }
};
