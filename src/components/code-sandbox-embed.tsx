import clsx from "clsx";
import { CSSProperties, FC } from "react";
import classes from "./code-sandbox-embed.module.css";

export interface CodeSandboxEmbedProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  view?: CodeSandboxView;
  navigationHidden?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type CodeSandboxView = "code" | "preview";

export const CodeSandboxEmbed: FC<CodeSandboxEmbedProps> = ({
  src,
  view,
  className,
  ...props
}) => {
  const srcUrl = new URL(src);
  srcUrl.searchParams.set("fontsize", "14");
  srcUrl.searchParams.set("hidenavigation", "1");
  srcUrl.searchParams.delete("view");

  if (view === "code") {
    srcUrl.searchParams.set("view", "editor");
  }

  if (view === "preview") {
    srcUrl.searchParams.set("view", "preview");
  }

  const title = srcUrl.pathname.split("/")[1];

  return (
    <div className={clsx(classes.root, className)} {...props}>
      <iframe
        src={srcUrl.toString()}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        className={classes.iframe}
      />
    </div>
  );
};
