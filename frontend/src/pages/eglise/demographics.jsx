import React from 'react'
import { Doughnut, Pie } from 'react-chartjs-2'
import DemographicsB from '../dashboard/demographicsB'

const Demographics = ({ data, metier, statut_m, ministres, ouvriers, membres, visiteurs }) => {
    return (
        <div className='row'>
            <div className="col-xl-4 col-sm-12">
                <div className="card mb-4 custom-shadow">
                    <div className='card-header'>
                        <h5 className='card-header-title'>Membres</h5>
                    </div>
                    <div className='card-body'>
                        <Pie
                            data={{
                                labels: data.map(element => element.categorie),
                                datasets: [
                                    {
                                        data: data.map(element => element.count),
                                        backgroundColor: ['#1E88E5', '#43A047', '#F57C00', '#5856d6', '#8D6E63'],
                                        hoverBackgroundColor: ['#1E88E5', '#43A047', '#F57C00', '#5856d6', '#8D6E63'],
                                    },
                                ],
                            }}
                        />
                    </div >
                </div>
            </div>
            <div className="col-xl-4 col-sm-12">
                <DemographicsB title={"Metier"} color={"red"} data={metier} />
                <hr className='my-3 text-white' />
                <DemographicsB title={"Statut M."} color={"yellow"} data={statut_m} />
            </div>

            <div className="col-xl-4 col-sm-12">
                <div className="card mb-4 custom-shadow">
                    <div className='card-header'>
                        <h5 className='card-header-title'>Membres</h5>
                    </div>
                    <div className='card-body'>
                        <Doughnut
                            data={{
                                labels: ['Ministres', 'Ouvriers', 'Membres', 'Visiteurs'],
                                datasets: [
                                    {
                                        backgroundColor: ['#1b9e3e', '#5856d6', '#f9b115', '#e55353'],
                                        data: [ministres, ouvriers, membres, visiteurs],
                                    },
                                ],
                            }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Demographics