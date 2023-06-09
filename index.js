const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//Middleware
// app.use(cors());
// const corsConfig = {
//   origin: "",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };
// app.use(cors(corsConfig));
// app.options("", cors(corsConfig));
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Toy Troopers Server is running!!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez2ieyu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyDB").collection("toys");
    const actionFigureCollection = client
      .db("toyDB")
      .collection("actionFigures");

    // Load All toys
    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.limit(20).toArray();
      res.send(result);
    });

    

   

    //Get A toy By id
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });


    // Get toys by category

    app.get("/toysCategory/:category", async (req, res) => {
      const toys = await toyCollection
        .find({
          subCategory: req.params.category,
        })
        .toArray();
      res.send(toys);
    });


    // Load User specific toys
    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      if (req.query?.sort) {
        const sortStyle = req.query.sort;
        if (sortStyle == "ascending") {
          const result = await toyCollection
            .find(query)
            .sort({ price: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .toArray();

          return res.send(result);
        } else if (sortStyle == "descending") {
          const result = await toyCollection
            .find(query)
            .sort({ price: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .toArray();
          return res.send(result);
        }
      }
      const result = await toyCollection.find(query).toArray();

      res.send(result);
    });

    // Get the update-able toy
    app.get("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });
    // Update toy
    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      const filter = { _id: new ObjectId(id) };

      const options = { upsert: true };
      const toy = {
        $set: {
          toyPictureURL: updatedToy.toyPictureURL,
          toyName: updatedToy.toyName,
          sellerName: updatedToy.sellerName,
          sellerEmail: updatedToy.sellerEmail,
          subCategory: updatedToy.subCategory,
          price: updatedToy.price,
          rating: updatedToy.rating,
          availableQuantity: updatedToy.availableQuantity,
          detailDescription: updatedToy.detailDescription,
        },
      };

      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    // Delete toy
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });
    // Load All Action Figures
    app.get("/actionFigures", async (req, res) => {
      const cursor = actionFigureCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Toy Troopers server listening on port ${port}`);
});
