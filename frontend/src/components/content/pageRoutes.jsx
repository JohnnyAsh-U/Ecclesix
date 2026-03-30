import React from "react";

const Dashboard = React.lazy(() => import('../../pages/dashboard/dashboard'))
const Membres = React.lazy(() => import('../../pages/membre'))
const AjouterMembre = React.lazy(() => import('../../pages/ajouter-membre'))
const Profile = React.lazy(() => import('../../pages/profile'))
const Departements = React.lazy(() => import('../../pages/departement'))
const Admins = React.lazy(() => import('../../pages/admins'))
const Evenements = React.lazy(() => import('../../pages/evenement'))
const Logs = React.lazy(()=>import('../../pages/logs'))
const Eglises = React.lazy(()=>import('../../pages/eglise'))
const Parametres = React.lazy(()=>import('../../pages/parametres'))
const Rapports = React.lazy(()=>import('../../pages/finance/rapports'))
const Transactions = React.lazy(()=>import('../../pages/finance/transactions'))
const Budgets = React.lazy(()=>import('../../pages/finance/budgets'))
const FinanceLog = React.lazy(()=>import('../../pages/finance/logs'))


export const routes = [
  // { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard/membres', name: 'Dashboard', element: Dashboard, PermissionRequises: [] },
  { path: '/membres', name: 'Membres', element: Membres, PermissionRequises: ['voir_membre', 'voir_touts_membres'] },
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
    path: '/parametres', 
    name: "Parametres", 
    element: Parametres, 
    PermissionRequises: ['superAdmin'] },
]