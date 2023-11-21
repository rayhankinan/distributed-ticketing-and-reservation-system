import { MongoClient } from "npm:mongodb";

export const mongoClient = new MongoClient(
  "mongodb://payment-database.docker-compose:27017"
);

(async () => {
  await mongoClient.connect();
})();
