import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { completeMultipartUpload } from "~/services/storage.server";

export const action = async ({ request, params }: ActionArgs) => {
  const query = new URL(request.url).searchParams;
  const body = await request.json();

  const { uploadId } = params;
  const key = query.get("key");
  const { parts } = body;

  if (!uploadId || !key || !parts) {
    throw new Response(null, { status: 404 });
  }

  const completed = await completeMultipartUpload(key, uploadId, parts);

  return json({
    location: completed.Location,
  });
};
