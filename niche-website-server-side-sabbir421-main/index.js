const express = require('express')
const { MongoClient, CURSOR_FLAGS } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 4000
// middleware 
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwsc8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try {
        await client.connect()
        const database = client.db('camera-world')
        console.log('database connected')
        // foods connection
        const camerasCollection = database.collection('cameras')
        // order connection
        const ordersCollection = database.collection('orders')
        // user connection
        const usersCollection = database.collection('users')
        // // review collections 
         const reviewsCollection = database.collection('reviews')

        //  Data section///////
        ///get api for all data //////
        app.get('/cameras', async (req, res) => {
            const cursor = camerasCollection.find({})
            const cameras = await cursor.toArray()
            res.send(cameras)

        })
        // //    post api /////
        app.post('/cameras', async (req, res) => {
            const newCamera = req.body
            const result = await camerasCollection.insertOne(newCamera)
            res.json(result)
        })
        // //    get single data /////
        app.get('/camera/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await camerasCollection.findOne(query)
            res.json(product)
        })
        // // get api for all data///// 
        app.get('/products', async (req, res) => {
            const cursor = camerasCollection.find({})
            const page = req.query.page
            const size = parseInt(req.query.size)
            let products;
            const count = await cursor.count()
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                const products = await cursor.toArray()
            }
            res.send({
                count, products
            })
        })

        // orders api section /////
        // orders post /////
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
        app.get('/getorders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray()
            res.send(orders)
        })
        app.get('/myorders', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = ordersCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)

        })
        // update orders////
         // update api//// 
         app.put('/updateorders/:id',async(req,res)=>{
            const id=req.params.id 
            const updatedStatus=req.body
            const filter={_id:ObjectId(id)}
            const option={upsert:true}
            const updateDoc={
                $set:{
                status:'Approved',  
                }
            }
            const result =await ordersCollection.updateOne(filter,updateDoc,true)
            res.json(result)
        })

        // Users section ///
        // post user/// 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })
        // make admin ///
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // checked admin or not ///
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //   reviews ///
        //    post api /////
        app.post('/reviews', async (req, res) => {
            const newReview = req.body
            const result = await reviewsCollection.insertOne(newReview)
            res.json(result)
        })
        app.get('/getreviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        //   delete api ////
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })

        // // delete product cameras////
        app.delete('/cameras/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await camerasCollection.deleteOne(query)
            res.json(result)
        })
        // update product////
        app.put('/updateproduct/:id',async(req,res)=>{
            const id=req.params.id 
            const updatedProduct=req.body
            const filter={_id:ObjectId(id)}
            const option={upsert:true}
            const updateDoc={
                $set:{
                 name:updatedProduct.name,
                 price:updatedProduct.price,
                 sale:updatedProduct.sale,
                 stock:updatedProduct.stock,
                 img:updatedProduct.img,
                 desc:updatedProduct.desc,
                 star:updatedProduct.star
                }
            }
            const result =await camerasCollection.updateOne(filter,updateDoc,true)
            res.json(result)
        })


    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Camera World server site')
})
app.listen(port, () => {
    console.log("server is running on", port)
})