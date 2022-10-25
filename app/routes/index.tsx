import { useState, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import Uppy from "@uppy/core";
import DragDrop from "@uppy/drag-drop";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import StatusBar from "@uppy/status-bar";
import { getRestrictions } from "~/utils/restrictions";

import type { LinksFunction } from "@remix-run/node";

import uppyCoreStyles from "@uppy/core/dist/style.css";
import uppyDragDropStyles from "@uppy/drag-drop/dist/style.css";
import uppyStatusBarStyles from "@uppy/status-bar/dist/style.css";
import { FileRenamePlugin, CheckResumePlugin } from "~/utils/file";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: uppyCoreStyles },
  { rel: "stylesheet", href: uppyDragDropStyles },
  { rel: "stylesheet", href: uppyStatusBarStyles },
];

export default function Index() {
  const uppy = useRef<Uppy | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { submit } = useFetcher();

  useEffect(() => {
    if (uppy.current === null) {
      const instance = new Uppy({
        restrictions: {
          allowedFileTypes: getRestrictions().uppy,
        },
      })
        .use(FileRenamePlugin)
        .use(DragDrop, {
          target: "#dropzone",
        })
        .use(StatusBar, {
          target: "#progress",
          hideAfterFinish: false,
        })
        .use(AwsS3Multipart, {
          companionUrl: "/api/companion",
        })
        .use(CheckResumePlugin)
        .on("upload-success", (file, response) => {
          const url = response.uploadURL;
          const filename = (file?.data as File).name;
          const key = file?.meta.key as string;

          if (url && filename && key) {
            /* This request is handled by remix api
               any of the values sent here can be
               used to insert meta data into the db */
            submit(
              { url, filename, key },
              { method: "post", action: "/api/complete" }
            );

            setFiles((prev) => [...prev, filename]);
          }
        })
        .on("restriction-failed", (file, error) => {
          if (file && error) {
            setErrors((prev) => [
              ...prev,
              `${
                file.name
              } could not be uploaded. Must be of type: ${getRestrictions().allowed.join(
                ", "
              )}`,
            ]);
          }
        });

      uppy.current = instance;

      return () => {
        instance.close({ reason: "unmount" });
        uppy.current = null;
      };
    }
  }, [submit]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "65ch" }}>
        <div id="dropzone" style={{ marginBottom: "1rem" }}></div>
        {errors.length > 0 && (
          <>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <button onClick={() => setErrors([])}>Clear</button>
          </>
        )}
        <div id="progress"></div>
        <ul>
          {files.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
