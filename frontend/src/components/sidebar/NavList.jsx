
import { AppGlobalContext } from "../../hooks/AppContext"


export const NavList = () => {
    const { eglises } = AppGlobalContext()
    return [
        {
            title: 'Dashboard',
            perms: [],
        },
        {
            name: 'Dashboard',
            to: '/dashboard',
            icon: <i className="icofont icofont-chart-histogram"></i>,
            color: '#4680ff',
            perms: [],
            items: [
                {
                    name: 'Membres',
                    to: '/dashboard/membres'
                },  {
                    name: 'Finances',
                    to: '/dashboard/finances'
                }
            ]
        },
        {
            title: 'La Gestion des Membres',
            perms: ['voir_membre', 'voir_touts_departements', 'voir_departement', 'chef_departement', 'voir_touts_membres']
        },
        {
            name: 'Membres',
            to: '/membres',
            color: '#93be52',
            icon: <i className="icofont icofont-user-alt-3"></i>,
            perms: ['voir_membre', 'voir_touts_membres']
        },
        {
            name: 'Communication',
            to: '/communication',
            color: '#5fbeaa',
            icon: <i className="icofont icofont-envelope-open"></i>,
            perms: ['envoyer_communication', 'envoyer_toutes_communications']
        },
        {
            name: 'Departements',
            to: '/departements',
            color: '#ffb64d',
            icon: <i className="icofont icofont-users-social"></i>,
            perms: ['voir_departement', 'voir_touts_departements', 'chef_departement']
        },
        {
            name: 'Admins',
            to: '/admins',
            color: '#ab7967',
            icon: <i className="icofont icofont-user-alt-5"></i>,
            perms: ['superAdmin']
        },
        {
            title: 'La Gestion Des Eglises',
            perms: []
        },
        {
            name: 'Evenements',
            to: '/evenements',
            icon: <i className="icofont icofont-calendar"></i>,
            color: '#39adb5',
            perms: ['voir_evenement', 'voir_touts_evenements']
        },
        {
            name: 'Eglises',
            to: '/eglise',
            icon: <i className="icofont icofont-court"></i>,
            color: '#4680ff',
            perms: [],
            items: eglises.map(e=>({name: e.church_name, to: '/eglise/'+e.id}))
        },
        {
            name: 'Finances',
            to: '/finances',
            icon: <i className="icofont icofont-money-bag"></i>,
            color: '#fc6180',
            perms: ['voir_finance', 'voir_toutes_finances'],
            items: [
                {
                    name: 'Rapports',
                    to: '/finances/rapports',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {

                    name: 'Transactions',
                    to: '/finances/transactions',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {

                    name: 'Budgets',
                    to: '/finances/budgets',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {
                    name: 'Logs',
                    to: '/finances/logs',
                    perms: ['voir_financelog']
                },
            ]
        },
        {
            title: 'Admin',
            perms: ['superAdmin', 'voir_adminlog']
        },
        {
            name: 'Admin Logs',
            to: '/logs',
            icon: <i className="icofont icofont-paperclip"></i>,
            color: '#93be52',
            perms: ['voir_adminlog']
        },
        {
            name: 'Parametres',
            to: '/parametres',
            icon: <i className="icofont icofont-gear"></i>,
            color: '#ffb64d',
            perms: ['superAdmin']
        },
    ]
}
