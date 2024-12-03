import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import VerifyOtp from './VerifyOtp'
import LoginBox from './LoginBox'
import SetupOTP from './setupOtp'
import { AppGlobalContext } from '../../hooks/AppContext'
import VerifyEmail from './VerifyEmail'

const Login = () => {
    const { admin, connexion } = AppGlobalContext()
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState("Connexion")
    const [email,setEmail] = useState('')
    const [token, setToken] = useState(null)
    const [user, setUser] = useState('')
    const [verification, setVerification] = useState(null)
    const [err, setErr] = useState()
    const navigate = useNavigate()


    const submit = async (values, { resetForm }) => {
        setLoading(true)
        try {
            const { data } = await axios.post('/auth/connexion', { values });
            setToken(data.token)
            if (data.next == "Dashboard") {
                connexion(data.token)
            } else if (data.next == 'VerifyEmail'){
                setEmail(data.email)
                setPage('VerifyEmail')
            } else if (data.next == "OTP" && data.hasOTP == true) {
                setUser(data.user)
                setPage("OTP")
            } else if (data.hasOTP == false) {
                setUser(data.user)
                setPage("setupOTP")
            }
            setLoading(false)
        } catch (err) {
            resetForm()
            if (err.response) {
                setErr(err.response.data.err)
            }
            setLoading(false)
        }
    }


    const verify = (values) => {
        setLoading(true)
        axios.post('/auth/verify-otp', { token, values })
            .then(({ data }) => {
                if (data.success == "false") {
                    setVerification("false")
                } else if (data.success == "true") {
                    setVerification("true")
                    connexion(data.token)
                    // navigate('/')
                }
                setLoading(false)
            })
            .catch(err => navigate('/'))
    }


    const verifyEmail = (values) => {
        setLoading(true)
        axios.post('/auth/verify-email', { token, values })
            .then(({ data }) => {
                if (data.success == false) {
                    setVerification("false")
                } else if (data.success == true) {
                    setVerification('')
                    setPage('setupOTP')
                }
                setLoading(false)
            })
            .catch(err => navigate('/'))
    }


    if (Object.keys(admin).length != 0) {
        return <Navigate to={'/dashboard'} />
    }

    return (
        <section className="login p-fixed d-flex text-center bg-primary common-img-bg">

            <div className="container">
                <div className="row">
                    <div className="col-sm-12">

                        {page === 'Connexion' && <LoginBox submit={submit} error={err} loading={loading} />}

                        {page == 'VerifyEmail' && <VerifyEmail verify={verifyEmail} email={email} verification={verification} loading={loading} />}

                        {page === 'OTP' && <VerifyOtp verify={verify} verification={verification} loading={loading} />}

                        {page === 'setupOTP' && <SetupOTP token={token} user={user} />}

                    </div>

                </div>

            </div>

        </section>
    )
}

export default Login