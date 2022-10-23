import type { PresignedPostOptions } from "@aws-sdk/s3-presigned-post";

const restrictions = ["audio/*"];

export const getRestrictions = () => {
  return {
    uppy: restrictions,
    conditions: restrictions.map((mime) => {
      return [
        "starts-with",
        "$Content-Type",
        mime.substring(0, mime.length - 1),
      ];
    }) as Exclude<PresignedPostOptions["Conditions"], undefined>,
  };
};
