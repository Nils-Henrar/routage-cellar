import express from "express";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
const app = express();
const port = 3000;

// Lecture de la liste des vins

app.get("/wines", (req, res) => {
  // se connecter au serveur de base de données mongoDB

  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  const dbName = "cellar";
  const collectionName = "wines";

  async function main() {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      console.log("Connected to the database");

      const query = {};
      const options = {
        sort: { name: 1 },
      };

      const wines = await collection.find(query, options).toArray();

      console.log(wines);
      res.json(wines);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error");
    } finally {
      await client.close();
    }
  }
  main().catch(console.error);
});

// Ajoute un commentaire au vin x

app.use(bodyParser.json());

app.post("/wines/:id/comments", (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // se connecter au serveur de base de données mongoDB

  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  const dbName = "cellar";
  const collectionName = "comments";

  async function main() {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      console.log("Connected to the database");

      const lastCommentId = await collection
        .aggregate([
          { $match: { wineId: id } },
          { $group: { _id: null, id: { $max: { $toInt: "$id" } } } },
        ])
        .toArray();

      console.log(lastCommentId);

      let lastId = lastCommentId.length > 0 ? lastCommentId[0].id : 0;

      //le repasser en string
      const newId = (lastId + 1).toString();

      const comment = {
        wineId: id,
        content,
        id: newId,
      };

      const result = await collection.insertOne(comment);

      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error");
    } finally {
      await client.close();
    }
  }
  main().catch(console.error);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Modifie le commentaire x du vin y

app.put("/wines/:wineId/comments/:commentId", (req, res) => {
  const { wineId, commentId } = req.params;
  const { content } = req.body;

  // Connexion à MongoDB
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  const dbName = "cellar";
  const collectionName = "comments";

  async function main() {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      console.log("Connected to the database");

      // Utilisation de "id" pour identifier le commentaire
      const query = { id: commentId, wineId };
      const update = { $set: { content } };

      const result = await collection.updateOne(query, update);

      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error");
    } finally {
      await client.close();
    }
  }

  main().catch(console.error);
});

// Supprime le commentaire x du vin y

app.delete("/wines/:wineId/comments/:commentId", (req, res) => {
  const { wineId, commentId } = req.params;

  // Connexion à MongoDB
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  const dbName = "cellar";
  const collectionName = "comments";

  async function main() {
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      console.log("Connected to the database");

      // Utilisation de "id" pour identifier le commentaire
      const query = { id: commentId, wineId };

      const result = await collection.deleteOne(query);

      console.log(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error");
    } finally {
      await client.close();
    }
  }

  main().catch(console.error);
});
