const express = require('express');
const bodyparser = require('body-parser')
const app = express();
const port = 8080;
const db = require('./api')



app.use(bodyparser.json());
app.use(
    bodyparser.urlencoded({
            extended: true,
        })
)

//what to do when we GET
app.get('/', (request, response)=>{
    response.json({info: 'wiwi random json yesyes'})
})


app.post('/op_transport', db.createOperation);
app.get('/op_transport', db.getOperationInfo);
app.get('/op_transport/state/:etat', db.getOperationInfoByState);
app.get('/op_transport/stats/state', db.getOperationsStats);


app.post('/transporter', db.createTransporter);
app.get('/transporter/:id', db.getTransporterInfoById);
app.get('/transporter/:id/op_transport', db.getTransporterOperations);
app.get('/transporter/:id/op_transport/state/:etat', db.getTransporterOperationsByState);

app.post('/demande', db.createDemande);
app.get('/demandes', db.getDetailsDemande);
app.put('/demandes/:id/state/:etat', db.setDemandeState);

app.get('/operateurs', db.getOperateurs);
app.get('/operateurs/:id/transporters', db.getOperateursTransporters);
app.get('/operateurs/:id/op_transport', db.getOperateursOperations);
app.get('/operateurs/:id/op_transport/stats/state', db.getOperateurOperationsStats);

app.post('/assures', db.createAssure);
app.get('/assures', db.getAssures);
app.get('/assures/:id/info', db.getAssuresById);


app.post('/reclamations-assure', db.createReclamation);
app.get('/reclamations-assure', db.getReclamations);
app.get('/reclamations-assure/state/:etat', db.getReclamationsByState);
app.get('/reclamations-assure/stats/state', db.getReclamationsStats);
app.get('/reclamations-assure/reclamation/:id', db.getReclamationsIdRec);
app.get('/reclamations-assure/assure/:id', db.getReclamationsIdAssure);


//listening on port 8080
app.listen(port, ()=>{
    console.log('App listening on port '+port+'...')
})
