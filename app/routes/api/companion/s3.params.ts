import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUploadParameters } from "~/services/storage.server";
import { handleOptions } from "~/utils/request";

export const loader = async ({ request }: LoaderArgs) => {
  handleOptions(request, ["OPTIONS", "POST"]);

  const query = new URL(request.url).searchParams;

  const filename = query.get("filename");
  const type = query.get("type");

  if (!filename || !type) {
    throw new Response(null, { status: 404 });
  }

  return json(await getUploadParameters(filename, type));
};
