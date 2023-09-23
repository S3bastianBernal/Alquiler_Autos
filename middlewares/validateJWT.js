import {response, request} from "express";
import jwt from "jsonwebtoken";

import conexion from "../database/connection.js";

const validateJWT = async (req = request, res = response, next)=>{
    const token = req.header("jwt");

    if (!token){
        return res.status(400).json({
            msg : "Se requiere un jsonwebtoken",
            validToken : false
        });
    }

    try {
        const {uid} = jwt.verify(token, process.env.SECRET_OR_PRIVATE_KEY);

        const db = await conexion();
        const coleccion = db.collection('clientes');

        const usuario = await coleccion.find({id_Cliente : uid}).toArray();

        if (!usuario){
            return res.status(400).json({
                msg : "Token inválido - Usuario no se encuentra registrado en la base de datos",
                validToken : false

            });
        }

        req.usuario = usuario;
        console.log("req usuario en validate", req.usuario);

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg : "Token inválido",
            validToken : false
        })
    }
}

export default validateJWT;