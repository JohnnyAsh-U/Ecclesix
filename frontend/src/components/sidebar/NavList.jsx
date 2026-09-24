import { AppGlobalContext } from "../../hooks/AppContext"
import { useTranslation } from "react-i18next"

export const useNavList = () => {
    const { eglises } = AppGlobalContext()
    const { t } = useTranslation()

    return [
        {
            title: t('nav.dashboard'),
            perms: [],
        },
        {
            name: t('nav.dashboard'),
            to: '/dashboard',
            icon: <i className="icofont icofont-chart-histogram"></i>,
            color: '#4680ff',
            perms: [],
            items: [
                {
                    name: t('nav.members'),
                    to: '/dashboard/membres'
                },
            ]
        },
        {
            title: t('nav.membersManagement'),
            perms: ['voir_membre', 'voir_touts_departements', 'voir_departement', 'chef_departement', 'voir_touts_membres']
        },
        {
            name: t('nav.members'),
            to: '/membres',
            color: '#93be52',
            icon: <i className="icofont icofont-user-alt-3"></i>,
            perms: ['voir_membre', 'voir_touts_membres']
        },
        {
            name: t('nav.communication'),
            to: '/communication',
            color: '#5fbeaa',
            icon: <i className="icofont icofont-envelope-open"></i>,
            perms: ['envoyer_communication', 'envoyer_toutes_communications'],
            items: [
                {
                    name: t('nav.announcements'),
                    to: '/communication/announcements',
                    perms: ['envoyer_communication', 'envoyer_toutes_communications']
                }
            ]
        },
        {
            name: t('nav.departments'),
            to: '/departements',
            color: '#ffb64d',
            icon: <i className="icofont icofont-users-social"></i>,
            perms: ['voir_departement', 'voir_touts_departements', 'chef_departement']
        },
        {
            name: t('nav.admins'),
            to: '/admins',
            color: '#ab7967',
            icon: <i className="icofont icofont-user-alt-5"></i>,
            perms: ['superAdmin']
        },
        {
            title: t('nav.churchManagement'),
            perms: []
        },
        {
            name: t('nav.events'),
            to: '/evenements',
            icon: <i className="icofont icofont-calendar"></i>,
            color: '#39adb5',
            perms: ['voir_evenement', 'voir_touts_evenements']
        },
        {
            name: t('nav.mediaLibrary'),
            to: '/mediatheques',
            icon: <i className="icofont icofont-film"></i>,
            color: '#ff6b6b',
            perms: ['voir_mediatheque']
        },
        {
            name: t('nav.churches'),
            to: '/eglise' + (eglises.length > 0 ? '/' + eglises[0].id : ''),
            icon: <i className="icofont icofont-court"></i>,
            color: '#4680ff',
            perms: [],
        },
        {
            name: t('nav.finances'),
            to: '/finances',
            icon: <i className="icofont icofont-money-bag"></i>,
            color: '#fc6180',
            perms: ['voir_finance', 'voir_toutes_finances'],
            items: [
                {
                    name: t('nav.reports'),
                    to: '/finances/rapports',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {
                    name: t('nav.transactions'),
                    to: '/finances/transactions',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {
                    name: t('nav.budgets'),
                    to: '/finances/budgets',
                    perms: ['voir_finance', 'voir_toutes_finances']
                },
                {
                    name: t('nav.logs'),
                    to: '/finances/logs',
                    perms: ['voir_financelog']
                },
            ]
        },
        {
            title: t('nav.admin'),
            perms: ['superAdmin', 'voir_adminlog']
        },
        {
            name: t('nav.adminLogs'),
            to: '/logs',
            icon: <i className="icofont icofont-paperclip"></i>,
            color: '#93be52',
            perms: ['voir_adminlog']
        },
        {
            name: t('nav.settings'),
            to: '/parametres',
            icon: <i className="icofont icofont-gear"></i>,
            color: '#ffb64d',
            perms: ['superAdmin']
        },
    ]
}
