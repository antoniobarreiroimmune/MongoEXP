const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static('public'));
 


app.use(async (req, res, next) => {
    await connectToMongo();
    next();
});

//conecta con db
async function connectToMongo() {
    let client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect().then((client) => app.locals.db = client.db('tv'))
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar MongoDB:', error);
    }
}


app.get('/api/series', async (req, res) => {
    try {
        const results = await app.locals.db.collection('series').find({}, { projection: { titulo: 1, nota: 1 } }).toArray();
        res.send({ mensaje: "listado de series", results });
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/api/:serie', async (req, res) => {
    try {
        const results = await app.locals.db.collection('series').find({ titulo: req.params.serie }).toArray()
        results.length > 0
            ? res.send({ mensaje: "Petición satisfecha", results })
            : res.send({ mensaje: "Serie no presente en la BBDD" })
    } catch (error) {
        res.send({ mensaje: "Serie no recuperada", error })
    }
})






app.post('/api/nuevaSerie', async (req, res) => {
    try {
        const {titulo,nota,plataforma} = req.body;
        await app.locals.db.collection('series').insertOne ({titulo,nota,plataforma});

        res.status(201).send({ mensaje: "Serie añadida con éxito" });

    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(PORT, (e) => {
    e
        ? console.error("Nos se ha podido conectar el servidor")
        : console.log("Servidor conectado y a la escucha en el puerto: " + PORT)
})