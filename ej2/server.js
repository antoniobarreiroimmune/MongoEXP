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
        await client.connect().then((client) => app.locals.db = client.db('biblioteca'))
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar MongoDB:', error);
    }
}


app.get('/api/libros', async (req, res) => {
    try {
        const results = await app.locals.db.collection('libros').find({}).toArray();
        res.send({ mensaje: "listado de libros", results });

    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/libro/:titulo', async (req, res) => {
    try {
        const titulo = req.params.titulo;
        const libro = await app.locals.db.collection('libros').findOne({ titulo });

        if (libro) {
            res.send({ mensaje: "Libro encontrado", libro });
        } else {
            res.status(404).send({ mensaje: "Libro no encontrado" });
        }

    } catch (error) {
        console.error('Error libro:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/nuevoLibro/:titulo', async (req, res) => {
    try {
        const titulo = req.params.titulo;
        const nuevoLibro = {
            titulo,
            estado: "no leído"
        };
        const result = await app.locals.db.collection('libros').insertOne(nuevoLibro);
        res.status(201).send({ mensaje: "Libro añadido correctamente", nuevoLibro });


    } catch (error) {
        console.error('Error añadir nuevo libro:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/api/editarLibro/:titulo', async(req,res)=>{
    try {
        const results = await app.locals.db.collection('libros').updateOne({ titulo: req.params.titulo}, {$set: {leido: true}})
        res.send({ mensaje: "Libro modificado", results })
    } catch (error) {
        res.send({ mensaje: 'Libro no modificado', error })
    }
})




app.delete('/api/borrarLibro/:titulo', async (req, res) => {
    try {
        const titulo = req.params.titulo;

        const libroExistente = await app.locals.db.collection('libros').findOne({ titulo });

        if (!libroExistente) {
            res.status(404).send({ mensaje: "Libro no encontrado" });
            return;
        }

     
        const result = await app.locals.db.collection('libros').deleteOne({ titulo });

        if (result.deletedCount === 1) {
            res.send({ mensaje: "Libro borrado correctamente" });
        } else {
            res.status(500).send({ mensaje: "No se pudo borrar el libro" });
        }

    } catch (error) {
        console.error('Error borrando libro:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, (e) => {
    e
        ? console.error("Nos se ha podido conectar el servidor")
        : console.log("Servidor conectado y a la escucha en el puerto: " + PORT)
})