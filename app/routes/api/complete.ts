import type { ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();

  const name = body.get("name");
  const url = body.get("url");

  if (!name || !url) {
    throw new Response("Bad request", { status: 400 });
  }

  /* able to write these values to the db */
  console.log("Successful upload: ", body.get("name"), body.get("url"));

  return new Response(null, { status: 201 });
};
