export const handleOptions = (request: Request, allowed: string[]) => {
  if (request.method === "OPTIONS") {
    throw new Response(null, {
      headers: new Headers({
        Allow: allowed.join(", "),
      }),
      status: 204,
    });
  }
};
