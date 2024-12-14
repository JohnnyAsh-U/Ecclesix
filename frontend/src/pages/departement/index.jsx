import React, { useEffect, useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import './style.css'
import { AppGlobalContext } from '../../hooks/AppContext'
import axios from 'axios'
import Deps from './deps'
import { toast } from 'react-toastify'
import Departement from './departement'
import { LoadingPage } from '../../components/Loading/loading'
import AjouterModal from './modals'

const Departements = () => {
    const { admin } = AppGlobalContext()
    const [egliseDepartements, setegliseDepartements] = useState([])
    const [activeEglise, setActiveEglise] = useState(null)
    const [activeDep, setActiveDep] = useState(null)
    const [listeDep, setListeDep] = useState([])
    const [departement, setDepartement] = useState({})
    const [loading, setLoading] = useState(null)

    const [modal, setModal] = useState(null)

    const handleModal = () => {
        setModal(null)
    }



    const handleChurchChange = (egliseDeps, id) => {
        setActiveEglise(id)
        if (egliseDeps.length > 0) {
            let deps = egliseDeps.find(eg => eg.id == id).departments_list
            setListeDep(deps)
            setActiveDep(deps[0].id)
        }
    }


    const fetchEgliseDep = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get('/departement')
            setegliseDepartements(data);
            let eglise = admin.id_eglise;
            if (activeEglise == null) {
                if (eglise && data.find(e => e.id == eglise && e.departments_list.length > 0)) {
                    handleChurchChange(data, eglise)
                } else {
                    handleChurchChange(data, data[0]?.id)
                }
            }
        } catch (err) {
            toast.error('Echec')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchEgliseDep()
    }, [])


    return (
        <> {loading && <LoadingPage />}
            {!loading &&
                <div>
                    <BreadCrumb icon={<FontAwesomeIcon icon={faUserGroup} />} title={"Departements"} >
                        <ContentPermsWrapper requiredPerms={['ajouter_departement']}>
                            <button className='btn btn-round  btn-grd-primary btn-sm' onClick={() => setModal('ajouter-dep')}>
                                <FontAwesomeIcon icon={faUserGroup} size='lg' />
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </ContentPermsWrapper>
                    </BreadCrumb>

                    {egliseDepartements.length > 0 &&
                        <div className="row">
                            <div className="col-xl-3">
                                <Deps
                                    eglises={egliseDepartements}
                                    deps={listeDep}
                                    activeDep={activeDep}
                                    activeEglise={activeEglise}
                                    handleChurchChange={handleChurchChange}
                                    departement={departement}
                                    setActiveDep={setActiveDep}
                                />
                            </div>
                            <div className="col-xl-9">
                                <Departement
                                    activeDep={activeDep}
                                    departement={departement}
                                    setDepartement={setDepartement}
                                    activeEglise={activeEglise}
                                    setModal = {setModal}
                                    modal={modal}
                                />
                            </div>
                        </div>}
                </div>}

            <AjouterModal
                modal={modal}
                handleModal={handleModal}
                fetch={fetchEgliseDep} />
        </>

    )
}

export default Departements