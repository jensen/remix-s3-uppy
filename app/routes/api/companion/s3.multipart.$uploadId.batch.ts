import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prepareUploadParts } from "~/services/storage.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uploadId } = params;
  const query = new URL(request.url).searchParams;

  const key = query.get("key");
  const partNumbers = query.get("partNumbers");

  if (!uploadId || !key || !partNumbers) {
    throw new Response(null, { status: 404 });
  }

  const parts = partNumbers.split(",").map(Number);

  const urls = await prepareUploadParts(key, uploadId, parts);

  const presignedUrls = urls.reduce((urls, url, index) => {
    urls[parts[index]] = url;
    return urls;
  }, {} as { [key: string]: string });

  return json({
    presignedUrls,
  });
};
