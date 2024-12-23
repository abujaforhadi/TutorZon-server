require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

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

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const db = client.db("TutorZon");
    const tutorsCollection = db.collection("languages");
    const bookingsCollection = db.collection("bookings"); 

    // Add booking
    app.post("/bookings", async (req, res) => {
      const bookingDetails = req.body;
      try {
        const result = await bookingsCollection.insertOne(bookingDetails);
        res.json({ message: "Booking successful", insertedId: result.insertedId });
      } catch (error) {
        console.error("Error adding booking:", error);
        res.status(500).json({ error: "Error adding booking" });
      }
    });

    // Get all tutors
    app.get("/find-tutors", async (req, res) => {
      try {
        const data = await tutorsCollection.find({}).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).send("Error fetching data from database");
      }
    });

    // Get tutor details
    app.get("/tutor/:details", async (req, res) => {
      const { details } = req.params;
      try {
        const tutor = await tutorsCollection.findOne({ _id: new ObjectId(details) });
        if (tutor) {
          res.json(tutor);
        } else {
          res.status(404).json({ error: "Tutor not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error fetching tutor details" });
      }
    });

    app.patch("/tutors/review/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await tutorsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { review: 1 } }
        );

        if (result.modifiedCount > 0) {
          res.json({ message: "Review count updated successfully" });
        } else {
          res.status(404).json({ error: "Tutor not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error updating review count" });
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
