const client = require('./connection.js')
const express = require('express');
const app = express();
const port = process.env.PORT || 3300;
// -------------------------------------

app.listen(port, ()=>{
    console.log(`Server is now listening at port ${port}`);
})

// -------------------------------------

client.connect();

// -------------------------------------

const bodyParser = require("body-parser");
const { rows } = require('pg/lib/defaults');
app.use(bodyParser.json());

// -------------------------------------

//Retourne les détails de tous les assurés
app.get('/getAssures', (req, res) =>{
    client.query(`Select * from assures`,(err, result)=>{
            if(!err){
                res.send(result.rows);
            }
            else{
                console.log(err.message);
            }
            client.end;
        })
    })

// --------------------------------------

//Retourne le détail d'un assuré spécifique
app.get("/getAssures/:idassure",(req,res) =>{
    client.query(`Select * from assures where id_assure = ${req.params.idassure}` ,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne toutes les réclamations assurés
app.get("/getReclamationAssures",(req,res) =>{
    client.query(`Select * from reclamation_ass` ,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations d'un assuré spécifique
app.get("/getReclamationAssures/:idAssure",(req,res) =>{
    client.query(`Select * from reclamation_ass where assure_id=${req.params.idAssure}`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations des assurés sur un opérateur spécifique
app.get("/getReclamationSurOperateur/:idOperateur",(req,res) =>{
    client.query(`Select * from reclamation_ass where operateur_id=${req.params.idOperateur}`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})


//Retourne toutes les réclamations opérateurs
app.get("/getReclamationOperateurs",(req,res) =>{
    client.query(`Select * from reclamation_op` ,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations d'un opérateur spécifique
app.get("/getReclamationOperateurs/:idOperaeur",(req,res) =>{
    client.query(`Select * from reclamation_op where operateur_id=${req.params.idOperateur}`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations d'un operateur sur un assuré spécifique
app.get("/getReclamationSurAssure/:idAssure",(req,res) =>{
    client.query(`Select * from reclamation_op where assure_id=${req.params.idAssure}`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations opérateurs non traités
app.get("/getReclamationsOpNonTraitees",(req,res) =>{
    client.query(`Select * from reclamation_op where etat_rec_op = 'non traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations opérateurs non traités
app.get("/getNbrReclamationsOpNonTraitees",(req,res) =>{
    client.query(`Select count(*) from reclamation_op where etat_rec_op = 'non traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations opérateurs traités
app.get("/getReclamationsOpTraitees",(req,res) =>{
    client.query(`Select * from reclamation_op where etat_rec_op = 'traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations opérateurs traités
app.get("/getNbrReclamationsOpTraitees",(req,res) =>{
    client.query(`Select count(*) from reclamation_op where etat_rec_op = 'traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations opérateurs en cours de traitement
app.get("/getReclamationsOpEnCours",(req,res) =>{
    client.query(`Select * from reclamation_op where etat_rec_op = 'en cours'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations opérateurs en cours de traitement
app.get("/getNbrReclamationsOpEnCours",(req,res) =>{
    client.query(`Select count(*) from reclamation_op where etat_rec_op = 'en cours'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations assurés non traités
app.get("/getReclamationsAssNonTraitees",(req,res) =>{
    client.query(`Select * from reclamation_ass where etat_rec_ass = 'non traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations assurés non traités
app.get("/getNbrReclamationsAssNonTraitees",(req,res) =>{
    client.query(`Select count(*) from reclamation_ass where etat_rec_ass = 'non traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

// -------------------------------------

//Retourne les réclamations assurés traités
app.get("/getReclamationsAssTraitees",(req,res) =>{
    client.query(`Select * from reclamation_ass where etat_rec_ass = 'traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations assurés traités
app.get("/getNbrReclamationsAssTraitees",(req,res) =>{
    client.query(`Select count(*) from reclamation_ass where etat_rec_ass = 'traitée'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})
// -------------------------------------

//Retourne les réclamations assurés en cours de traitement
app.get("/getReclamationsAssEnCours",(req,res) =>{
    client.query(`Select * from reclamation_ass where etat_rec_ass = 'en cours'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})

//Retourne le nombre de réclamations assurés en cours de traitement
app.get("/getNbrReclamationsAssEnCours",(req,res) =>{
    client.query(`Select count(*) from reclamation_ass where etat_rec_ass = 'en cours'`,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
        else{
            console.log(err.message);
        }
        client.end;
    })
})