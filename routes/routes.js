const express = require('express');
const {MongoClient} = require ('mongodb');
require('dotenv').config();
const router = express.Router();
const {response} = require("express");
const generateJWT = require("../helpers/generateJWT.js");



const client = new MongoClient(process.env.DATAMONGOBASEMIA)
const db = client.db('AlquilerAutos');

//Endpoint 2: Mostrar todo los clientes registrados en la base de datos 

router.get('/ejercicio2/', async (req, res) => {
    try {
        const clientes = await db.collection('cliente').find().toArray();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 3: Obtener los Automoviles disponibles para alquiler

router.get('/ejercicio3/', async (req, res) => {
    try {
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'estado':'Cancelado'},{'estado':'Pendiente'}]}},
            {$lookup:{
                from: 'automovil',
                localField: 'id_automovil',
                foreignField: 'id_automovil',
                as: 'Automovil'
            }}
    ]).toArray()
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 4: Listar todos los alquileres activos junto con los datos de los clientes relacionados

router.get('/ejercicio4/', async (req, res) => {
    try {
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'estado':'Confirmado'},{'estado':'Aprobado'}]}},
            {$lookup:{
                from: 'cliente',
                localField: 'id_cliente',
                foreignField: 'id_Cliente',
                as: 'Cliente'
            }}
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 5: Mostrar todas las reservas pendientes con los datos del cliente y el automóvil reservado.

router.get('/ejercicio5/', async (req, res) => {
    try {
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'estado':'Pendiente'}]}},
            {$lookup:{
                from: 'cliente',
                localField: 'id_cliente',
                foreignField: 'id_Cliente',
                as: 'Cliente'
            }},
            {$lookup:{
                from: 'automovil',
                localField: 'id_automovil',
                foreignField: 'id_automovil',
                as: 'Automovil'
            },
            }
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 6: Obtener los detalles del alquiler con el ID_Alquiler específico.

router.get('/ejercicio6/:id_alquiler', async (req, res) => {
    try {
        const id_alquiler = Number(req.params);
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'id_alquiler':id_alquiler}]}}
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

//Endpoint 7: Obtener los detalles de los Empleados de cargo Vendedor

router.get('/ejercicio7/', async (req, res) => {
    try {
        const response = await db.collection('empleado').find({cargo:"Vendedor"}).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 8: Mostrar la cantidad total de automóviles disponibles en cada sucursal.

router.get('/ejercicio8/', async (req, res) => {
    try {
        const response = await db.collection('sucursalAutomovil').aggregate([
            {
                $group:{
                    _id: '$id_Sucursal_Automovil',
                    cantidad_Disponible: {
                        $sum: '$cantidad_Disponible'
                    }
                }
            },
            {
                $project:{
                    _id: 0,
                    id_Sucursal_Automovil: 0,
                    id_Sucursal: 0,
                    id_Automovil: 0
                }
            }
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 9: Obtener el costo total de un alquiler en especifico

router.get('/ejercicio9/:id_alquiler', async (req, res) => {
    try {
        const id_alquiler = Number(req.params);
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'id_alquiler':id_alquiler}]}},
            {$project: {
                _id: 1,
                id_cliente: 0,
                id_alquiler:0,
                id_automovil: 0,
                fecha_Inicio: 0,
                fecha_Fin: 0,
                estado: 0
            }}
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

//Endpoint 10: Listar los clientes con un DNI Especifico

router.get('/ejercicio10/:dni', async (req, res) => {
    try {
        const dni = req.params.dni;
        const response = await db.collection('cliente').find({dni:dni}).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 11: Mostrar todos los automóviles con una capacidad mayor a 5 personas.

router.get('/ejercicio11/', async (req, res) => {
    try {
        const response = await db.collection('automovil').find({capacidad:{$gt:5}}).toArray();
        res.json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 12: Obtener los detalles del alquiler que tiene fecha de inicio en '2023-07-05'.

router.get('/ejercicio12/', async (req, res) => {
    try {
        const response = await db.collection('alquiler').aggregate([
            {$match: {$or:[{'fecha_Inicio': "2023-07-05"}]}},
        ]).toArray();
        if (response.length > 0) {
            res.json(response);
        }else{
            res.status(404).json({message: 'No se encontraron resultados'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Endpoint 13: Listar las reservas pendientes realizadas por un cliente específico.

router.get('/ejercicio13/:id_cliente', async (req, res) => {
    try {
        const id_cliente = Number(req.params.id_cliente);
        const response = await db.collection('reserva').find({id_Cliente: id_cliente},{estado: "Pendiente"}).toArray();
        res.json(response);
    } catch (error) {
        res.json({message: error.message});
    }
})

//Endpoint 14:Mostrar los empleados con cargo de "Gerente" o "Asistente".

router.get('/ejercicio14/' , async (req, res) => {
    try {
        const response = await db.collection('empleado').aggregate([
            {$match: {$or:[{'cargo':'Gerente'},{'cargo':'Asistente'}]}},
        ]).toArray();
        res.json(response);
    } catch (error) {
        res.json({message: error.message});
    }
});


// 15.Obtener los datos de los clientes que realizaron al menos un alquiler.

router.get('/ejercicio15/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('alquiler').aggregate([
            {
                $lookup:{
                    from: "cliente",
                    localField: "id_cliente",
                    foreignField: "id_Cliente",
                    as: "cliente"
                }
            },
            {
                $project:{
                    _id: 0,
                    cliente: '$cliente'
                }
            }
        ]).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

//Endpoint 16: Listar todos los automóviles ordenados por marca y modelo.

router.get('/ejercicio16/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('automovil').find().sort({marca:1},{modelo: 1}).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

//Endpoint 17: Mostrar la cantidad total de automóviles en cada sucursal junto con su dirección.
router.get('/ejercicio17/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('sucursalAutomovil').aggregate([
            {
                $lookup: {
                    from: "sucursal",
                    localField: "id_Sucursal",
                    foreignField: "id_sucursal",
                    as: "Sucursal"
                }
            },
            {
                $group: {
                    _id: '$id_Sucursal',
                    Direccion: { $first: "$Sucursal.direccion" },
                    Cantidad_Total_Automoviles: { $sum: '$cantidad_Disponible'}
                }
            },
            {
                $project: {
                    _id: 0,
                    id_Sucursal: '$_id',
                    Direccion: 1,
                    Cantidad_Total_Automoviles: 1
                }
            }
        ]).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

//Endpoint 18: Obtener la cantidad total de alquileres registrados en la base de datos.

router.get('/ejercicio18/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('alquiler').countDocuments(); 
        res.json(`La cantidad total de alquileres registrados en labase de datos son: ${result}`);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

// Endpoint 19: Mostrar los automóviles con capacidad igual a 5 personas y que estén disponibles.

router.get('/ejercicio19/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('alquiler').aggregate([
            {
                $lookup:{
                    from: "automovil",
                    localField: "id_automovil",
                    foreignField: "id_automovil",
                    as: "Automovil"
                }
            },
            {
                $unwind:'$Automovil'
            },
            {
                $match:{
                    estado: 'Finalizado',
                    $expr: { $eq: ["$Automovil.capacidad", 5] }
                }
            },
            {
                $project: {
                    _id: 0,
                    Automovil: 1
                }
            }            
        ]).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

// Enpoint 20: Obtener los datos del cliente que realizó la reservacion.

router.get('/ejercicio20/', async (req, res) => {
    try {
        await client.connect();
        const response = await db.collection('reserva').aggregate([
            {
                $lookup:{
                    from: "cliente",
                    localField: "id_Cliente",
                    foreignField: "id_Cliente",
                    as: "Cliente"
                }
            }
        ]).toArray();
        res.json(response)
    } catch (error) {
        res.status(404).json({message: error.message});
    }
})

//Endpoint 21: Listar los alquileres con fecha de inicio entre '2023-07-05' y '2023-07-10'.

router.get('/ejercicio21/', async (req, res) =>{
    try {
        await client.connect();
        const result = await db.collection('alquiler').find({$and: [{fecha_Inicio: {$gte: '2023-07-05'}},{fecha_Inicio: {$lte: '2023-07-10'}}]}).toArray(); 
        res.json(result);
        client.close();
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

//Login con JWT

router.get('/login', async (req, res = response)=>{

    const {nombre, password} = req.body;

    try {
        const coleccion = db.collection('empledao');

        const usuario = await coleccion.find({nombre}).toArray();

        if (!usuario){
            return res.status(400).json({
                msg : "Usuario incorrecto o no registrado en la base de datos"
            });
        }

        if (usuario[0].dni != password){
            return res.status(400).json({
                usuario,
                password,
                msg : "Contraseña incorrecta"
            });
        }

        const token = await generateJWT(usuario.id_Empleado);

        res.json({
            usuario,
            token
        });
    } catch (error) {
        return res.json({
            msg : "Contacte al servicio técnico"
        });
    }
})


//CRUD

//Alquiler

// GET - Obtener todos los Alquileres
router.get('/GetAlquiler', async (req, res) => {
    try {
        const response = await db.collection('alquiler').find().toArray();
        res.json(response)
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

// POST - Crear un nuevo Alquiler
router.get('/PostAlquiler',  async (req,res)=>{
    try {
        const coleccion = db.collection('alquiler');
        const data = req.body;
        const response = await coleccion.insertOne(data);
        res.json({
            response,
            data});
    } catch (error) {
        console.log(error);
    }
});

// DELETE - Eliminar un Alquiler por su ID
router.get('/DeleteAlquiler/:id', async (req, res) => {
    try {
        const id = req.params;
        const response = await db.collection('alquiler').deleteOne({_id: new ObjectId(id)})
        res.json(response)
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

// PUT - Actualizar un alquiler por su ID
router.get('/UpdateAlquiler/:id',  async (req,res)=>{
    try {
        const coleccion = db.collection('alquiler');
        const data = req.body;
        const id = parseInt(req.params.id);

        console.log(id);
        await coleccion.findOneAndUpdate({ id_alquiler: id }, { $set: data });
        res.send(data)
        } catch (error) {
        console.log(error);
    }
});

//Cliente
// GET - Obtener todos los clientes
router.get('/GetClientes', async (req, res) => {
    try {
        const response = await db.collection('cliente').find().toArray();
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// POST - Crear un nuevo cliente
router.post('/PostCliente', async (req, res) => {
    try {
        const coleccion = db.collection('cliente');
        const data = req.body;
        const response = await coleccion.insertOne(data);
        res.json({
            response,
            data
        });
    } catch (error) {
        console.log(error);
    }
});

// DELETE - Eliminar un cliente por su ID
router.delete('/DeleteCliente/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await db.collection('cliente').deleteOne({ _id: new ObjectId(id) });
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// PUT - Actualizar un cliente por su ID
router.put('/UpdateCliente/:id', async (req, res) => {
    try {
        const coleccion = db.collection('cliente');
        const data = req.body;
        const id = req.params.id;

        await coleccion.updateOne({ _id: new ObjectId(id) }, { $set: data });
        res.json(data);
    } catch (error) {
        console.log(error);
    }
});

//Reservas

// GET - Obtener todas las reservas
router.get('/GetReservas', async (req, res) => {
    try {
        const response = await db.collection('reserva').find().toArray();
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// POST - Crear una nueva reserva
router.post('/PostReserva', async (req, res) => {
    try {
        const coleccion = db.collection('reserva');
        const data = req.body;
        const response = await coleccion.insertOne(data);
        res.json({
            response,
            data
        });
    } catch (error) {
        console.log(error);
    }
});

// DELETE - Eliminar una reserva por su ID
router.delete('/DeleteReserva/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await db.collection('reserva').deleteOne({ _id: new ObjectId(id) });
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// PUT - Actualizar una reserva por su ID
router.put('/UpdateReserva/:id', async (req, res) => {
    try {
        const coleccion = db.collection('reserva');
        const data = req.body;
        const id = req.params.id;

        await coleccion.updateOne({ _id: new ObjectId(id) }, { $set: data });
        res.json(data);
    } catch (error) {
        console.log(error);
    }
});

//SucursalAutomovil


// GET - Obtener todos los automóviles en una sucursal
router.get('/GetSucursalAutomoviles', async (req, res) => {
    try {
        const response = await db.collection('sucursalAutomovil').find().toArray();
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// POST - Agregar un automóvil a una sucursal
router.post('/PostSucursalAutomovil', async (req, res) => {
    try {
        const coleccion = db.collection('sucursalAutomovil');
        const data = req.body;
        const response = await coleccion.insertOne(data);
        res.json({
            response,
            data
        });
    } catch (error) {
        console.log(error);
    }
});

// DELETE - Eliminar un automóvil de una sucursal por su ID
router.delete('/DeleteSucursalAutomovil/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await db.collection('sucursalAutomovil').deleteOne({ _id: new ObjectId(id) });
        res.json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// PUT - Actualizar información de un automóvil en una sucursal por su ID
router.put('/UpdateSucursalAutomovil/:id', async (req, res) => {
    try {
        const coleccion = db.collection('sucursalAutomovil');
        const data = req.body;
        const id = req.params.id;

        await coleccion.updateOne({ _id: new ObjectId(id) }, { $set: data });
        res.json(data);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router


