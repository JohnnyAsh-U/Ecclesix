import React, { useEffect, useState } from 'react'
import NewMembers from './newMembers'
import Attendance from './attendance'
import DemographicsA from './demographicsA'
import ChurchMemberCount from './churchCount'
import DemographicsB from './demographicsB'
import Widgets from './widget'
import { LoadingPage } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

const Dashboard = () => {
    let presentYear = new Date().getFullYear()
    const [year, setYear] = useState(presentYear)

    const { loading, data, error } = useFetch(`/dashboard`, 'get')
    const { lastSix: lastSixMembers, widgetMetrics, demographics } = data || {}


    if (loading) {
        return <LoadingPage />
    }

    if (error) {
        toast.error('Erreur')
        return
    }

    const years = Array.from({ length: presentYear - demographics.yearTraffic?.year + 1 }, (_, index) => presentYear - index)


    return (
        <>
        <BreadCrumb title={"Dashboard"}/>
            <div className='row'>
                <Widgets data={widgetMetrics} />
                <div className="col-md-12 col-xl-12 ">
                    <Attendance years={years} year={year} setYear={setYear} data={demographics.yearTraffic} />
                </div>
                <div className='col-md-12 col-xl-12 mt-0'>
                    <DemographicsA data={demographics.statut} />
                </div>
                <div className="col-md-12 col-xl-4">
                    <ChurchMemberCount />
                </div>
                <div className='col-md-12 col-xl-4'>
                    <DemographicsB title={"Gendre"} color={"blue"} data={demographics.sexe} />
                    <DemographicsB title={"Tranche d'age"} color={"yellow"} data={demographics.ageRange} />
                </div>
                <div className='col-md-12 col-xl-4'>
                    <DemographicsB title={"Statut M."} color={'blue'} data={demographics.statut_m} />
                    <DemographicsB title={"Profession"} color={"pink"} data={demographics.profession} />
                </div>
                <NewMembers data={lastSixMembers} />
            </div>
        </>

    )
}

export default Dashboard