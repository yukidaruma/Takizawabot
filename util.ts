import { format } from "date-fns";
import { TWEET_DATE_FORMAT } from "./constants";

export const lastDataKeys = ["bio", "banner", "location", "website"] as const;
export type DataKeyType = typeof lastDataKeys[number];
export type DataType = Record<DataKeyType, string | null>;
export type LastDataType = Partial<DataType>;

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

const names = {
  banner: "ヘッダー画像",
  location: "プロフィールの位置情報",
  website: "プロフィールのウェブサイトURL",
} as const;
export const composeTweet = (key: DataKeyType, value: string) => {
  switch (key) {
    case "banner":
    case "location":
    case "website":
      return `${names[key]}の更新を検知しました。\n\n新しい値: ${value}`;
    case "bio":
      return format(new Date(), TWEET_DATE_FORMAT) + "\n" + value;
  }
};
