import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getRestrictions } from "~/utils/restrictions";

if (!process.env.STORAGE_REGION) {
  throw new Error("Missing environment variable: STORAGE_REGION");
}

if (!process.env.STORAGE_KEY) {
  throw new Error("Missing environment variable: STORAGE_KEY");
}

if (!process.env.STORAGE_SECRET) {
  throw new Error("Missing environment variable: STORAGE_SECRET");
}

if (!process.env.STORAGE_BUCKET) {
  throw new Error("Missing environment variable: STORAGE_SECRET");
}

const storageConfig = {
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_KEY,
    secretAccessKey: process.env.STORAGE_SECRET,
  },
};

const commandConfig = {
  Bucket: process.env.STORAGE_BUCKET,
};

const createClient = () => {
  return new S3Client(storageConfig);
};

export const getUploadParameters = async (filename: string, type: string) => {
  const client = createClient();

  const { url, fields } = await createPresignedPost(client, {
    ...commandConfig,
    Key: filename,
    Conditions: getRestrictions().conditions,
    Fields: {
      success_action_status: "201",
      "content-type": type,
    },
    Expires: 600,
  });

  return {
    method: "post",
    url,
    fields,
  };
};
