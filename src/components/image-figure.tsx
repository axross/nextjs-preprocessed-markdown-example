import clsx from "clsx";
import Image from "next/image";
import { CSSProperties, FC } from "react";
import classes from "./image-figure.module.css";

export interface ImageFigureProps {
  src: string;
  caption: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export const ImageFigure: FC<ImageFigureProps> = ({
  src,
  caption,
  width,
  height,
  className,
  ...props
}) => {
  return (
    <figure className={clsx(classes.root, className)} {...props}>
      <div className={classes.image}>
        <Image src={src} alt={caption} width={width} height={height} />
      </div>

      <figcaption className={classes.caption}>{caption}</figcaption>
    </figure>
  );
};

ImageFigure.displayName = "ImageFigure";
