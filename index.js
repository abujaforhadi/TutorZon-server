require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ObjectId,
  updateOne,
  ServerApiVersion,
} = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.006kz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("TutorZon");
    const tutorsCollection = db.collection("tutors");
    const bookingsCollection = db.collection("bookings");
    const CategoryCollection = db.collection("category");

    // Add new tutors
    app.post("/find-tutors", async (req, res) => {
      try {
        const data = await tutorsCollection.insertOne(req.body);
        res.json(data);
      } catch (error) {
        res.status(500).send("Error inserting data into database");
      }
    });

    app.get('/Category',async(req,res)=>{
      try {
        const data = await CategoryCollection.find({}).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).send("Error fetching data from database");
      }
    })

    // Get all tutors or filter by language category
    app.get("/find-tutors", async (req, res) => {
      const { language } = req.query; 
    
      try {
        let data;
        
        if (language) {
          data = await tutorsCollection.find({ language }).toArray();
        } else {
          data = await tutorsCollection.find({}).toArray();
        }
    
        res.json(data); 
      } catch (error) {
        // console.error("Error fetching data from database:", error);
        res.status(500).send("Error fetching data from database");
      }
    });

    // Get tutor details by ID
    app.get("/tutor/:details", async (req, res) => {
      const { details } = req.params;
      try {
        const tutor = await tutorsCollection.findOne({
          _id: new ObjectId(details),
        });
        if (tutor) {
          res.json(tutor);
        } else {
          res.status(404).json({ error: "Tutor not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error fetching tutor details" });
      }
    });
    // update count
    app.patch("/tutor/:id", async (req, res) => {
      const { id } = req.params;
      const { review } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          review: review,
        },
      };

      try {
        const result = await tutorsCollection.updateOne(filter, updateDoc);
        if (result.modifiedCount > 0) {
          res.json({ modifiedCount: result.modifiedCount });
        } else {
          res.json({ modifiedCount: 0 });
        }
      } catch (error) {
        res.status(500).json({ error: "Error updating review" });
      }
    });

    

    // Get all bookings
    app.get("/bookings", async (req, res) => {
      try {
        const data = await bookingsCollection.find({}).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).send("Error fetching bookings");
      }
    });

    // Update for My Tutorials
 
app.patch("/My-Tutorials-update/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: updateData,
  };

  try {
    const result = await tutorsCollection.updateOne(filter, updateDoc);
    if (result.modifiedCount > 0) {
      res.json({ message: "Booking updated successfully" });
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating booking" });
  }
});
// Delete a My Tutorials
app.delete("/My-Tutorials-delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await tutorsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount > 0) {
      res.json({ message: "Tutorials deleted successfully" });
    } else {
      res.status(404).json({ error: "Tutorials not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting Tutorials" });
  }
});


    // Add a new booking
    app.post("/bookings", async (req, res) => {
      const bookingDetails = req.body;
      try {
        const result = await bookingsCollection.insertOne(bookingDetails);
        res.json({
          message: "Booking successful",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({ error: "Error adding booking" });
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
