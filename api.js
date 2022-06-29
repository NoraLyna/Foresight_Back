const client = require('./connection')
const express = require('express');
const { response, request } = require('express');
const app = express();
const pool = client.pool;


//Calcule des prix
function CalculeRemboursement(d_parcourue, d_operateur, tmp_wait, type_trans)
{
    var val = 0;
    if(type_trans == 'ambulance_medicalisee')
    {
        if(d_parcourue < 100) val = 27 * d_parcourue;
        else val = (27 * 100) + (d_parcourue - 100) * 19;
    }
    if(type_trans == 'ambulance_sanitaire')
    {
        if(d_parcourue < 100) val = 18 * d_parcourue;
        else val = (18 * 100) + (d_parcourue - 100) * 13.5;
    }
    if(type_trans == 'vehicule_leger')
    {
        if(d_parcourue < 100) val = 12 * d_parcourue;
        else val = (12 * 100) + (d_parcourue - 100) * 9;
    }

    var addi = 0;
    if(d_operateur < 20 ) addi = 100;
    if(d_operateur > 20 && d_operateur < 50) addi = 200;
    if(d_operateur >50 && d_operateur <100) addi = 300;
    if(d_operateur > 100) addi = (d_operateur / 100) * 150;

    addi += (tmp_wait/15 * 25);
    val += addi;
    console.log(val);
    return {montant:val};

}


//GET: /op_transport
const getOperationInfo = (request, response) => {
    var qry = 
    `SELECT * FROM operation_transport opt, transporteurs tp, assures asr , vehicules veh
    WHERE opt.transporteur_id = tp.id_transporteur 
    AND opt.assure_id = asr.id_assure 
    AND veh.id_vehicule = opt.vehicule_id
    ORDER BY opt.id_operation`
    ;
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//POST /op_transport
const createOperation = (request, response) =>{
    const {kilometrage_attendu, transporteur_id, assure_id, vehicule_id} = request.body;

    var qry =
    `INSERT INTO operation_transport 
    (kilometrage_attendu, transporteur_id, assure_id, vehicule_id) 
    VALUES ($1, $2, $3, $4) RETURNING *`;

    pool.query(qry,[kilometrage_attendu, transporteur_id, assure_id, vehicule_id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET /op_transport/:id/refund
const getMontantRemboursement = (request, response) =>{
    const id = request.params.id;
    var qry = 
    `SELECT * FROM operation_transport opt, vehicules veh 
    WHERE opt.id_operation = $1
    AND veh.id_vehicule = opt.vehicule_id`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else
        {
            console.log(res.rows);
            var d_parcourue = parseFloat(res.rows[0]['distance_parcourue']);
            var d_operateur = parseFloat(res.rows[0]['dist_ass_op']);
            var tmp_att = parseFloat(res.rows[0]['temps_attendu']);
            var type_trans = parseFloat(res.rows[0]['type_vehicule']);
            var mnt = CalculeRemboursement(d_parcourue, d_operateur, tmp_att, type_trans);
            response.status(200).json(mnt);

        }
    })
    
}

//GET /op_transport/stats/state
const getOperationsStats = (request, response) =>{
    var qry = 
    `SELECT etat_operation, COUNT(id_operation) 
    FROM operation_transport opt
    GROUP BY etat_operation`;

    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400)
        }
        else response.status(200).json(res.rows);
    })

}

//GET: op_transport/state/:etat (r : realisé, nr : non realisé, ec : en cours, x : annulé)
const getOperationInfoByState = (request, response) => {
    var etat_op = request.params.etat
    if(etat_op == 'r') etat_op = 'réalisée';
    else if (etat_op == 'nr') etat_op = 'non réalisée';
    else if (etat_op == 'ec') etat_op = 'en cours';
    else if (etat_op == 'x') etat_op = 'annulée';


    var qry = 
    `SELECT * FROM operation_transport opt, transporteurs tp, assures asr, vehicules veh 
    WHERE opt.transporteur_id = tp.id_transporteur 
    AND opt.assure_id = asr.id_assure 
    AND etat_operation = $1 
    AND veh.id_vehicule = opt.vehicule_id
    ORDER BY opt.id_operation`;

    pool.query(qry,[etat_op], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//GET /transporter/:id/op_transport
const getTransporterOperations = (request, response) => {
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * FROM  transporteurs trn, operation_transport opt, assures asr, vehicules veh 
    WHERE trn.id_transporteur = opt.transporteur_id 
    AND asr.id_assure = opt.assure_id 
    AND veh.id_vehicule = opt.vehicule_id
    AND trn.id_transporteur = $1`;

    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//POST /transporters
const createTransporter = (request, response) =>{
    const {nom, prenom, operateur_id} = request.body;
    var qry = 
    `INSERT INTO transporteurs 
    (nom_transporteur, prenom_transporteur, operateur_id) 
    VALUES ($1, $2, $3) RETURNING *`;

    pool.query(qry, [nom, prenom, operateur_id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//GET: /transporters/:id
const getTransporterInfoById = (request, response) =>{
    
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * from transporteurs trn, operateurs op 
    WHERE trn.operateur_id = op.id_operateur 
    AND trn.id_transporteur = $1`;

    pool.query(qry, [id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
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
    `SELECT * FROM  transporteurs trn, operation_transport opt, assures asr 
    WHERE trn.id_transporteur = opt.transporteur_id 
    AND asr.id_assure = opt.assure_id 
    AND trn.id_transporteur = $1 
    AND opt.etat_operation = $2`;

    pool.query(qry,[id, etat_op], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//POST /operateur
const createOperateur = (request, response) =>{
    const {adresse_operateur, nom_operateur, email_operateur, pwd_operateur} = request.body;
    qry = 
    `INSERT INTO operateurs
    (adresse_operateur, nom_operateur, email_operateur, pwd_operateur)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
    pool.query(qry,
        [adresse_operateur, nom_operateur, email_operateur, pwd_operateur],
        (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//GET: /operateurs
const getOperateurs = (request, response) =>{
    var qry = 'SELECT * FROM operateurs op';
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else
        {
            //response.status(200).json(res.rows);
            response.send(res.rows);
            //console.log('')
        }
    })
}

//GET /operateur/:id
const getOperateurById = (request, response) =>{
    const id = request.params.id;
    var qry = 
    `SELECT * FROM operateurs WHERE id_operateur = $1`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET: /operateurs/by-email/:mail
const getOperateurByEmail = (request, response) =>{
    const email = request.params.mail;
    var qry = 
    `SELECT * FROM operateurs WHERE email_operateur = $1`;
    pool.query(qry,[email], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}



//GET /operateur/:id/op_transport
const getOperateursOperations = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * from operateurs op, operation_transport opt, transporteurs trn, assures asr
    WHERE op.id_operateur = $1
    AND opt.transporteur_id = trn.id_transporteur
    AND opt.assure_id = asr.id_assure
    AND trn.operateur_id = op.id_operateur
    ORDER BY op.id_operateur` ;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET /operateur/:id/op_transport/stats/state
const getOperateurOperationsStats = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT xs.id_operateur, xs.nom_operateur,xs.etat_operation, COUNT(xs.id_operation) FROM
    (SELECT * from operateurs op, operation_transport opt, transporteurs trn, assures asr
    WHERE op.id_operateur = $1
    AND opt.transporteur_id = trn.id_transporteur
    AND opt.assure_id = asr.id_assure
    AND trn.operateur_id = op.id_operateur
    ORDER BY op.id_operateur ) as xs
    GROUP BY xs.id_operateur, xs.nom_operateur, xs.etat_operation
    ORDER BY xs.id_operateur` ;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET: /operatuers/:id/transporters
const getOperateursTransporters = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * FROM operateurs op, transporteurs trn 
    WHERE op.id_operateur = $1 
    AND op.id_operateur = trn.operateur_id 
    ORDER BY id_operateur`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET agent-cnas/
const getAgents = (request, response) =>{
    var qry = `SELECT * FROM agent_cnas ORDER BY id_agent`;
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET agent-cnass/:id
const getAgentsById = (request, response) =>{
    const id = request.params.id;
    var qry = 
    `SELECT * FROM agent_cnas 
    WHERE id_agent = $1
    ORDER BY id_agent`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET agent-cnas/by-email/:mail
const getAgentsByEmail = (request, response) =>{
    const email = request.params.mail;
    var qry = 
    `SELECT * FROM agent_cnas 
    WHERE email_agent = $1
    ORDER BY id_agent`;
    pool.query(qry,[email], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}


//POST /assure
const createAssure = (request, response) =>{
    const {nom,prenom, date_naiss, num_ss} = request.body;

    var qry = 
    `INSERT INTO assures 
    (nom_ass, prenom_ass, date_naiss, num_ss) 
    VALUES ($1, $2, $3, $4) RETURNING *`;
    pool.query(qry,[nom, prenom, date_naiss, num_ss] ,(err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}
//GET: /assures
const getAssures = (request, response) =>{
    var qry = 
    'SELECT * FROM assures';
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET /assures/:id/info
const getAssuresById = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * FROM assures 
    WHERE id_assure = $1`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET /reclamations-assure
const getReclamations = (request, response) =>{
    var qry = 
    `SELECT * FROM reclamation_ass recl, assures asr 
    WHERE asr.id_assure = recl.assure_id 
    ORDER BY asr.id_assure`;

    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//POST /reclamation-assure
const createReclamation = (request, response) =>{
    const {id_assure, sujet, details,id_op} = request.body;
    var qry = 
    `INSERT INTO reclamation_ass 
    (assure_id, sujet_reclamation_ass, details_reclamation_ass, operateur_id) 
    VALUES ($1, $2,$3, $4) RETURNING *`;
    pool.query(qry, [id_assure, sujet, details, id_op],(err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET /reclamations-assure/stats/state
const getReclamationsStats = (request, response) =>{
    var qry = 
    `select etat_rec_ass, COUNT(id_reclamation_ass) rec_count 
    FROM reclamation_ass GROUP BY etat_rec_ass`;

    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//GET /reclamations-assure/state/:etat
const getReclamationsByState = (request, response) => {
    var etat = request.params.etat;
    if(etat == 't') etat = 'traitée';
    else if(etat == 'nt') etat = 'non traitée';
    else if (etat == 'ec') etat = 'en cours';

    var qry = 
    `SELECT * FROM reclamation_ass recl, assures asr, operateurs op 
    WHERE asr.id_assure = recl.assure_id 
    AND recl.operateur_id = op.id_operateur 
    AND recl.etat_rec_ass = $1+
    ORDER BY asr.id_assure`;

    pool.query(qry,[etat], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })


}

//GET /reclamations-assure/reclamation:id
const getReclamationsIdRec = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * FROM reclamation_ass recl, assures asr, operateurs op 
    WHERE asr.id_assure = recl.assure_id 
    AND recl.operateur_id = op.id_operateur 
    AND recl.id_reclamation_ass = $1
    ORDER BY asr.id_assure`;

    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}


//GET /reclamations-assure/assure/:id
const getReclamationsIdAssure = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry = 
    `SELECT * FROM reclamation_ass recl, assures asr, operateurs op 
    WHERE asr.id_assure = recl.assure_id 
    AND recl.operateur_id = op.id_operateur 
    AND asr.id_assure = $1
    ORDER BY asr.id_assure`;

    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//POST reclamations-operateur
const createReclamationOp = (request, response) => {
    const {operateur_id, assure_id, sujet, details} = request.body;
    var qry=
    `INSERT INTO reclamation_op
    (operateur_id, assure_id, sujet_reclamation_op, details_reclamation_op)
    VALUES
    ($1,$2,$3,$4)
    RETURNING *`;
    pool.query(qry,[operateur_id, assure_id, sujet, details], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}


//GET /reclamations-operateur
const getReclamationsOp = (request, response) =>{
    var qry=
    `SELECT * FROM reclamation_op 
    ORDER BY id_reclamation_op`;
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//GET reclamations-operateur/:id
const getReclamationsOpById = (request, response) =>{
    const id = parseInt(request.params.id);
    var qry=
        `SELECT * FROM reclamation_op 
        WHERE id_reclamation_op = $1`;
    pool.query(qry,[id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })

}

//POST /demandes
const createDemande = (request, response) =>{
    const {date_demande, assure_id, operateur_id} = request.body;
    var qry = 
    `INSERT INTO demandes 
    (date_demande, assure_id, operateur_id) 
    VALUES ($1, $2, $3) RETURNING *`;
    
    pool.query(qry,[date_demande, assure_id, operateur_id], (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}

//GET: /demandes
const getDetailsDemande = (request, response) =>{
    var qry = 'SELECT assu.*, dem.* FROM assures assu, demandes dem WHERE assu.id_assure = dem.assure_id';
    pool.query(qry, (err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
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
    `UPDATE demandes 
    SET etat_demande = $1 
    WHERE id_demande = $2 
    RETURNING *`;

    pool.query(qry,[etat, id] ,(err, res) => {
        if(err)
        {
            response.status(400); response.send(err);
        }
        else response.status(200).json(res.rows);
    })
}



module.exports = {
    getOperationInfo,
    createOperation,
    getOperationInfoByState,
    getOperationsStats,
    getMontantRemboursement,
    getOperateurById,
    createTransporter,
    getTransporterInfoById,
    getTransporterOperations,
    getTransporterOperationsByState,

    getOperateurs,
    createOperateur,
    getOperateurByEmail,
    
    getOperateursTransporters,
    getOperateursOperations,
    getOperateurOperationsStats,

    getAgents,
    getAgentsById,
    getAgentsByEmail,

    createDemande,
    getDetailsDemande,
    setDemandeState,

    createReclamation,
    getReclamations,
    getReclamationsByState,
    getReclamationsStats,
    getReclamationsIdRec,
    getReclamationsIdAssure,

    getReclamationsOp,
    getReclamationsOpById,
    createReclamationOp,

    createAssure,
    getAssures,
    getAssuresById,

    

}