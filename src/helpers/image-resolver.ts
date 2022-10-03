import imageSize from "image-size";

export type ImageDimension = [number, number];

export async function resolveImageDimension(
  url: string
): Promise<[number, number] | null> {
  const response = await fetch(url);
  const { width, height } = imageSize(await (response as any).buffer());

  if (width !== undefined && height !== undefined) {
    return [width, height];
  }

  return null;
}
