import * as fs from "fs";
import matter from "gray-matter";
import hasha from "hasha";
import type * as Hast from "hast";
import { directiveFromMarkdown } from "mdast-util-directive";
import { toString as mdastToString } from "mdast-util-to-string";
import directiveSyntax from "micromark-extension-directive";
import * as path from "path";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { resolveImageDimension } from "../helpers/image-resolver";
import { resolveWebpage } from "../helpers/webpage-resolver";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkDirective from "remark-directive";

interface PreprocessedMarkdown {
  title: string;
  rehypedRoot: Hast.Root;
  outline: { id: string; depth: number; label: string }[];
}

export async function getPreprocessedMarkdown(): Promise<PreprocessedMarkdown> {
  const source = await fs.promises.readFile(
    path.resolve(process.cwd(), "src/example.md"),
    "utf-8"
  );
  const { content: markdown, data: meta } = matter(source);
  const rehypedRoot = await rehypeMarkdown(markdown);

  return {
    title: meta.title,
    rehypedRoot,
    outline: generateOutline(rehypedRoot),
  };
}

export async function rehypeMarkdown(markdown: string): Promise<Hast.Root> {
  const processor = unified()
    .data("micromarkExtensions", [directiveSyntax])
    .data("fromMarkdownExtensions", [directiveFromMarkdown])
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkGfm)
    .use(remarkHeadingId)
    .use(remarkCodeBlockLanguage)
    .use(remarkImageFigure)
    .use(remarkEmbed)
    .use(remarkEmbedType)
    .use(remarkExternalResource)
    .use(remarkDirectiveRehype)
    .use(remarkRehype);

  return (await processor.run(processor.parse(markdown))) as Hast.Root;
}

export function generateOutline(
  node: Hast.Root
): { id: string; depth: number; label: string }[] {
  const processor = unified().use(rehypeOutline);

  return processor.stringify(node) as any;
}

const remarkHeadingId = (): any => {
  const transformer = (tree: any) => {
    visit(tree, "heading", (node) => {
      const label = mdastToString(node);
      const depth = node.depth;
      const id = hasha(`${label}@${depth}`);

      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = id;
    });
  };

  return transformer;
};

const remarkCodeBlockLanguage = (): any => {
  const transformer = (tree: any) => {
    visit(tree, "code", (node: any) => {
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.language = node.lang;
    });
  };

  return transformer;
};

const remarkImageFigure = (): any => {
  const transformer = (tree: any) => {
    visit(tree, "paragraph", (node: any, index: any, parent: any) => {
      if (node.children)
        if (node?.children.length !== 1) {
          return;
        }

      if (node.children[0]!.type !== "image") {
        return;
      }

      parent!.children.splice(index, 1, {
        type: "leafDirective",
        name: "image-figure",
        attributes: {
          src: node.children[0]!.url,
          caption: node.children[0]!.alt,
        },
      });
    });
  };

  return transformer;
};

const remarkEmbed = (): any => {
  const transformer = (tree: any) => {
    visit(tree, "paragraph", (node: any, index: any, parent: any) => {
      if (node.children.length !== 1) {
        return;
      }

      if (node.children[0]!.type !== "link") {
        return;
      }

      parent!.children.splice(index, 1, {
        type: "leafDirective",
        name: "embed",
        attributes: {
          href: node.children[0]!.url,
          title: mdastToString(node.children[0]!),
        },
      });
    });
  };

  return transformer;
};

const TWEET_REGEX = /^https:\/\/twitter\.com\/[A-Za-z0-9_]+\/status\/([0-9]+)/;

const YOUTUBE_VIDEO_REGEX =
  /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9]{8,16})$/;

const CODE_SANDBOX_REGEX = /^https:\/\/codesandbox\.io\/embed\/[a-z0-9-]+$/;

const remarkEmbedType = (): any => {
  const transformer = (tree: any) => {
    visit(tree, { type: "leafDirective", name: "embed" }, (node: any) => {
      const tweetMatch = TWEET_REGEX.exec(node.attributes.href);

      if (tweetMatch !== null) {
        node.name = "tweet-embed";
        node.attributes.tweetId = tweetMatch[1];

        return;
      }

      const youtubeVideoMatch = YOUTUBE_VIDEO_REGEX.exec(node.attributes.href);

      if (youtubeVideoMatch !== null) {
        node.name = "youtube-embed";
        node.attributes.videoId = youtubeVideoMatch[1];

        return;
      }

      const codeSandboxMatch = CODE_SANDBOX_REGEX.exec(node.attributes.href);

      if (codeSandboxMatch !== null) {
        node.name = "code-sandbox-embed";
        node.attributes.src = codeSandboxMatch[0];

        return;
      }

      node.name = "webpage-embed";
    });
  };

  return transformer;
};

const remarkExternalResource = (): any => {
  const transformer = async (tree: any) => {
    const targetNodes: Node[] = [];

    visit(
      tree,
      [
        { type: "leafDirective", name: "image-figure" },
        { type: "leafDirective", name: "webpage-embed" },
      ],
      (node: any) => {
        targetNodes.push(node);
      }
    );

    await Promise.all(
      targetNodes.map(async (node: any) => {
        const attributes = node.attributes as any;

        switch (node.name) {
          case "image-figure":
            if (
              (attributes as any).width !== undefined &&
              (attributes as any).height !== undefined
            ) {
              return;
            }

            const dimension = await resolveImageDimension(attributes.src);

            if (dimension) {
              const [width, height] = dimension;

              (attributes as any).width = `${width}`;
              (attributes as any).height = `${height}`;
            }

            break;
          case "webpage-embed":
            const url = attributes.href as string;
            const webpage = await resolveWebpage(url);

            attributes.href = webpage.url;
            attributes.title = webpage.title;
            attributes.description = webpage.description;
            attributes.imageSrc = webpage.imageUrl;

            break;
        }
      })
    );
  };

  return transformer;
};

function rehypeOutline(this: any): void {
  const compile = (tree: any) => {
    const outline: { id: string; depth: number; label: string }[] = [];

    visit(
      tree,
      [
        { type: "element", tagName: "h1" },
        { type: "element", tagName: "h2" },
        { type: "element", tagName: "h3" },
        { type: "element", tagName: "h4" },
        { type: "element", tagName: "h5" },
        { type: "element", tagName: "h6" },
      ],
      (node: any) => {
        const label = mdastToString(node);
        const depth = parseInt(node.tagName.substring(1));

        outline.push({
          id: node.properties.id,
          depth,
          label,
        });
      }
    );

    return outline as any;
  };

  this.Compiler = compile;
}
