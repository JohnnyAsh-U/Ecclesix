import React, { useState } from 'react'
import TabContent from 'react-bootstrap/esm/TabContent'
import Nav from 'react-bootstrap/Nav'
import Tab from 'react-bootstrap/Tab'
import { Bar, Line } from 'react-chartjs-2'
import { formatDate, list_month, rangeMonth } from '../../utils/datetime/month'
import { capitalizeFirstLetter } from '../../utils/string/formatting'
import { LinkProfile } from '../../utils/permissions/permwrapper'
import DemographicsB from '../dashboard/demographicsB'

const MainChart = ({ monthData, yearData, eglise, sexe }) => {
    let presentYear = new Date().getFullYear()
    let presentMonth = new Date().getMonth()

    let monthsOptions = []
    if (presentMonth >= 0 && presentMonth <= 2) {
        monthsOptions = rangeMonth.slice(0, 1);
    } else if (presentMonth >= 3 && presentMonth <= 5) {
        monthsOptions = rangeMonth.slice(0, 2)
    } else if (presentMonth >= 6 && presentMonth <= 8) {
        monthsOptions = rangeMonth.slice(0, 3)
    } else if (presentMonth >= 9 && presentMonth <= 11) {
        monthsOptions = rangeMonth
    }

    const [year, setYear] = useState(presentYear)
    const [month, setMonth] = useState(monthsOptions[monthsOptions.length - 1].value)


    const chartOptions = {
        elements: {
            line: {
                tension: 0.25,

            },
            point: {
                radius: 3,
                hitRadius: 5,
                hoverRadius: 4,
                hoverBorderWidth: 3,
            },
        },
        responsive: true
    }



    const backgroundColor = ['rgba(70,128,255,1)', '#FC6180', '#FFB64D', 'rgb(51, 153, 255,0.2)', 'rgb(27, 158, 62, 0.2)', 'rgb(229, 83, 83, 0.2)', 'rgb(249, 177, 21, 0.2)', 'rgb(107, 119, 133, 0.2)']
    const borderColor = ['rgba(70,128,255,1)', '#FC6180', '#FFB64D', 'rgb(51, 153, 255)', 'rgb(27, 158, 62)', 'rgb(229, 83, 83)', 'rgb(249, 177, 21)', 'rgb(107, 119, 133)']

    //for dropdown years to create a list of year from present year and oldest event year
    const years = Array.from({ length: presentYear - yearData.year + 1 }, (_, index) => presentYear - index)


    return (
        <div className='row'>
            <div className="col-xl-8 col-sm-12">
                <div className="card mb-2">
                    <Tab.Container defaultActiveKey={"week"}>
                        <div className='card-header'>
                            <div className="card-header-left">
                                <h5 className="card-header-title">
                                    Taux de Participation
                                </h5>
                            </div>
                            <div className="card-header-right">
                                <Nav variant='tabs'>
                                    <Nav.Item>
                                        <Nav.Link eventKey={"week"}>Semaine</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey={"month"}>Annee</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>
                        </div>
                        <div className="card-body">
                            <TabContent>
                                <Tab.Pane eventKey={"week"}>
                                    <div className='d-flex flex-column'>
                                        <div className='justify-content-end align-self-end my-2'>
                                            <select placeholder='Year' className='form-control form-select' value={month} onChange={(e) => setMonth(e.target.value)}>
                                                {monthsOptions.map(m => <option key={m.value} value={m.value}>{m.month}</option>)}
                                            </select>
                                        </div>
                                        <Line
                                            data={{
                                                labels: monthData[month].period.map(m => m),
                                                datasets: monthData[month]?.events?.map((obj, index) => {
                                                    return {
                                                        label: obj.label,
                                                        backgroundColor: backgroundColor[index],
                                                        borderColor: borderColor[index],
                                                        pointBackgroundColor: borderColor[index],
                                                        pointBorderColor: '#fff',
                                                        data: obj.totals.map(ev => ev),
                                                    }
                                                })
                                            }}
                                            options={chartOptions}
                                        />

                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey={"month"}>
                                    <div className='d-flex flex-column'>
                                        <div className='justify-content-end align-self-end my-2'>
                                            <select placeholder='Year' className='form-control form-select' onChange={(e) => setYear(e.target.value)}>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <Bar
                                            data={{
                                                labels: list_month.map(m => m),
                                                datasets: yearData[year]?.map((obj, index) => {
                                                    return {
                                                        label: obj.event,
                                                        backgroundColor: borderColor[index],
                                                        data: obj.data.map(stats => stats)
                                                    }
                                                }) || [],
                                            }}
                                            options={{
                                                responsive: true,
                                                scales: {
                                                    x: {
                                                        stacked: true
                                                    },
                                                    y: {
                                                        stacked: true
                                                    }
                                                }
                                            }}
                                            labels="months"
                                        />
                                    </div>
                                </Tab.Pane>
                            </TabContent>
                        </div>
                    </Tab.Container>
                </div>
            </div>
            <div className='col-xl-4 col-sm-12'>
                <div key={eglise.id} className={`card custom-shadow mb-2`}>
                    <div className='card-header d-flex align-items-center'>
                       <h5 className='card-header-title'>Information</h5> 
                    </div>
                    <div className='card-body'>
                        <ul className='list-group list-group-flush'>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Eglise</h6>
                                <span className="text-secondary">
                                    {eglise.church_name}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Type</h6>
                                <span className="text-secondary">
                                    {eglise.type_name ? eglise.type_name : <i className="small font-italic"> Pas de type</i>}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Ville</h6>
                                <span className="text-secondary">
                                    {eglise.city_name ? eglise.city_name : 'Pas de Ville'}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Addresse</h6>
                                <span className="text-secondary">
                                    {eglise.address}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Pasteur</h6>
                                <span className="text-secondary">
                                    <LinkProfile to={`/membres/profile/${eglise.leader}`} className="text-decoration-none text-dark hover">
                                        {/* {eglise.ministre ? capitalizeFirstLetter(eglise.ministre?.nom) + ' ' + capitalizeFirstLetter(eglise.ministre?.prenom) : ''} */}
                                        { eglise.leader_name?.name}
                                    </LinkProfile>
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Assistant</h6>
                                <span className="text-secondary">
                                    <LinkProfile to={`/membres/profile/${eglise.assistant_ministre?.id}`} className="text-decoration-none text-dark hover">
                                        {/* {eglise.assistant_ministre ? capitalizeFirstLetter(eglise.assistant_ministre?.nom) + ' ' + capitalizeFirstLetter(eglise.assistant_ministre?.prenom) : ''} */}
                                        { eglise.leader2_name?.name}
                                    </LinkProfile>
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <h6 className="mb-0">Date</h6>
                                <span className="text-secondary">
                                    {formatDate(eglise.opening_date)}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
              
                <DemographicsB title={"Gendre"} color={"blue"} data={sexe} />
            </div>
        </div>

    )
}

export default MainChart