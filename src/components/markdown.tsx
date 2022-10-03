import clsx from "clsx";
import type * as Hast from "hast";
import {
  AnchorHTMLAttributes,
  Children,
  CSSProperties,
  FC,
  Fragment,
  HTMLAttributes,
  createElement,
  isValidElement,
  memo,
} from "react";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import { CodeBlock } from "./code-block";
import { CodeSandboxEmbed, CodeSandboxEmbedProps } from "./code-sandbox-embed";
import { ImageFigure, ImageFigureProps } from "./image-figure";
import { TweetEmbed, TweetEmbedProps } from "./twitter-embed";
import { WebpageEmbed, WebpageEmbedProps } from "./webpage-embed";
import { YoutubeEmbed, YoutubeEmbedProps } from "./youtube-embed";
import classes from "./markdown.module.css";

const MarkdownH1: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h1 id={id?.substring(0, 8)} className={classes.h1}>
      {children}
    </h1>
  );
};

const MarkdownH2: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h2 id={id?.substring(0, 8)} className={classes.h2}>
      {children}
    </h2>
  );
};

const MarkdownH3: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h3 id={id?.substring(0, 8)} className={classes.h3}>
      {children}
    </h3>
  );
};

const MarkdownH4: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h4 id={id?.substring(0, 8)} className={classes.h4}>
      {children}
    </h4>
  );
};

const MarkdownH5: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h5 id={id?.substring(0, 8)} className={classes.h5}>
      {children}
    </h5>
  );
};

const MarkdownH6: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  id,
  children,
}) => {
  return (
    <h6 id={id?.substring(0, 8)} className={classes.h6}>
      {children}
    </h6>
  );
};

const MarkdownCodeBlock: FC<HTMLAttributes<HTMLPreElement>> = ({
  children,
  ...props
}) => {
  if (Children.count(children) === 1) {
    const child = Children.toArray(children)[0];

    if (isValidElement(child) && Children.count(child.props.children) === 1) {
      const grandChild = Children.toArray(child.props.children)[0];

      if (typeof grandChild === "string") {
        return (
          <CodeBlock
            code={grandChild}
            language={child.props.language as any}
            className={classes["code-block"]}
            {...props}
          />
        );
      }
    }
  }

  return <pre {...props}>{children}</pre>;
};

const MarkdownBlockquote: FC<HTMLAttributes<HTMLQuoteElement>> = ({
  children,
}) => {
  return <blockquote className={classes.blockquote}>{children}</blockquote>;
};

const MarkdownTable: FC<HTMLAttributes<HTMLTableElement>> = ({ children }) => {
  return (
    <div className={classes.table}>
      <table>{children}</table>
    </div>
  );
};

const MarkdownUList: FC<HTMLAttributes<HTMLUListElement>> = ({ children }) => {
  return <ul className={classes.ul}>{children}</ul>;
};

const MarkdownOList: FC<HTMLAttributes<HTMLOListElement>> = ({ children }) => {
  return <ol className={classes.ol}>{children}</ol>;
};

const MarkdownListItem: FC<HTMLAttributes<HTMLLIElement>> = ({ children }) => {
  return <li className={classes.li}>{children}</li>;
};

const MarkdownParagraph: FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
}) => {
  return <p className={classes.p}>{children}</p>;
};

const MarkdownHr: FC<HTMLAttributes<HTMLHRElement>> = () => {
  return <hr className={classes.hr} />;
};

const MarkdownAnchor: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  children,
}) => {
  return (
    <a href={href} className={classes.a}>
      {children}
    </a>
  );
};

const MarkdownStrong: FC<HTMLAttributes<HTMLElement>> = ({ children }) => {
  return <strong className={classes.strong}>{children}</strong>;
};

const MarkdownEmphasize: FC<HTMLAttributes<HTMLElement>> = ({ children }) => {
  return <em className={classes.em}>{children}</em>;
};

const MarkdownCode: FC<HTMLAttributes<HTMLElement>> = ({ children }) => {
  return <code className={classes.code}>{children}</code>;
};

const MarkdownImageFigure: FC<ImageFigureProps> = ({
  src,
  caption,
  width,
  height,
}) => {
  return (
    <ImageFigure
      src={src}
      caption={caption}
      width={width}
      height={height}
      className={classes["image-figure"]}
    />
  );
};

const MarkdownWebpageEmbed: FC<WebpageEmbedProps> = ({
  href,
  title,
  description,
  imageSrc,
}) => {
  return (
    <WebpageEmbed
      href={href}
      title={title}
      description={description}
      imageSrc={imageSrc}
      className={classes["webpage-embed"]}
    />
  );
};

const MarkdownTweetEmbed: FC<TweetEmbedProps> = ({ tweetId }) => {
  return <TweetEmbed tweetId={tweetId} className={classes["tweet-embed"]} />;
};

const MarkdownYoutubeEmbed: FC<YoutubeEmbedProps> = ({ videoId }) => {
  return (
    <YoutubeEmbed videoId={videoId} className={classes["youtube-embed"]} />
  );
};

const MarkdownCodeSandboxEmbed: FC<CodeSandboxEmbedProps> = ({ src }) => {
  return (
    <CodeSandboxEmbed
      src={src}
      view="preview"
      className={classes["code-sandbox-embed"]}
    />
  );
};

const components = {
  h1: MarkdownH1,
  h2: MarkdownH2,
  h3: MarkdownH3,
  h4: MarkdownH4,
  h5: MarkdownH5,
  h6: MarkdownH6,
  pre: MarkdownCodeBlock,
  table: MarkdownTable,
  blockquote: MarkdownBlockquote,
  ul: MarkdownUList,
  ol: MarkdownOList,
  li: MarkdownListItem,
  p: MarkdownParagraph,
  hr: MarkdownHr,
  a: MarkdownAnchor,
  strong: MarkdownStrong,
  em: MarkdownEmphasize,
  code: MarkdownCode,
  "image-figure": MarkdownImageFigure,
  "webpage-embed": MarkdownWebpageEmbed,
  "tweet-embed": MarkdownTweetEmbed,
  "youtube-embed": MarkdownYoutubeEmbed,
  "code-sandbox-embed": MarkdownCodeSandboxEmbed,
};

export interface MarkdownProps {
  source: Hast.Root;
  className?: string;
  style?: CSSProperties;
}

export const Markdown = memo<MarkdownProps>(
  ({ source, className, ...props }) => {
    const processor = unified().use(rehypeReact, {
      createElement,
      Fragment,
      components: components as any,
    });
    const element = processor.stringify(source);

    return (
      <div className={clsx(classes.root, className)} {...props}>
        {element}
      </div>
    );
  }
);

Markdown.displayName = "Markdown";
