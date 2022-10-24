import { BasePlugin } from "@uppy/core";
import type { Uppy, UppyOptions } from "@uppy/core";

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
    this.id = "file-renamer";
    this.type = "file-modifier";
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
