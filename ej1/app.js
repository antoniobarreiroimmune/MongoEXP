const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(async (req, res, next) => {
    await connectToMongo();
    next();
});

//conecta con db
async function connectToMongo() {
    let client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect().then((client)=>app.locals.db=client.db('tienda'))
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar MongoDB:', error);
    }
}


app.get('/api/mesas', async (req, res) => {
    try {
        const results = await app.locals.db.collection('mesas').find({}).toArray();
        res.send({mensaje: "lsitado de productos", results});

    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Internal Server Error');
    }
});



app.post('/api/anyadir', async (req, res)=>{
    try {
        let {Nombre, Color, Material, Tamaño, Patas} = req.body

        const results = await app.locals.db.collection('mesas').insertOne({Nombre, Color, Material, Tamaño, Patas})
        res.send({mensaje: "Producto añadido", results})
        
    } catch (error) {
        console.error('Error en la petición')
        res.status(500).send('Internal Server Error')
    }
})

app.put('/api/modificar/color/:colorActual', async (req, res) => {
    try {
        const colorActual = req.params.colorActual;
        const nuevoColor = req.body.nuevoColor;

        const results = await app.locals.db.collection('mesas').updateMany(
            { Color: colorActual }, 
            { $set: { Color: nuevoColor } } 
        );

        res.send({ mensaje: "Colores de mesas actualizados", results });
    } catch (error) {
        console.error('Error en la petición');
        res.status(500).send('Internal Server Error');
    }
});




app.delete('/api/borrar/mesas', async (req, res) => {
    try {
        const numeroPatasABorrar = req.body.Patas;

        if (!numeroPatasABorrar) {
            return res.status(400).send('El número de patas no fue proporcionado.');
        }

        const results = await app.locals.db.collection('mesas').deleteMany({ Patas: numeroPatasABorrar });

        res.send({ mensaje: "Productos borrados exitosamente", results });
    } catch (error) {
        console.error('Error en la petición', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, (e) => {
    e
        ? console.error("Nos se ha podido conectar el servidor")
        : console.log("Servidor conectado y a la escucha en el puerto: " + PORT)
})