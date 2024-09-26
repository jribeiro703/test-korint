import { createClient } from "@hey-api/client-fetch";

export const client = createClient({
  baseUrl: "https://api.spaceflightnewsapi.net",
  querySerializer: {
    object: { style: "form", explode: true },
  },
});
