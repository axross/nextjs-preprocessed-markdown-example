import clsx from "clsx";
import { CSSProperties, FC } from "react";
import classes from "./youtube-embed.module.css";

export interface YoutubeEmbedProps {
  videoId: string;
  className?: string;
  style?: CSSProperties;
}

export const YoutubeEmbed: FC<YoutubeEmbedProps> = ({
  videoId,
  className,
  ...props
}) => {
  return (
    <div className={clsx(classes.root, className)} {...props}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded YouTube video"
        className={classes.iframe}
      />
    </div>
  );
};
