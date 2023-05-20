const express = require("express");
const app = express();
require('dotenv').config()
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//Middleware
app.use(cors());
app.use(express.json())


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
    }
  });
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

    const toyCollection = client.db("toyDB").collection("toys");

    app.post("/toys", async(req,res)=>{
      const toy = req.body
      console.log(toy);
      const result = await toyCollection.insertOne(toy)
      res.send(result)
    })

    // Load All toys
    app.get("/toys", async(req,res)=>{
        const cursor = toyCollection.find()
        const result = await  cursor.toArray()
        res.send(result)
    })

    // Load User specific toys
    app.get("/mytoys", async(req,res)=>{
      let query = {}
      if (req.query?.email) {
        query = {sellerEmail: req.query.email}
      }
      const result = await toyCollection.find(query).toArray()

      res.send(result)
    })
    
    // Read One document
    app.get('/updatetoy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}  
      const result = await toyCollection.findOne(query);
      res.send(result);
  })






      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);
  



  app.listen(port, () => {
    console.log(`Toy Troopers server listening on port ${port}`);
  });