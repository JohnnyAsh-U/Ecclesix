import React from 'react'
import { FormSelect } from '../../components/Inputbox/form-select'
import SecondChart from '../../components/charts/secondchart'

const Attendance = ({ years, year, setYear, data }) => {
    console.log(data)
    return (
        <div className="card mb-3">
            <div className="card-header">
                <div className='card-header-left'>
                    <h5>Taux de Participation</h5>
                </div>
                <div className='card-header-right me-4'>
                    <FormSelect color={'primary'} placeholder='Year' value={year} onChange={(e) => setYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </FormSelect>
                </div>
            </div>
            <div className="card-body">
                <SecondChart chartData={data[year]} />
            </div>
        </div>
    )
}

export default Attendance