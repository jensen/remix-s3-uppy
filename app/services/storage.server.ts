import {
  S3Client,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getRestrictions } from "~/utils/restrictions";

export type { Part } from "@aws-sdk/client-s3";

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

export const listMultipartUploads = () => {
  return createClient().send(new ListMultipartUploadsCommand(commandConfig));
};

export const listParts = (
  key: string,
  uploadId: string,
  partNumberMarker: string
) => {
  return createClient().send(
    new ListPartsCommand({
      ...commandConfig,
      Key: key,
      UploadId: uploadId,
      PartNumberMarker: partNumberMarker,
    })
  );
};

export const createMultipartUpload = (
  key: string
): Promise<{ Key: string; UploadId: string }> => {
  return createClient().send(
    new CreateMultipartUploadCommand({
      ...commandConfig,
      Key: key,
    })
  ) as Promise<{ Key: string; UploadId: string }>;
};

export const prepareUploadParts = (
  key: string,
  uploadId: string,
  parts: number[]
) => {
  const client = createClient();

  return Promise.all(
    parts.map((number) =>
      getSignedUrl(
        client,
        new UploadPartCommand({
          ...commandConfig,
          Key: key,
          UploadId: uploadId,
          PartNumber: number,
        }),
        { expiresIn: 3600 }
      )
    )
  );
};

export const completeMultipartUpload = (
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
) => {
  return createClient().send(
    new CompleteMultipartUploadCommand({
      ...commandConfig,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    })
  );
};

export const abortMultipartUpload = (key: string, uploadId: string) => {
  return createClient().send(
    new AbortMultipartUploadCommand({
      ...commandConfig,
      Key: key,
      UploadId: uploadId,
    })
  );
};
