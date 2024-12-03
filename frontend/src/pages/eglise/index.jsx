import React, { useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { useParams } from 'react-router-dom'
import { AppGlobalContext } from '../../hooks/AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChurch, faEdit } from '@fortawesome/free-solid-svg-icons'
import Widgets from './widgets'
import useFetch from '../../hooks/fetchHook'
import { LoadingPage } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import MainChart from './mainchart'
import Demographics from './demographics'
import { ModifierModal } from './modal'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'


const Eglises = () => {
    const { eglises } = AppGlobalContext()
    const [modal, setModal] = useState(false)
    let id_eglise = useParams().id
    let egliseName = eglises.find(d => d.id_eglise == id_eglise)?.lib_eglise
    const { data, error, loading, reload } = useFetch(`/eglise/${id_eglise}`, 'get');
    const { eglise, metrics } = data || {}

    if (loading) {
        return <LoadingPage />
    }

    if (error) {
        toast.error("Impossible de charger les donnees")
        return
    }

    return (
        <div>
            <BreadCrumb icon={<FontAwesomeIcon icon={faChurch} />} title={egliseName}>
                <ContentPermsWrapper requiredPerms={['modifier_eglise']}>
                    <button className='btn btn-primary rounded btn-sm' onClick={() => setModal("modifier")}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </ContentPermsWrapper>
            </BreadCrumb>

            <Widgets
                members={metrics.sixMonthMemberCount}
                totalMembers={metrics.totalMembers}
                events={metrics.sixMonthEventCount}
                totalEvents={metrics.totalEvents}
                attendance={metrics.sixMonthAttendanceCount} />


            <MainChart
                monthData={metrics.attendanceGraphMonth}
                yearData={metrics.attendanceGraphYear}
                eglise={eglise}
                sexe={metrics.Demo_Sexe}
            />

            <Demographics
                data={metrics.ageRangeMemberCount}
                ministres={eglise.ministre_nombre}
                ouvriers={eglise.ouvrier_nombre}
                membres={eglise.membre_nombre}
                visiteurs={eglise.visiteur_nombre}
                metier={metrics.Demo_Profession}
                statut_m={metrics.Demo_Statut}
            />

            <ModifierModal
                eglise={eglise}
                modal={modal}
                setModal={setModal}
            // fetch={fetchEglise}
            />

        </div>
    )
}

export default Eglises