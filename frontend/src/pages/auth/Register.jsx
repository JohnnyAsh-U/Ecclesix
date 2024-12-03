import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import SetupOTP from './setupOtp'
import { AppGlobalContext } from '../../hooks/AppContext'
import RegisterBox from './RegisterBox'
import VerifyEmail from './VerifyEmail'


const Register = () => {
    const { admin } = AppGlobalContext()
    const [err, setErr] = useState('')
    const [page, setPage] = useState("Register")
    const [email, setEmail] = useState(null)
    const [token, setToken] = useState(null)
    const [user, setUser] = useState('')
    const [loading, setLoading] = useState(false)
    const [verification, setVerification] = useState(null)
    const navigate = useNavigate()


    const submit = async (values) => {
        setLoading(true)
        setErr('')
        try {
            const { data } = await axios.post(`/auth/inscription`, { values });
            setEmail(data.email)
            setToken(data.token)
            setPage('VerifyEmail')
            setLoading(false)
        } catch (err) {
            if (err.response) {
                setErr(err.response.data.err)
                setLoading(false)
            }
        }
    }


    const verify = (values) => {
        setLoading(true)
        axios.post('/auth/verify-email', { token, values })
            .then(({ data }) => {
                if (data.success == false) {
                    setVerification("false")
                } else if (data.success == true) {
                    setVerification("true")
                    setUser(data.user)
                    setPage('setupOTP')
                }
                setLoading(false)
            })
            .catch(err => navigate('/connexion'))
    }

    
    if (Object.keys(admin).length != 0) {
        return <Navigate to={'/dashboard'} />
    }else


    return (
        <section className="login p-fixed d-flex text-center bg-white common-img-bg">
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">

                        {page === 'Register' && <RegisterBox submit={submit} error={err} loading={loading}/>}

                        {page == 'VerifyEmail' && <VerifyEmail verify={verify} email={email} verification={verification} loading={loading} />}

                        {page === 'setupOTP' && <SetupOTP token={token} user={user} />}

                    </div>

                </div>

            </div>

        </section>
    )
}

export default Register

