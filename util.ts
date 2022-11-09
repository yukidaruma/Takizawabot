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
