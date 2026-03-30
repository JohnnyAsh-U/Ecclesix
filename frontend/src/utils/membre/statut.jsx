import Badge from "../../components/buttons/badge"

export const StatutBadge = (statut) => {
    if (statut == 'Ministre') {
        return <Badge color="success" text={statut} />
    } else if (statut == 'Ouvrier') {
        return <Badge color="primary" text={statut} />
    } else if (statut == 'Membre') {
        return <Badge color="warning" text={statut} />
    } else {
        return <Badge color="danger" text={statut} />
    }
}


export const ActifStatut = (membre) => {
    if (membre.is_superuser) {
        return <Badge color='success' text={"SuperAdmin"} />
    } else if (membre.is_admin) {
        return <Badge color='success' text={"Admin"} />
    } else if (membre.is_active) {
        return <Badge color='info' text={"Actif"} />
    } else {
        return <Badge color='dark' text={"Inactif"} />
    }
}