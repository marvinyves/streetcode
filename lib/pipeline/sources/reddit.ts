export type RedditPost = {
  subreddit: string;
  title: string;
  score: number;
};

const SUBREDDITS = ["stocks", "investing", "wallstreetbets"];

async function fetchSubredditTop(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=5&t=day`;
  const res = await fetch(url, {
    headers: { "User-Agent": "market-daily-bot/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit ${subreddit} failed: ${res.status}`);
  const data = await res.json();
  const children = data?.data?.children ?? [];
  return children.map((c: { data: { title: string; score: number } }) => ({
    subreddit,
    title: c.data.title,
    score: c.data.score,
  }));
}

/**
 * Best-effort only, per RFP: Reddit sentiment is illustrative, not a core
 * data source, and must never block the pipeline if unavailable.
 */
export async function fetchRedditSentiment(): Promise<RedditPost[]> {
  const results = await Promise.allSettled(
    SUBREDDITS.map((s) => fetchSubredditTop(s)),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RedditPost[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}
