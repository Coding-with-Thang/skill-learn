import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("tic-tac-toe");
    const history = database.collection("game-history");

    if (req.method === "GET") {
      const currentHistory = (await history.findOne({})) || {
        xWins: 0,
        oWins: 0,
        draws: 0,
      };
      res.status(200).json(currentHistory);
    } else if (req.method === "POST") {
      const { result } = req.body;
      const update = {};

      if (result === "X") update.$inc = { xWins: 1 };
      else if (result === "O") update.$inc = { oWins: 1 };
      else if (result === "draw") update.$inc = { draws: 1 };

      const currentHistory = await history.findOneAndUpdate({}, update, {
        upsert: true,
        returnDocument: "after",
      });

      res.status(200).json(currentHistory);
    }
  } catch (error) {
    res.status(500).json({ error: "Error connecting to database" });
  } finally {
    await client.close();
  }
}
