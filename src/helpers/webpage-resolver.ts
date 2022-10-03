import * as path from "path";
import { launchChromium } from "playwright-aws-lambda";
import { ChromiumBrowser, Page } from "playwright-core";

export interface Webpage {
  title: string | null;
  description: string | null;
  url: string;
  imageUrl: string | null;
}

export async function resolveWebpage(url: string): Promise<Webpage> {
  let browser!: ChromiumBrowser;
  try {
    browser = await launchChromium({ headless: true });
  } catch (error) {
    throw error;
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);

  const webpage: Webpage = {
    title: await getTitle(page),
    description: await getDescription(page),
    url: (await getUrl(page)) ?? url,
    imageUrl: await getImageUrl(page),
  };

  if (browser) {
    await browser.close();
  }

  return webpage;
}

async function getTitle(page: Page): Promise<string | null> {
  let title = await page.$eval('meta[property="og:title"]', (el) =>
    el.getAttribute("content")
  );

  title ??= await page.$eval("title", (el) => el.textContent);

  return title;
}

async function getDescription(page: Page): Promise<string | null> {
  let description = await page.$eval('meta[property="og:description"]', (el) =>
    el.getAttribute("content")
  );

  description ??= await page.$eval('meta[name="description"]', (el) =>
    el.getAttribute("content")
  );

  return description;
}

async function getUrl(page: Page): Promise<string | null> {
  let url = await page.$eval('meta[property="og:url"]', (el) =>
    el.getAttribute("content")
  );

  return url;
}

async function getImageUrl(page: Page): Promise<string | null> {
  let imageUrl = await page.$eval('meta[property="og:image"]', (el) =>
    el.getAttribute("content")
  );

  if (imageUrl !== null && !/^https:\/\//.test(imageUrl)) {
    const url = await getUrl(page);

    if (url === null) {
      return null;
    }

    if (imageUrl.startsWith("/")) {
      imageUrl = new URL(imageUrl, new URL(url).origin).toString();
    } else {
      imageUrl = path.join(url.toString(), imageUrl);
    }
  }

  return imageUrl;
}
