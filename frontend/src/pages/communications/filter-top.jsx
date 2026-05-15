import React from 'react'
import Search from '../../components/Inputbox/Search'
import Radio from '../../components/Inputbox/Radio'
import { FormSelect } from '../../components/Inputbox/form-select'
import CheckBox from '../../components/Inputbox/checkBox'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

const CommunicationFilterTop = ({
    handleChange,
    search,
    handleSearchChange,
    filters,
    filterDefault,
}) => {
    const { eglises } = AppGlobalContext()

    return (
        <div className="card shadow-md mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <i className="icofont icofont-filter m-r-5"></i>Filter Membres
                </h5>
                <button
                    type="button"
                    className="btn btn-xs py-0 px-1 btn-default"
                    onClick={filterDefault}
                >
                    <FontAwesomeIcon icon={faTimesCircle} />
                </button>
            </div>
            <div className="card-body pb-2">
                <div className="row">
                    <div className="col-xl-4 col-md-6 mb-2">
                        <Search
                            name="search"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="col-xl-2 col-md-6 mb-2">
                        <FormSelect
                            placeholder="Age"
                            value={filters.age}
                            onChange={({ target }) => handleChange(target.name, target.value)}
                            name="age"
                        >
                            <option value={'tout'}>Age: Tout</option>
                            <option value={'<13'}>Enfants</option>
                            <option value={'13-20'}>Adolescent</option>
                            <option value={'20-35'}>Jeunes Adultes</option>
                            <option value={'35-50'}>Adultes</option>
                            <option value={'>50'}>Personnes Agees</option>
                        </FormSelect>
                    </div>

                    <div className="col-xl-2 col-md-6 mb-2">
                        <FormSelect
                            value={filters.statut_matrimonial}
                            onChange={({ target }) => handleChange(target.name, target.value)}
                            name="statut_matrimonial"
                        >
                            <option value={'tout'}>Statut M.: Tout</option>
                            <option value={'C'}>Celibataire</option>
                            <option value={'M'}>Marie</option>
                            <option value={'V'}>Veuf(ve)</option>
                        </FormSelect>
                    </div>

                    <div className="col-xl-2 col-md-6 mb-2">
                        <FormSelect
                            name="type_metier"
                            value={filters.type_metier}
                            onChange={({ target }) => handleChange(target.name, target.value)}
                        >
                            <option value={'tout'}>Metier: Tout</option>
                            <option value={'Travailleur'}>Travailleur</option>
                            <option value={'Entrepreneur'}>Entrepreneur</option>
                            <option value={'Eleve/Etudiant'}>Eleve/Etudiant</option>
                            <option value={'Autres'}>Autres</option>
                        </FormSelect>
                    </div>

                    <ContentPermsWrapper requiredPerms={['superAdmin', 'envoyer_toutes_communications']}>
                        <div className="col-xl-2 col-md-6 mb-2">
                            <FormSelect
                                name="eglise"
                                onChange={(e) => handleChange('eglise', e.target.value)}
                                value={filters.eglise}
                            >
                                <option value={'tout'}>Eglise: Tout</option>
                                {eglises.map((eglise) => (
                                    <option key={eglise.id} value={eglise.id}>
                                        {eglise.church_name}
                                    </option>
                                ))}
                            </FormSelect>
                        </div>
                    </ContentPermsWrapper>
                </div>

                <div className="form-radio row mt-1">
                    <div className="col-xl-4 col-md-6 mb-2">
                        <div className="d-flex gap-3 flex-wrap">
                            <Radio
                                label={'Tout'}
                                name="sexe"
                                value="tout"
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                checked={filters.sexe === 'tout'}
                            />
                            <Radio
                                label={<i className="icofont icofont-business-man-alt-2"></i>}
                                name="sexe"
                                value="H"
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                checked={filters.sexe === 'H'}
                            />
                            <Radio
                                label={<i className="icofont icofont-girl-alt"></i>}
                                name="sexe"
                                value="F"
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                checked={filters.sexe === 'F'}
                            />
                        </div>
                    </div>

                    <div className="col-xl-8 col-md-6 mb-2">
                        <div className="d-flex gap-3 flex-wrap">
                            <CheckBox
                                label={'Ministre'}
                                color={'success'}
                                name="statut"
                                value="Ministre"
                                onChange={() => handleChange('statut', 'Ministre')}
                                checked={filters.Ministre}
                            />
                            <CheckBox
                                label={'Ouvrier'}
                                color={'primary'}
                                name="statut"
                                value="Ouvrier"
                                onChange={() => handleChange('statut', 'Ouvrier')}
                                checked={filters.Ouvrier}
                            />
                            <CheckBox
                                label={'Membre'}
                                color={'warning'}
                                name="statut"
                                value="Membre"
                                onChange={() => handleChange('statut', 'Membre')}
                                checked={filters.Membre}
                            />
                            <CheckBox
                                label={'Visiteur'}
                                color={'danger'}
                                name="statut"
                                value="Visiteur"
                                onChange={() => handleChange('statut', 'Visiteur')}
                                checked={filters.Visiteur}
                            />
                            <CheckBox
                                label={'Baptise'}
                                color={'inverse'}
                                name="bapteme"
                                value="Baptise"
                                onChange={() => handleChange('statut', 'baptise')}
                                checked={filters.baptise}
                            />
                            <CheckBox
                                label={'Non Baptise'}
                                color={'inverse'}
                                name="bapteme"
                                value="Baptise"
                                onChange={() => handleChange('statut', 'non_baptise')}
                                checked={filters.non_baptise}
                            />
                            <CheckBox
                                label={'Actif'}
                                color={'inverse'}
                                name="actif"
                                value="oui"
                                onChange={() => handleChange('statut', 'actif')}
                                checked={filters.actif}
                            />
                            <CheckBox
                                label={'Inactif'}
                                color={'inverse'}
                                name="actif"
                                value="non"
                                onChange={() => handleChange('actif', 'inactif')}
                                checked={filters.inactif}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommunicationFilterTop
