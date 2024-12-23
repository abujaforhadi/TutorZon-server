require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;  

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.006kz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

 function run() {
  try {
     client.connect();
    

    //  client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db("TutorZon");
    const collection = db.collection("languages");
    app.post("/find-tutors", async (req, res) => {
      try {
        const data = await collection.insertOne(req.body);
        res.json(data);
      } catch (error) {
        // console.error("Error inserting data into database:", error);
        res.status(500).send("Error inserting data into database");
      }
    });
    app.get("/find-tutors", async (req, res) => {
      try {
        const data = await collection.find({}).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).send("Error fetching data from database");
      }
    });
    app.get("(/tutor/:details", async (req, res) => {
      const { id } = req.params;
      try {
        const product = await collection.findOne({ _id: new ObjectId(id) });
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ error: "Product not found" });
        }
      } catch (error) {
        // console.error("Error fetching product:", error);
        res.status(500).json({ error: "Error fetching product" });
      }
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Welcome to the Server!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
