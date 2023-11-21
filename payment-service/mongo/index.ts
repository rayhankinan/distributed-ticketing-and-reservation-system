import { MongoClient } from "npm:mongodb";

const url = `mongodb://${Deno.env.get("MONGO_HOST")}:${Deno.env.get(
  "MONGO_PORT"
)}`;
export const mongoClient = new MongoClient(url);

(async () => {
  await mongoClient.connect();
})();
