import clsx from "clsx";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import { CSSProperties, FC, useRef, useState } from "react";
import classes from "./code-block.module.css";

export interface CodeBlockProps {
  code: string;
  language?: Language;
  className?: string;
  style?: CSSProperties;
}

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language,
  className,
  ...props
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [isCopied, setCopied] = useState(false);

  return (
    <div
      className={clsx(classes.root, className)}
      data-codelang={language}
      {...props}
    >
      <Highlight
        {...defaultProps}
        code={code}
        language={language ?? "javascript"}
      >
        {({ tokens }) => {
          const elements = [];

          for (const [i, line] of tokens.entries()) {
            elements.push(
              line.map((token, key) => {
                if (token.empty) {
                  return null;
                }

                return (
                  <span
                    className={classes.token}
                    data-tokentype={token.types.join(" ")}
                    key={`${i}-${key}`}
                  >
                    {token.content}
                  </span>
                );
              })
            );

            if (i !== tokens.length - 1) {
              // elements.push(<br key={`${i}-br`} />);
              elements.push(<span key={`${i}-lb`}>{"\n"}</span>);
            }
          }

          return (
            <pre className={classes.block} ref={preRef}>
              {elements}
            </pre>
          );
        }}
      </Highlight>

      <button
        onClick={async (event) => {
          const code = preRef.current!.textContent!;

          const { state } = await globalThis.navigator.permissions.query({
            name: "clipboard-write" as any,
          });

          if (state === "granted" || state === "prompt") {
            globalThis.navigator.clipboard.writeText(code);

            setCopied(true);

            setTimeout(() => {
              setCopied(false);
            }, 3000);
          }
        }}
        className={classes["copy-button"]}
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};
