import type * as Hast from "hast";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Markdown } from "../components/markdown";
import { TableOfContents } from "../components/table-of-contents";
import { getPreprocessedMarkdown } from "../services/markdown";

interface IndexPageProps {
  title: string;
  rehypedRoot: Hast.Root;
  outline: { id: string; depth: number; label: string }[];
}

const IndexPage: NextPage<IndexPageProps> = ({
  title,
  rehypedRoot,
  outline,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <h1 className="title">{title}</h1>

      <TableOfContents outline={outline} />

      <Markdown source={rehypedRoot} />
    </>
  );
};

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  const { title, rehypedRoot, outline } = await getPreprocessedMarkdown();

  return {
    props: { title, rehypedRoot, outline },
  };
};

export default IndexPage;
