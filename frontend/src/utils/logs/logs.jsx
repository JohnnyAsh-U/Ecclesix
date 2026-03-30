// import { formatDate } from "../../utils/utils"
import { formatDate } from "../datetime/formatdate"


export const LogPhrase = (log) => {
    let nom = log.admin_name?.name
    let resource = log.detail.resource
    let objet = log.detail.lib

    if (log.log_type === 'VIEW') {
        if (resource == 'Profile' && nom == objet) {
            return <>{nom} a vu son profile</>
        } else if (resource == 'Profile') {
            return <>{nom} a vu le Profile de {objet}</>
        }
        return <>
            <>{nom} </>a vu la page {resource}
        </>
    } else if (log.log_type === 'AUTH') {
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
    } else if (log.log_type === 'UPDATE') {
        if (resource == "Admin" && log.detail.changes.new.admin == true) {
            return <>{nom} a nommé {objet} Admin</>
        } else if (resource == "Admin" && log.detail.changes.new.admin == false) {
            return <>{nom} a revoké les droits d'admin de {objet}</>
        } else if (resource == 'Membre-Role') {
            return <>{nom} a modifié le role de {objet}</>
        }
        if (resource == "SuperAdmin" && log.detail.changes.new.superadmin == true) {
            return <>{nom} a nommé {objet} SuperAdmin</>
        } else if (resource == "SuperAdmin" && log.detail.changes.new.superadmin == false) {
            return <>{nom} a revoké les droits de superadmin de {objet}</>
        }

        if (resource == "Membre-Activation") {
            return <>{nom} a activé {objet}</>
        } else if (resource == "Membre-Desactivation") {
            return <>{nom} a desactivé {objet}</>
        }

        if (resource == "Transaction" && log.detail.statut == 'Validated') {
            return <>{nom} a confirmé {resource} {objet}</>
        } else if (resource == "Transaction" && log.detail.statut == 'Rejected') {
            return <>{nom} a rejecté {resource} {objet}</>
        }
        if(resource =="Membre-Relation"){
            if(log.detail.action == "INSERT"){
                return <>{nom} a ajouté une relation dans le profile de {objet}</>
            }
            if(log.detail.action == "DELETE"){
                return <>{nom} a supprimé une relation dans le profile de {objet}</>
            }
        }

        return <>{nom} a modifié {resource} {objet}</>

    } else if (log.log_type === 'INSERT') {
        if (resource == 'Departement-Membre') {
            return <>{nom} a ajouté {objet} au Departement {log.detail.dep}</>
        }
        return <>{nom} a ajouté un(e) {resource} {objet}</>
    } else {
        if (resource === 'Evenement') {
            return <>
                <>{nom} </>a supprimé Evenement {objet} du {formatDate(log.detail.date_evenement)} {log.detail.eglise_evenement}
            </>
        } else if (resource === 'Departement-Membre') {
            return <>
                {nom} a retiré {objet} du Departement {log.detail.dep}
            </>
        }
        return <>
            <>{nom} </>a supprimé {resource} {objet}
        </>
    }
}


