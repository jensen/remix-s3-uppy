import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { listParts } from "~/services/storage.server";
import type { Part } from "~/services/storage.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const query = new URL(request.url).searchParams;

  const { uploadId } = params;
  const key = query.get("key");

  if (!key || !uploadId) {
    return new Response(null, { status: 404 });
  }

  const list = async (start = "0", parts: Part[] = []): Promise<Part[]> => {
    const { Parts, NextPartNumberMarker, IsTruncated } = await listParts(
      key,
      uploadId,
      String(start)
    );

    if (IsTruncated && NextPartNumberMarker) {
      return await list(NextPartNumberMarker, parts.concat(Parts || []));
    }

    return parts.concat(Parts || []);
  };

  return json(await list());
};
