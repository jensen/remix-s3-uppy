import { useState, useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import DragDrop from "@uppy/drag-drop";
import AwsS3 from "@uppy/aws-s3";
import StatusBar from "@uppy/status-bar";

import type { LinksFunction } from "@remix-run/node";

import uppyCoreStyles from "@uppy/core/dist/style.css";
import uppyDragDropStyles from "@uppy/drag-drop/dist/style.css";
import uppyStatusBarStyles from "@uppy/status-bar/dist/style.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: uppyCoreStyles },
  { rel: "stylesheet", href: uppyDragDropStyles },
  { rel: "stylesheet", href: uppyStatusBarStyles },
];

export default function Index() {
  const uppy = useRef<Uppy | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (uppy.current === null) {
      uppy.current = new Uppy()
        .use(DragDrop, {
          target: "#dropzone",
        })
        .use(StatusBar, {
          target: "#progress",
          hideAfterFinish: false,
        })
        .use(AwsS3, {
          companionUrl: "/api/companion",
        })
        .on("upload-success", (file, response) => {
          const name = file?.name;

          if (name) {
            setFiles((prev) => [...prev, name]);
          }
        });
    }
  }, []);

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
