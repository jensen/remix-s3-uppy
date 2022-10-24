import type { ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();

  /* This is the handler for the `upload-success` callback.
     Any values sent using the fetch, will need to be added 
     and validated here. */
  const filename = body.get("filename");
  const url = body.get("url");
  const key = body.get("key");

  if (!filename || !url || !key) {
    throw new Response("Bad request", { status: 400 });
  }

  /* able to write these values to the db */
  console.log("Successful upload");
  console.log("filename: ", filename);
  console.log("url: ", url);
  console.log("key: ", key);

  return new Response(null, { status: 201 });
};
