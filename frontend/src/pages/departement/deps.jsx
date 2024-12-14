import { faChurch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper';
import { FormSelect } from '../../components/Inputbox/form-select';
import Badge from '../../components/buttons/badge';

const Deps = ({ eglises, deps, departement, activeDep, setActiveDep, activeEglise, handleChurchChange }) => {
    return (
        <>
            <div className="card mt-0 job-right-header mb-sm-4 mb-xl-0" style={{ height: '72vh', overflowY: 'auto' }}>
                <div className="card-header  border-bottom p-3" style={{backgroundColor:'#cbd5e1',}}>
                    <h5><i className="icofont icofont-filter m-r-5"></i>Departements</h5>
                </div>
                <div className="card-body mt-2">
                    <ContentPermsWrapper requiredPerms={['voir_touts_departements']}>
                        <div className="form-group row my-1">
                            <div className='col-sm-5'>
                                <label className='col-form-label'>
                                    <FontAwesomeIcon icon={faChurch} className='me-1' />
                                    Eglises
                                </label>
                            </div>
                            <div className="col-sm-7">
                                <FormSelect
                                    placeholder='Eglises'
                                    name='eglise' onChange={(e) => handleChurchChange(eglises, e.target.value)} value={activeEglise}
                                >
                                    {eglises.map(eglise =>
                                        <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                    )}
                                </FormSelect>
                            </div>
                        </div>
                    </ContentPermsWrapper>
                    <hr />

                    <ul className='list-group list-group-flush'>
                        {deps.map((dep) =>
                            <li as={'button'}
                                key={dep.id}
                                onClick={() => { setActiveDep(dep.id); }}
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action ${dep.id === departement.id ? 'state btn-active' : 'state'}`}
                            >
                                {dep.department_name}
                                <span className='float-end fw-bold'>
                                    {/* {activeDep == dep.id && */}
                                        <Badge color='primary' text={dep.member?.length} />
                                    {/* } */}
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Deps