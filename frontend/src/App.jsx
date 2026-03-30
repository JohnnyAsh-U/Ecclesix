import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Loading from './components/Loading/loading'
import axios from './utils/config/axiosConfig'
import AppContext from './hooks/AppContext'
import CheckAuth from './utils/auth/checkAuth'

const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const Page404 = React.lazy(() => import('./pages/error/404'))
const Layout = React.lazy(() => import('./layout/layout'))
const Reset = React.lazy(() => import('./pages/auth/ResetEmail'))
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'))


function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])


  return (
    <AppContext>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route exact path='/connexion' name="Login" element={<Login />} />
          <Route exact path='/inscription' name="Register" element={<Register />} />
          <Route exact path='/reinitialisation' name="Reset" element={<Reset />} />
          <Route exact path='/reset' name="Password" element={<ResetPassword />} />
          <Route exact path='/404' name="Error" element={<Page404 />} />
          <Route path="*" name="Home" element={<CheckAuth><Layout /></CheckAuth>} />
        </Routes>
      </Suspense>
    </AppContext>
  )
}

export default App
