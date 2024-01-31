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
        await client.connect().then((client) => app.locals.db = client.db('restaurante'))
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar MongoDB:', error);
    }
}


app.get('/api/menus', async(req, res) =>{
    try {
        const results = await app.locals.db.collection('menus').find().toArray()
        res.send({mensaje: 'Petición satisfecha', results})
    } catch (error) {
        res.send({mensaje: 'Petición no resuelta', error})
    }
})



app.post('/api/nuevoMenu', async (req, res) => {
    try {
        let { Número_de_menú, Primer_plato, Segundo_plato, Postre, Precio } = req.body

        const results = await app.locals.db.collection('menus').insertOne({ Número_de_menú, Primer_plato, Segundo_plato, Postre, Precio })
        res.send({ mensaje: "Producto añadido", results })

    } catch (error) {
        console.error('Error en la petición')
        res.status(500).send('Internal Server Error')
    }
})

app.put('/api/editarMenu', async (req, res) => {
    try {
        const { Número_de_menú, Primer_plato, Segundo_plato, Postre, Precio } = req.body;
        if (!Número_de_menú) {
            return res.status(400).send({ mensaje: "Número de menú no proporcionado" });
        }
        const results = await app.locals.db.collection('menus').updateOne({ Número_de_menú }, { $set: { Primer_plato, Segundo_plato, Postre, Precio } });
        if (results.modifiedCount === 0) {
            return res.status(404).send({ mensaje: "Menú no encontrado" });
        }
        res.status(200).send({ mensaje: "Producto modificado", results });
    } catch (error) {
        console.error(error); 
        res.status(500).send({ mensaje: "Error al modificar", error: error.message });
    }
});



app.delete('/api/borrarMenu/:numero', async (req, res) => {
    try {
        const results = await app.locals.db.collection('menus').deleteOne({numero: req.params.Número_de_menú });
        if (results.deletedCount < 1) {
            res.send({ mensaje: "Menú no encontrado o ya fue borrado", results: null });
        } else {
            res.send({ mensaje: "Menú borrado exitosamente", results });
        }
    } catch (error) {
        console.error(error); 
        res.send({ mensaje: 'Error al intentar borrar el menú', error });
    }
});






app.listen(PORT, (e) => {
    e
        ? console.error("Nos se ha podido conectar el servidor")
        : console.log("Servidor conectado y a la escucha en el puerto: " + PORT)
})