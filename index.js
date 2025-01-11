require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const {
  MongoClient,
  ObjectId,
  updateOne,
  ServerApiVersion,
} = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assigment11-7f8f3.web.app",
      "https://assigment11-7f8f3.firebaseapp.com",
      "https://tutorzen.abujafor.me", 
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);


app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};
const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.006kz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

 function run() {
  try {
    //  client.connect();
    // console.log("Connected to MongoDB!");

    const db = client.db("TutorZen");
    const tutorsCollection = db.collection("tutors");
    const bookingsCollection = db.collection("bookings");
    const CategoryCollection = db.collection("category");
    const UserCollection = db.collection("users");

    //  UserCollection.createIndex({ email: 1 }, { unique: true });

    // save as cookies
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      // create token
      const token = jwt.sign(email, process.env.secret_key, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // delete cookies
    // app.get("/logout", async (req, res) => {
    //   res
    //     .clearCookie("token", {
    //       maxAge: 0,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //     })
    //     .send({ success: true });
    // });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Add new tutors
    app.post("/find-tutors", async (req, res) => {
      try {
        const data = await tutorsCollection.insertOne(req.body);
        res.json(data);
      } catch (error) {
        res.status(500).send("Error inserting data into database");
      }
    });

    app.get("/Category", async (req, res) => {
      try {
        const data = await CategoryCollection.find({}).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).send("Error fetching data from database");
      }
    });
   

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
        console.error("Error fetching data from database:", error);
        res.status(500).send("Error fetching data from database");
      }
    });
    // app.get("/total-reviews", async (req, res) => {
      
    //    const
    //       data = await tutorsCollection.find({}).toArray();
        

    //     res.json(data);
      
    // });

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

    app.get("/bookings", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.user?.email;
    
      if (decodedEmail !== email) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
    
      try {
        const data = await bookingsCollection.find({ BookingEmail: email }).toArray();
        res.json(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Error fetching bookings");
      }
    });
    app.get("/my-tutorials", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.user?.email;
    
      if (decodedEmail !== email) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
    
      try {
        const data = await tutorsCollection.find({ userEmail: email }).toArray();
        res.json(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Error fetching bookings");
      }
    });
    
    // Update for My Tutorials

    app.patch("/My-Tutorials-update/:id",async (req, res) => {
     
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
    app.delete("/My-Tutorials-delete/:id", async (req, res) => {
      
       
    
      const { id } = req.params;
    
      try {
        const result = await tutorsCollection.deleteOne({
          _id: new ObjectId(id),
        });
    
        if (result.deletedCount > 0) {
          res.json({ message: "Tutorial deleted successfully" });
        } else {
          res.status(404).json({ error: "Tutorial not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error deleting tutorial" });
      }
    });
    app.post("/user", async (req, res) => {
      const { email, displayName, photoURL } = req.body;

      try {
        const existingUser = await UserCollection.findOne({ email });
        if (existingUser) {
          return res.status(200).json({ error: "User already exists" });
        }

        const result = await UserCollection.insertOne({ email, displayName, photoURL });
        res.json({
          message: "User created successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Error creating user" });
      }
    });

    app.get("/stats/users-count", async (req, res) => {
      try {
        const count = await UserCollection.countDocuments();
        res.json({ count });
      } catch (error) {
        console.error("Error fetching users count:", error);
        res.status(500).send("Error fetching users count");
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