import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import DragDrop from "@uppy/drag-drop";
import AwsS3 from "@uppy/aws-s3";

import type { LinksFunction } from "@remix-run/node";

import uppyCoreStyles from "@uppy/core/dist/style.css";
import uppyDragDropStyles from "@uppy/drag-drop/dist/style.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: uppyCoreStyles },
  { rel: "stylesheet", href: uppyDragDropStyles },
];

export default function Index() {
  const uppy = useRef<Uppy | null>(null);

  useEffect(() => {
    if (uppy.current === null) {
      uppy.current = new Uppy({ autoProceed: true })
        .use(DragDrop, {
          target: "#dropzone",
        })

        .use(AwsS3, {
          companionUrl: "/api/companion",
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
      </div>
    </div>
  );
}
