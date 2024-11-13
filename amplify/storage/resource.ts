import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyReviewsDrive",
  access: (allow) => ({
    'media/*': [
      allow.authenticated.to(['read']) // additional actions such as "write" and "delete" can be specified depending on your use case
    ],
    
    "media/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
