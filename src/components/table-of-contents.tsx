import clsx from "clsx";
import { CSSProperties, FC, memo, useMemo } from "react";
import classes from "./table-of-contents.module.css";

export interface TableOfContentsProps {
  outline: { id: string; depth: number; label: string }[];
  className?: string;
  style?: CSSProperties;
}

export const TableOfContents = memo<TableOfContentsProps>(
  ({ outline, className, ...props }) => {
    if (outline.length === 0) {
      return null;
    }

    const rootDepth = outline[0].depth - 1;

    return (
      <ul className={clsx(classes.root, className)} {...props}>
        {outline.map(({ id, depth, label }) => (
          <li className={classes.item} data-depth={depth - rootDepth} key={id}>
            <a href={`#${id.substring(0, 8)}`} className={classes.a}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    );
  }
);

TableOfContents.displayName = "TableOfContents";
