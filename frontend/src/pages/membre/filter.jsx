import React from 'react'
import Search from '../../components/Inputbox/Search'
import Radio from '../../components/Inputbox/Radio'
import { FormSelect } from '../../components/Inputbox/form-select'
import CheckBox from '../../components/Inputbox/checkBox'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

const Filter = ({ handleChange, search, handleSearchChange, filters, filterDefault }) => {
    const { eglises } = AppGlobalContext()

    return (
        <div className="card mt-0 job-right-header mb-sm-4 mb-xl-0" style={{ height: '72vh', overflowY: 'auto' }}>
            <div className="card-header">
                <h5><i className="icofont icofont-filter m-r-5"></i>Filter</h5>
                <span
                    className='float-end btn btn-xs py-0 px-1 btn-default'
                    onClick={() => { filterDefault() }}
                >
                    <FontAwesomeIcon icon={faTimesCircle} />
                </span>
            </div>
            <div className="card-body">
                <form action="#">
                    <Search name='search' value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                    <hr className='mb-1' />

                    <div className="form-radio mb-2">
                        <div className="row">
                            <div className="col-sm-5">
                                <Radio
                                    label={"Tout"}
                                    name="sexe"
                                    value="tout"
                                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                                    checked={filters.sexe === "tout"}
                                />
                            </div>
                            <div className="col-sm-3">
                                <div className="radio radiofill radio-inline">
                                    <Radio
                                        label={<i className="icofont icofont-business-man-alt-2"></i>}
                                        name="sexe"
                                        value="H"
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        checked={filters.sexe === "H"}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="radio radiofill radio-inline">
                                    <Radio
                                        label={<i className="icofont icofont-girl-alt"></i>}
                                        name="sexe"
                                        value="F"
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        checked={filters.sexe === "F"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className='mt-1' />
                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Age :
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                placeholder='Age'
                                value={filters.age}
                                onChange={({ target }) => handleChange(target.name, target.value)}
                                name='age'>
                                <option value={"tout"}>Tout</option>
                                <option value={"<13"}> Enfants</option>
                                <option value={"13-20"}>Adolescent</option>
                                <option value={"20-35"}>Jeune Adultes</option>
                                <option value={"35-50"}>Adultes</option>
                                <option value={">50"}>Personnes Agees</option>
                            </FormSelect>
                        </div>
                    </div>
                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Statut M.:
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                value={filters.statut_matrimonial}
                                onChange={({ target }) => handleChange(target.name, target.value)}
                                name='statut_matrimonial'>
                                <option value={"tout"}>Tout</option>
                                <option value={"C"}>Celibataire</option>
                                <option value={"M"}>Marié</option>
                                <option value={"V"}>Veuf(ve)</option>
                            </FormSelect>
                        </div>
                    </div>
                    <div className="form-group row mb-1">
                        <div className='col-sm-4'>
                            <label className='col-form-label'>
                                Metier :
                            </label>
                        </div>
                        <div className="col-sm-8">
                            <FormSelect
                                name='type_metier'
                                value={filters.type_metier}
                                onChange={({ target }) => handleChange(target.name, target.value)}>
                                <option value={"tout"}>Tout</option>
                                <option value={"Travailleur"}>Travailleur</option>
                                <option value={"Entrepreneur"}>Entrepreneur</option>
                                <option value={"Eleve/Etudiant"}>Eleve/Etudiant</option>
                                <option value={"Autres"}>Autres</option>
                            </FormSelect>
                        </div>
                    </div>

                    <ContentPermsWrapper requiredPerms={['superAdmin', 'voir_touts_membres']}>
                        <div className="form-group row">
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



                    <hr className='my-2' />

                    <div className='row'>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Ministre"}
                                color={"success"}
                                name="statut"
                                value="Ministre"
                                onChange={(e) => handleChange('statut', "Ministre")}
                                checked={filters.Ministre}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Ouvrier"}
                                color={"primary"}
                                name="statut"
                                value="Ouvrier"
                                onChange={(e) => handleChange('statut', "Ouvrier")}
                                checked={filters.Ouvrier}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Membre"}
                                color={"warning"}
                                name="statut"
                                value="Membre"
                                onChange={(e) => handleChange('statut', "Membre")}
                                checked={filters.Membre}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Visiteur"}
                                color={"danger"}
                                name="statut"
                                value="Visiteur"
                                onChange={(e) => handleChange('statut', "Visiteur")}
                                checked={filters.Visiteur}
                            />
                        </div>
                    </div>

                    <hr className='my-2' />

                    <div className='row'>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Baptisé"}
                                color={"inverse"}
                                name="bapteme"
                                value="Baptise"
                                onChange={(e) => handleChange('statut', "baptise")}
                                checked={filters.baptise}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Non Baptisé"}
                                color={"inverse"}
                                name="bapteme"
                                value="Baptise"
                                onChange={(e) => handleChange('statut', "non_baptise")}
                                checked={filters.non_baptise}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Actif"}
                                color={"inverse"}
                                name="actif"
                                value="oui"
                                onChange={(e) => handleChange('statut', "actif")}
                                checked={filters.actif}
                            />
                        </div>
                        <div className="col-sm-6">
                            <CheckBox
                                label={"Inactif"}
                                color={"inverse"}
                                name="actif"
                                value="non"
                                onChange={(e) => handleChange('actif', "inactif")}
                                checked={filters.inactif}
                            />
                        </div>
                    </div>

                    <hr className='my-2' />
                </form>
            </div>
        </div>
    )
}

export default Filter