// import { formatDate } from "../../utils/utils"
import { formatDate } from "../datetime/formatdate"


export const LogPhrase = (log) => {
    let nom = log.membre.prenom + ' ' + log.membre.nom
    let resource = log.details.resource
    let objet = log.details.lib

    if (log.type_log === 'VIEW') {
        if (resource == 'Profile' && nom == objet) {
            return <>{nom} a vu son profile</>
        } else if (resource == 'Profile') {
            return <>{nom} a vu le Profile de {objet}</>
        }
        return <>
            <>{nom} </>a vu la page {resource}
        </>
    } else if (log.type_log === 'AUTH') {
        let phrase = ''
        if (resource == 'Connexion') {
            phrase = "s'est connecté"
        } else if (resource == 'Inscription') {
            phrase = "s'est inscrire"
        } else if (resource == 'Deconnexion') {
            phrase = "s'est deconnecté"
        } else {
            phrase = "a reinitialisé son mot de passe"
        }
        return <>{nom} {phrase}</>
    } else if (log.type_log === 'UPDATE') {
        if (resource == "Admin" && log.details.changes.new.admin == true) {
            return <>{nom} a nommé {objet} Admin</>
        } else if (resource == "Admin" && log.details.changes.new.admin == false) {
            return <>{nom} a revoké les droits d'admin de {objet}</>
        } else if (resource == 'Membre-Role') {
            return <>{nom} a modifié le role de {objet}</>
        }
        if (resource == "SuperAdmin" && log.details.changes.new.superadmin == true) {
            return <>{nom} a nommé {objet} SuperAdmin</>
        } else if (resource == "SuperAdmin" && log.details.changes.new.superadmin == false) {
            return <>{nom} a revoké les droits de superadmin de {objet}</>
        }

        if (resource == "Membre-Activation") {
            return <>{nom} a activé {objet}</>
        } else if (resource == "Membre-Desactivation") {
            return <>{nom} a desactivé {objet}</>
        }

        if (resource == "Transaction" && log.details.statut == 'Validated') {
            return <>{nom} a confirmé {resource} {objet}</>
        } else if (resource == "Transaction" && log.details.statut == 'Rejected') {
            return <>{nom} a rejecté {resource} {objet}</>
        }

        return <>{nom} a modifié {resource} {objet}</>

    } else if (log.type_log === 'INSERT') {
        if (resource == 'Departement-Membre') {
            return <>{nom} a ajouté {objet} au Departement {log.details.dep}</>
        }
        return <>{nom} a ajouté un(e) {resource} {objet}</>
    } else {
        if (resource === 'Evenement') {
            return <>
                <>{nom} </>a supprimé Evenement {objet} du {formatDate(log.details.date_evenement)} {log.details.eglise_evenement}
            </>
        } else if (resource === 'Departement-Membre') {
            return <>
                {nom} a retiré {objet} du Departement {log.details.dep}
            </>
        }
        return <>
            <>{nom} </>a supprimé {resource} {objet}
        </>
    }
}


