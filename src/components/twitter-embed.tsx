import clsx from "clsx";
import { CSSProperties, FC, useEffect, useState } from "react";
import { Tweet } from "react-twitter-widgets";
import classes from "./twitter-embed.module.css";

export interface TweetEmbedProps {
  tweetId: string;
  className?: string;
  style?: CSSProperties;
}

export const TweetEmbed: FC<TweetEmbedProps> = ({
  tweetId,
  className,
  ...props
}) => {
  const [theme, setTheme] = useState(
    typeof globalThis.matchMedia === "function"
      ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : "light"
  );

  useEffect(() => {
    globalThis
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        setTheme(e.matches ? "dark" : "light");
      });
  }, []);

  return (
    <div className={clsx(classes.root, className)} {...props}>
      <Tweet tweetId={tweetId} options={{ theme }} />
    </div>
  );
};
