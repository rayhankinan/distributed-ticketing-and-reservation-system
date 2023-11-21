import { MongoClient } from "npm:mongodb";

export const mongoClient = new MongoClient(
  `mongodb://${Deno.env.get("MONGO_HOST")}:${Deno.env.get("MONGO_PORT")}`
);

(async () => {
  await mongoClient.connect();
})();
