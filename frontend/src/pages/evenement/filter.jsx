import React from 'react'
import { FormSelect } from '../../components/Inputbox/form-select'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { list_month } from '../../utils/datetime/month'

const Filter = ({ handleChange, firstDate, listetype, filters, filterDefault }) => {
    const { eglises } = AppGlobalContext()

    let annee = new Date().getFullYear()
    let eventfirstyear = new Date(firstDate)?.getFullYear()

    const yearslist = Array.from({ length: annee - eventfirstyear + 1 }, (_, index) => annee - index)

    return (
        <div className="card mt-0 job-right-header mb-sm-4 mb-xl-0" style={{ height: '72vh', overflowY: 'auto' }}>
            <div className="card-header">
                <h5><i className="icofont icofont-filter m-r-5"></i>Filtre</h5>
                <span
                    className='float-end btn btn-xs py-0 px-1 btn-default'
                    onClick={() => { filterDefault() }}
                >
                    <FontAwesomeIcon icon={faTimesCircle} />
                </span>
            </div>
            <div className="card-body">
                <form action="#">
                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Type
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                placeholder='type_evenement'
                                value={filters.type_evenement}
                                onChange={({ target }) => handleChange(target.name, target.value)}
                                name='type_evenement'>
                                <option value={"tout"}>Tout</option>
                                {listetype.map((type) =>
                                    <option value={type.id} key={type.id}>{type.event_type_name}</option>
                                )}
                            </FormSelect>
                        </div>
                    </div>
                    <ContentPermsWrapper requiredPerms={['superAdmin', 'voir_touts_membres']}>
                        <div className="form-group row mb-1">
                            <div className='col-sm-4'>
                                <label className='col-form-label'>
                                    Eglise :
                                </label>
                            </div>
                            <div className="col-sm-8">
                                <FormSelect name='eglise' onChange={(e) => handleChange('eglise', e.target.value)} value={filters.eglise}>
                                    <option value={"tout"}>Tout</option>
                                    {eglises.map(eglise =>
                                        <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                    )}
                                </FormSelect>
                            </div>
                        </div>
                    </ContentPermsWrapper>

                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Mois
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                value={filters.mois}
                                onChange={({ target }) => handleChange(target.name, target.value)}
                                name='mois'>
                                <option key={'tout'} value={'tout'}>Tout</option>
                                {list_month.map((mon, id) =>
                                    <option key={id} value={id}>{mon}</option>
                                )}
                            </FormSelect>
                        </div>
                    </div>

                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Année
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                name='annee'
                                value={filters.annee}
                                onChange={({ target }) => handleChange(target.name, target.value)}
                            > {yearslist.map(y => <option value={y} key={y}>{y}</option>)}
                            </FormSelect>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Filter