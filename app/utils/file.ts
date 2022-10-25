import { BasePlugin } from "@uppy/core";
import type { Uppy, UppyFile, UppyOptions } from "@uppy/core";
import type { MultipartUpload } from "@aws-sdk/client-s3";

export const getFileExtension = (name: string) => {
  const index = name.lastIndexOf(".");

  if (index === -1) {
    throw new Error("Could not determine file extension");
  }

  return name.slice(index + 1);
};

export const generateUniqueFileId = (file: File) => {
  let id = "";

  if (typeof file.name === "string") {
    id += file.name.replace(/[^A-Z0-9]/gi, "-").toLowerCase();
  }

  if (file.type !== undefined) {
    id += `-${file.type}`;
  }

  if (file.size !== undefined) {
    id += `-${file.size}`;
  }

  if (file.lastModified !== undefined) {
    id += `-${file.lastModified}`;
  }

  return id;
};

export const encodeHash = async (file: File) => {
  const data = new TextEncoder().encode(generateUniqueFileId(file));
  const hash = await crypto.subtle.digest("sha-1", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => {
      const hex = b.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("");
};

export const generateFilename = async (file: File) => {
  const hash = await encodeHash(file);

  return `${hash}.${getFileExtension(file.name)}`;
};

export class FileRenamePlugin extends BasePlugin {
  constructor(uppy: Uppy, opts?: UppyOptions) {
    super(uppy, opts);
    this.id = "file-rename";
    this.type = "custom";
    this.uppy = uppy;
  }

  prepareUpload = async (ids: string[]) => {
    const names = await Promise.all(
      ids.map((id) => {
        const file = this.uppy.getFile(id);
        const data = file.data as File;

        return generateFilename(data);
      })
    );

    names.forEach((name, index) => {
      const id = ids[index];
      const file = this.uppy.getFile(id);

      this.uppy.setFileState(id, {
        name,
        meta: {
          ...file.meta,
          name,
        },
      });
    });
  };

  install() {
    this.uppy.addPreProcessor(this.prepareUpload);
  }

  uninstall() {
    this.uppy.removePreProcessor(this.prepareUpload);
  }
}

export class CheckResumePlugin extends BasePlugin {
  constructor(uppy: Uppy, opts?: UppyOptions) {
    super(uppy, opts);
    this.id = "check-resume";
    this.type = "custom";
    this.uppy = uppy;
  }

  prepareUpload = async (ids: string[]) => {
    const existing: MultipartUpload[] = await fetch(
      "/api/companion/s3/multipart"
    ).then((response) => response.json());

    const indexed = existing.reduce((record, upload) => {
      if (upload.Key) {
        record[upload.Key] = upload;
      }

      return record;
    }, {} as Record<string, MultipartUpload>);

    for (const id of ids) {
      const file = this.uppy.getFile(id) as UppyFile & {
        s3Multipart: { uploadId: string; key: string };
      };

      const uploadId = indexed[file.name]?.UploadId;

      if (uploadId) {
        this.uppy.setFileState(id, {
          s3Multipart: {
            ...file.s3Multipart,
            uploadId,
            key: file.name,
          },
        });
      } else {
        this.uppy.setFileState(id, {
          s3Multipart: {
            ...file.s3Multipart,
            key: file.name,
          },
        });
      }
    }
  };

  install() {
    this.uppy.addPreProcessor(this.prepareUpload);
  }

  uninstall() {
    this.uppy.removePreProcessor(this.prepareUpload);
  }
}
