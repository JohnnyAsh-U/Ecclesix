import React from "react";

const Dashboard = React.lazy(() => import('../../pages/dashboard/dashboard'))
const OverviewDashboard = React.lazy(() => import('../../pages/dashboard/overview'))
const GrowthDashboard = React.lazy(() => import('../../pages/dashboard/growth'))
const MembersDashboard = React.lazy(() => import('../../pages/dashboard/membersDashboard'))
const DepartmentsDashboard = React.lazy(() => import('../../pages/dashboard/departmentsDashboard'))
const AttendanceDashboard = React.lazy(() => import('../../pages/dashboard/attendanceDashboard'))
const BranchesDashboard = React.lazy(() => import('../../pages/dashboard/branchesDashboard'))
const InsightsDashboard = React.lazy(() => import('../../pages/dashboard/insightsDashboard'))
const Membres = React.lazy(() => import('../../pages/membre'))
const AjouterMembre = React.lazy(() => import('../../pages/ajouter-membre'))
const Profile = React.lazy(() => import('../../pages/profile'))
const Departements = React.lazy(() => import('../../pages/departement'))
const Admins = React.lazy(() => import('../../pages/admins'))
const Evenements = React.lazy(() => import('../../pages/evenement'))
const Mediatheque = React.lazy(() => import('../../pages/mediatheque'))
const Logs = React.lazy(()=>import('../../pages/logs'))
const Eglises = React.lazy(()=>import('../../pages/eglise'))
const Parametres = React.lazy(()=>import('../../pages/parametres'))
const Abonnement = React.lazy(() => import('../../pages/billing'))
const Support = React.lazy(() => import('../../pages/support'))
const Communication = React.lazy(() => import('../../pages/communication'))
const CommunicationSend = React.lazy(() => import('../../pages/communication'))
const CommunicationAnnouncements = React.lazy(() => import('../../pages/communication/announcements'))
const Rapports = React.lazy(()=>import('../../pages/finance/rapports'))
const Transactions = React.lazy(()=>import('../../pages/finance/transactions'))
const Budgets = React.lazy(()=>import('../../pages/finance/budgets'))
const FinanceLog = React.lazy(()=>import('../../pages/finance/logs'))
const EventDetail = React.lazy(() => import('../../pages/evenementDetail'))


export const routes = [
  // { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard/overview', name: 'Executive Dashboard', element: OverviewDashboard, PermissionRequises: [] },
  { path: '/dashboard/analyses', name: 'Departments Dashboard', element: DepartmentsDashboard, PermissionRequises: [] },
  { path: '/dashboard/departments', name: 'Departments Dashboard', element: DepartmentsDashboard, PermissionRequises: [] },
  { path: '/dashboard/growth', name: 'Growth Dashboard', element: GrowthDashboard, PermissionRequises: [] },
  { path: '/dashboard/attendance', name: 'Attendance Dashboard', element: AttendanceDashboard, PermissionRequises: [] },
  { path: '/dashboard/branches', name: 'Branches Dashboard', element: BranchesDashboard, PermissionRequises: [] },
  { path: '/dashboard/insights', name: 'Insights Dashboard', element: InsightsDashboard, PermissionRequises: [] },
  { path: '/dashboard/finances', name: 'Growth Dashboard', element: GrowthDashboard, PermissionRequises: [] },
  { path: '/dashboard/membres', name: 'Members Dashboard', element: Dashboard, PermissionRequises: [] },
  { path: '/dashboard/members', name: 'Members Dashboard', element: MembersDashboard, PermissionRequises: [] },
  { path: '/membres', name: 'Membres', element: Membres, PermissionRequises: ['voir_membre', 'voir_touts_membres'] },
  
  {
    path: '/communication',
    name: 'Communication',
    element: Communication,
    PermissionRequises: ['envoyer_communication', 'envoyer_toutes_communications']
  },
  {
    path: '/communication/send',
    name: 'Email/SMS',
    element: CommunicationSend,
    PermissionRequises: ['envoyer_communication', 'envoyer_toutes_communications']
  },
  {
    path: '/communication/announcements',
    name: 'Annonces',
    element: CommunicationAnnouncements,
    PermissionRequises: ['envoyer_communication', 'envoyer_toutes_communications']
  },

  { path: '/membres/ajouter', name: 'Ajouter Membre', element: AjouterMembre, PermissionRequises: ['ajouter_membre'] },
  { path: '/membres/profile/:id', name: "Profile", element: Profile, PermissionRequises: [] },
  {
    path: '/departements',
    name: "Departements",
    element: Departements,
    PermissionRequises: ['voir_departement', 'voir_touts_departements', 'chef_departement']
  },
  {
    path: '/admins',
    name: "Admins",
    element: Admins,
    PermissionRequises: ['superAdmin']
  },
  {
    path: '/evenements',
    name: "Evenements",
    element: Evenements,
    PermissionRequises: ['voir_evenement', 'voir_touts_evenements']
  },
  {
    path: '/eglise/:id',
    name: 'Eglises',
    element: Eglises,
    PermissionRequises: []
  },
  {
    path: '/finances/rapports',
    name: "Rapports",
    element: Rapports,
    PermissionRequises: ['voir_finance', 'voir_toutes_finances']
  },
  {
    path: '/finances/transactions',
    name: "Transactions",
    element: Transactions,
    PermissionRequises: ['voir_finance', 'voir_toutes_finances']
  },
  {
    path: '/finances/budgets',
    name: "Budgets",
    element: Budgets,
    PermissionRequises: ['voir_finance', 'voir_toutes_finances']
  },
  {
    path: '/finances/logs',
    name: "Finance Logs",
    element: FinanceLog,
    PermissionRequises: ['voir_financelog']
  },
  {
    path: '/logs',
    name: "Logs",
    element: Logs,
    PermissionRequises: ['voir_adminlog']
  },
  {
    path: '/abonnement',
    name: "Abonnement",
    element: Abonnement,
    PermissionRequises: ['superAdmin']
  },
  {
    path: '/support',
    name: "Support",
    element: Support,
    PermissionRequises: []
  },
  { 
    path: '/parametres', 
    name: "Parametres", 
    element: Parametres, 
    PermissionRequises: ['superAdmin'] 
  },
  { 
    path: '/evenements/:eventId', 
    name: "Details Evenement", 
    element: EventDetail, 
    PermissionRequises: ['ajouter_evenement'] 
  },
  {
    path: '/mediatheques',
    name: 'Mediatheques',
    element: Mediatheque,
    PermissionRequises: ['voir_mediatheque']
  }
]