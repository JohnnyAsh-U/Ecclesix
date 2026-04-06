import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import InputBox from '../../components/Inputbox/authBox';
import axios from 'axios';
import Alert from '../../components/alert/alert';
import { LoadingButton } from '../../components/buttons/loadingbuttons';
import { AppGlobalContext } from '../../hooks/AppContext';
// var QRCode = require('qrcode')
import QRCode from 'qrcode'



const SetupOTP = ({ token, user }) => {

    const { connexion } = AppGlobalContext()
    const navigate = useNavigate()
    const [qrCode, setQrCode] = useState('')
    const [otpSecret, setOtpSecret] = useState('')
    const [verification, setVerification] = useState('')
    const [loading, setLoading] = useState(false)

    const initialValues = {
        otp_token: '',
    }

    const validationSchema = yup.object().shape({
        otp_token: yup.string().trim().min(6, "Doit etre d'au moins 6 caracteres").required('Ce champ est requis'),
    })


    useEffect(() => {
        axios.post('/auth/setup-otp', { token }, { withCredentials: true })
            .then(({ data }) => {
                QRCode.toDataURL(data.qrCodeUrl, (err, qrcode)=> {
                    setQrCode(qrcode)
                })
                // setQrCode(data.qrCodeUrl)
                setOtpSecret(data.secret)
            })
            .catch(err => navigate('/inscription'))
    }, [])



    const submit = (values) => {
        setLoading(true)
        axios.post('/auth/verify-otp', { token, values, secret: otpSecret }, { withCredentials: true })
            .then(({ data }) => {
                if (data.success == "false") {
                    setVerification("false")
                    setLoading(false)
                } else if (data.success == "true") {
                    setVerification("true")
                    connexion(data.token)
                    setLoading(false)
                }
            })
            .catch(err => navigate('/connexion'))
    }



    return (
        <div className="login-card card-body auth-body ms-auto me-auto">
            <Formik initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={submit}>
                <Form className="md-float-material">
                    <div className="auth-box">
                        <div className="text-center mb-3 border-bottom pb-2">
                            <img
                                src={"/ecclesiaos-logo-light.png"}
                                alt="logo.png"
                                className="img-fluid"
                                style={{ maxHeight: '60px', width: 'auto' }}
                            />
                        </div>
                        <div className="row mb-2">
                            <div className="col-md-12">
                                <h3 className="text-left txt-primary">Verification</h3>
                                <p className='text-left text-dark mb-0 fs-6 '>{user}</p>
                                <p className='text-left text-dark'> Scannez le qrCode avec L'Appli Authenticator
                                    Et Entrez le code ici</p>
                            </div>
                        </div>
                        <img align='center' src={qrCode} />

                        {verification == "false" && <Alert message={'Code Incorrect'} />}
                        <InputBox name="otp_token" autoFocus placeholder="Code" type="text" autoComplete="new-otp_token" />
                        <div className="row mt-4">
                            <div className="col-md-12">
                                <LoadingButton loading={loading} color={"primary"} type={"submit"} name={"Soumettre"} />
                            </div>
                        </div>

                    </div>
                </Form>

            </Formik>

        </div>

    )
}

export default SetupOTP