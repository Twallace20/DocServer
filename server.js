const mongoose = require("mongoose")
const Document = require("./Document")
const mongoDb = "mongodb+srv://test_user:justdocs1@just-docs.7mo0q.mongodb.net/just-docs?retryWrites=true&w=majority"
const defaultValue = ""

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@just-docs.7mo0q.mongodb.net/${process.env.CLUSTER}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log("Up and running")
  client.close();
});
 
const io = require('socket.io')(3001, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})


io.on("connection", socket => {
    socket.on('get-document', async documentId => {
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)
    
    socket.on("send-changes", delta => {
            socket.broadcast.emit("recieve-changes", delta)
            console.log(document.data)
     
    })

    socket.on("save-document", async data => {
         await Document.findByIdAndUpdate(documentId, { data } )

    })
  })
})

async function findOrCreateDocument(id) {
    if (id == null) return 

    const document = await Document.findById(id)
    if (document) return document 
    return await Document.create({ _id: id, data: defaultValue })
}