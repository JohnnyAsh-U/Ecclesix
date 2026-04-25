import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingPage } from '../Loading/loading';
import { routes } from './pageRoutes';
import { ToastContainer } from 'react-toastify';
import { PagePermsWrapper } from '../../utils/permissions/permwrapper';
import Announcement from '../Announcement/Announcement'


export const Content = () => {

  return (
    <div className="pcoded-inner-content">
      <div className="main-body">
        <div className="page-wrapper pb-3 ">
          <div className='page-body'>
            <Announcement message={"Maintenance prévue samedi 10h–12h. L'application pourrait être indisponible."} linkHref={'/support/announcements'} linkText={'Détails'} />
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                {routes.map((route, idx) => {
                  return (
                    route.element && (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        element={
                          <PagePermsWrapper requiredPerms={route.PermissionRequises}>
                            <route.element />
                          </PagePermsWrapper>
                        }
                      />
                    )
                  )
                })}
                <Route path="*" element={<Navigate to="dashboard/membres" replace />} />
              </Routes>
            </Suspense>
            <ToastContainer position={'bottom-right'} theme={'colored'} />
          </div>
        </div>
      </div>
    </div>
  )
}
