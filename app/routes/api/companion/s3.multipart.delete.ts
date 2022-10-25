import { redirect } from "@remix-run/node";

import {
  listMultipartUploads,
  abortMultipartUpload,
} from "~/services/storage.server";

export const loader = async () => {
  const { Uploads } = await listMultipartUploads();

  if (Uploads) {
    await Promise.all(
      Uploads?.map((upload) => {
        if (upload.Key && upload.UploadId) {
          return abortMultipartUpload(upload.Key, upload.UploadId);
        }

        return Promise.resolve(null);
      })
    );
  }

  return redirect("/");
};
