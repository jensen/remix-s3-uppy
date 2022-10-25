import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  createMultipartUpload,
  listMultipartUploads,
} from "~/services/storage.server";
import { handleOptions } from "~/utils/request";

export const loader = async ({ request }: LoaderArgs) => {
  handleOptions(request, ["OPTIONS", "POST"]);

  const { Uploads } = await listMultipartUploads();

  if (Uploads) {
    return json(Uploads);
  }

  return json([]);
};

export const action = async ({ request }: ActionArgs) => {
  const body = await request.json();

  const { Uploads } = await listMultipartUploads();

  if (Uploads) {
    const existing = Uploads.find((upload) => upload.Key === body.filename);

    if (existing) {
      return json({
        uploadId: existing.UploadId,
        key: body.filename,
      });
    }
  }

  const upload = await createMultipartUpload(body.filename);

  return json({
    uploadId: upload.UploadId,
    key: upload.Key,
  });
};
