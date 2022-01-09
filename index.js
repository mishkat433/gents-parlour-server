require("dotenv").config();
const express = require("express");
const app= express();
const bodyparser = require("body-parser");
const cors = require("cors");
const fs= require("fs-extra")
const fileUpload = require("express-fileupload");
const PORT= process.env.PORT || 4521;
const { MongoClient, ObjectId } = require('mongodb');


app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(cors())
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.twfgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect(err => {
    const contactCollection = client.db("gentsParlour").collection("contactMessage");
    const adminCollection = client.db("gentsParlour").collection("admin");
    const bookingCollection = client.db("gentsParlour").collection("booking");
    const reviewCollection = client.db("gentsParlour").collection("reviews");
    const serviceCollection = client.db("gentsParlour").collection("services");

    app.get("/", (req, res) => {
        res.send("hello i am running")
    })

    app.post("/contactMessage",(req,res)=>{
        const message= req.body
        contactCollection.insertOne(message)
        .then(result=>{
            res.send(result)
        })
    })

    app.post("/makeAdmin",(req,res)=>{
        const admin= req.body
        adminCollection.insertOne(admin)
        .then(result=>{
            res.send(result)
        })
    })

    app.get("/getAdmin",(req,res)=>{
        adminCollection.find()
        .toArray((error,document)=>{
            res.send(document)
        })
    })
    app.delete("/delete/:id",(req,res)=>{
        adminCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result=>{
            res.send(result.deletedCount>0)
        })
    })

    app.get("/findAdmin/:userEmail",(req,res)=>{
        // console.log(req.params.userEmail)
        adminCollection.find({email: req.params.userEmail})
        .toArray((error,document)=>{
            res.send(document)
        })
    })

    app.post("/booking",(req,res)=>{
        const book= req.body
        bookingCollection.insertOne(book)
        .then(result=>{
            res.send(result.insertedId)
        })
    })

    app.get("/getBooking",(req,res)=>{
        bookingCollection.find()
        .toArray((err,document)=>{
            res.send(document)
        })
    })

    app.post("/sendReview",(req,res)=>{
        const rev= req.body
        reviewCollection.insertOne(rev)
        .then(result=>{
            res.send(result.insertedId)
        })
    })
    app.get("/getReview",(req,res)=>{
        reviewCollection.find()
        .toArray((error,document)=>{
            res.send(document)
        })
    })
    app.post("/addServices", (req,res)=>{
        const fle= req.files.file
        const name= req.body.serviceName
        const price= req.body.price
        const desc= req.body.description
        
        var filePath= `${__dirname}/service/${fle.name}`
        fle.mv(filePath, err=>{
            if(err){
                console.log(err)
            }
            const readFile= fs.readFileSync(filePath)
            const convert = readFile.toString("base64")
            var newImage= {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(convert, "base64")
            }
            serviceCollection.insertOne({name,price,desc,newImage})
            .then(result=>{
                fs.remove(filePath, error=>{
                    if(error){console.log(error)}
                    res.send(result.insertedId)
                })
            })
        })
    })
    
    app.get("/getservices", (req,res)=>{
        serviceCollection.find()
        .toArray((err,document)=>{
            res.send(document)
        })
    })

    app.get("/getMyBooking/:useEmail",(req,res)=>{
        // console.log(req.params.userEmail)
         bookingCollection.find({email: req.params.useEmail})
        .toArray((error,document)=>{
            res.send(document)
         })
   })


    // client.close();
    console.log("load complete")
});



app.listen(PORT, (req,res)=>{
    console.log(`server is running at http://localhost:${PORT}`)
})
