import clsx from "clsx";
import Image from "next/image";
import { CSSProperties, FC } from "react";
import classes from "./webpage-embed.module.css";

export interface WebpageEmbedProps {
  href: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  className?: string;
  style?: CSSProperties;
}

export const WebpageEmbed: FC<WebpageEmbedProps> = ({
  href,
  title,
  description,
  imageSrc,
  className,
  ...props
}) => {
  return (
    <a href={href} className={clsx(classes.root, className)} {...props}>
      {title !== undefined ? (
        <div className={classes.title}>{title}</div>
      ) : null}

      {description !== undefined ? (
        <div className={classes.description}>{description}</div>
      ) : null}

      <div className={classes.url}>{href}</div>

      {imageSrc !== undefined ? (
        <div className={classes.thumbnail}>
          <Image src={imageSrc} alt={title} width={1024} height={1024} />
        </div>
      ) : null}
    </a>
  );
};

WebpageEmbed.displayName = "WebpageEmbed";
