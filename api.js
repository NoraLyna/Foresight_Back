const client = require('./connection')
const express = require('express');
const { response, request } = require('express');
const app = express();
const pool = client.pool;


//GET: /op_transport
const getTransportOperationInfo = (request, response) => {
    var qry = 
    'SELECT * FROM operation_transport opt, transporteurs tp, assures asr '+ 
    'WHERE opt.transporteur_id = tp.id_transporteur '+
    'AND opt.assure_id = asr.id_assure '+
    'ORDER BY opt.id_operation'
    ;
    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//POST /op_transport
const createOperation = (request, response) =>{
    const {kilometrage_attendu, transporteur_id, assure_id} = request.body;

    var qry =
    'INSERT INTO operation_transport '+
    '(kilometrage_attendu, transporteur_id, assure_id) '+
    'VALUES ($1, $2, $3) RETURNING *'

    pool.query(qry,[kilometrage_attendu, transporteur_id, assure_id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET: op_transport/state/:etat (r : realisé, nr : non realisé, ec : en cours, x : annulé)
const getTransportOperationInfoByState = (request, response) => {
    var etat_op = request.params.etat
    if(etat_op == 'r') etat_op = 'réalisée';
    else if (etat_op == 'nr') etat_op = 'non réalisée';
    else if (etat_op == 'ec') etat_op = 'en cours';
    else if (etat_op == 'x') etat_op = 'annulée';


    var qry = 
    'SELECT * FROM operation_transport opt, transporteurs tp, assures asr '+ 
    'WHERE opt.transporteur_id = tp.id_transporteur '+
    'AND opt.assure_id = asr.id_assure '+
    'AND etat_operation = $1 '+
    'ORDER BY opt.id_operation';

    pool.query(qry,[etat_op], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}

//GET /transporter/:id/op_transport
const getTransporterOperations = (request, response) => {
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM  transporteurs trn, operation_transport opt, assures asr '+
    'WHERE trn.id_transporteur = opt.transporteur_id '+
    'AND asr.id_assure = opt.assure_id '+
    'AND trn.id_transporteur = $1';
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//POST /transporters
const createTransporter = (request, response) =>{
    const {nom, prenom, operateur_id} = request.body;
    var qry = 
    'INSERT INTO transporteurs '+
    '(nom_transporteur, prenom_transporteur, operateur_id) '+
    'VALUES ($1, $2, $3) RETURNING *';

    pool.query(qry, [nom, prenom, operateur_id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}

//GET: /transporters/:id
const getTransporterInfoById = (request, response) =>{
    
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * from transporteurs trn, operateurs op '+
    'WHERE trn.operateur_id = op.id_operateur '+
    'AND trn.id_transporteur = $1';

    pool.query(qry, [id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET /transporter/:id/op_transport/state/:etat
const getTransporterOperationsByState = (request, response) => {
    var etat_op = request.params.etat
    if(etat_op == 'r') etat_op = 'réalisée';
    else if (etat_op == 'nr') etat_op = 'non réalisée';
    else if (etat_op == 'ec') etat_op = 'en cours';
    else if (etat_op == 'x') etat_op = 'annulée';

    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM  transporteurs trn, operation_transport opt, assures asr '+
    'WHERE trn.id_transporteur = opt.transporteur_id '+
    'AND asr.id_assure = opt.assure_id '+
    'AND trn.id_transporteur = $1 '+
    'AND opt.etat_operation = $2';

    pool.query(qry,[id, etat_op], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET: /operateurs
const getOperateurs = (request, response) =>{
    var qry = 'SELECT * FROM operateurs op';
    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET: /operatuers/:id/transporters
const getOperateursTransporters = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM operateurs op, transporteurs trn '+
    'WHERE op.id_operateur = $1 '+
    'AND op.id_operateur = trn.operateur_id '+
    'ORDER BY id_operateur';
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}


//POST /assure
const createAssure = (request, response) =>{
    const {nom,prenom, date_naiss, num_ss} = request.body;

    var qry = 
    'INSERT INTO assures '+
    '(nom_ass, prenom_ass, date_naiss, num_ss) '+
    'VALUES ($1, $2, $3, $4) RETURNING *';
    pool.query(qry,[nom, prenom, date_naiss, num_ss] ,(err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}
//GET: /assures
const getAssures = (request, response) =>{
    var qry = 
    'SELECT * FROM assures';
    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET /assures/:id/info
const getAssuresById = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM assures '+
    'WHERE id_assure = $1';
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET /reclamations-assure
const getReclamations = (request, response) =>{
    var qry = 
    'SELECT * FROM reclamation_ass recl, assures asr '+
    'WHERE asr.id_assure = recl.assure_id '+
    'ORDER BY asr.id_assure';

    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}

//POST /reclamation-assure
const createReclamation = (request, response) =>{
    const {id_assure, sujet, details,id_op} = request.body;
    var qry = 
    'INSERT INTO reclamation_ass '+
    '(assure_id, sujet_reclamation_ass, details_reclamation_ass, operateur_id) '+
    'VALUES ($1, $2,$3, $4) RETURNING *';
    pool.query(qry, [id_assure, sujet, details, id_op],(err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET /reclamations-assure/stats/state
const getReclamationsStats = (request, response) =>{
    var qry = 
    'select etat_rec_ass, COUNT(id_reclamation_ass) rec_count '+ 
    'FROM reclamation_ass GROUP BY etat_rec_ass';

    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}

//GET /reclamations-assure/state/:etat
const getReclamationsByState = (request, response) => {
    var etat = request.params.etat;
    if(etat == 't') etat = 'traitée';
    else if(etat == 'nt') etat = 'non traitée';
    else if (etat == 'ec') etat = 'en cours';

    var qry = 
    'SELECT * FROM reclamation_ass recl, assures asr, operateurs op '+
    'WHERE asr.id_assure = recl.assure_id '+
    'AND recl.operateur_id = op.id_operateur '+
    'AND recl.etat_rec_ass = $1'+
    'ORDER BY asr.id_assure';

    pool.query(qry,[etat], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })


}

//GET /reclamations-assure/reclamation:id
const getReclamationsIdRec = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM reclamation_ass recl, assures asr, operateurs op '+
    'WHERE asr.id_assure = recl.assure_id '+
    'AND recl.operateur_id = op.id_operateur '+
    'AND recl.id_reclamation_ass = $1'+
    'ORDER BY asr.id_assure';

    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}


//GET /reclamations-assure/assure/:id
const getReclamationsIdAssure = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    'SELECT * FROM reclamation_ass recl, assures asr, operateurs op '+
    'WHERE asr.id_assure = recl.assure_id '+
    'AND recl.operateur_id = op.id_operateur '+
    'AND asr.id_assure = $1'+
    'ORDER BY asr.id_assure';

    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}


//POST /demandes
const createDemande = (request, response) =>{
    const {date_demande, assure_id, operateur_id} = request.body;
    var qry = 
    'INSERT INTO demandes '+ 
    '(date_demande, assure_id, operateur_id) '+
    'VALUES ($1, $2, $3) RETURNING *'
    
    pool.query(qry,[date_demande, assure_id, operateur_id], (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}

//GET: /demandes
const getDetailsDemande = (request, response) =>{
    var qry = 'SELECT assu.*, dem.* FROM assures assu, demandes dem WHERE assu.id_assure = dem.assure_id';
    pool.query(qry, (err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })

}

//PUT /demandes/:id/state/:etat (t, nt, ec)
const setDemandeState = (request, response) =>{
    const id = parseInt(request.params.id);
    var etat = request.params.etat;
    if(etat == 't') etat = 'traitée';
    else if(etat == 'nt') etat = 'non traitée';
    else if (etat == 'ec') etat = 'en cours';

    var qry = 
    'UPDATE demandes '+
    'SET etat_demande = $1 '+
    'WHERE id_demande = $2 '+
    'RETURNING *';

    pool.query(qry,[etat, id] ,(err, res) => {
        if(err)
        {
            throw err;
        }
        response.status(200).json(res.rows);
    })
}



module.exports = {
    getTransportOperationInfo,
    createOperation,
    getTransportOperationInfoByState,
    
    createTransporter,
    getTransporterInfoById,
    getTransporterOperations,
    getTransporterOperationsByState,

    getOperateurs,
    getOperateursTransporters,

    createDemande,
    getDetailsDemande,
    setDemandeState,

    createReclamation,
    getReclamations,
    getReclamationsByState,
    getReclamationsStats,
    getReclamationsIdRec,
    getReclamationsIdAssure,

    createAssure,
    getAssures,
    getAssuresById,

    

}