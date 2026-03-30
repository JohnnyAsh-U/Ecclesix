import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppGlobalContext } from '../../hooks/AppContext'
import { LoadingButton } from '../../components/buttons/loadingbuttons'
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import IconPNG1 from '../../assets/images/logo-dark.png'
import InputBox from '../../components/Inputbox/authBox'
import Alert from '../../components/alert/alert'



const Reset = () => {
    const { admin } = AppGlobalContext()
    const [err, setErr] = useState('')
    const [email, setEmail] = useState('')
    const [verifyPage, setVerifyPage] = useState(false)
    const [loading, setLoading] = useState(false)


    const initialValues = {
        email: ''
    }


    const validationSchema = yup.object().shape({
        email: yup.string().trim().email('Email Invalid').required('Ce champ est requis'),
    })


    const submit = async (values) => {
        setLoading(true)
        setErr('')
        try {
            const { data } = await axios.post(`/auth/reinitialisation`, { values });
            setEmail(data.email)
            setLoading(false)
            setVerifyPage(true)
        } catch (err) {
            if (err.response) {
                setErr(err.response.data.err)
                setLoading(false)
            }
        }
    }


    if (Object.keys(admin).length != 0) {
        return <Navigate to={'/dashboard'} />
    }

    return (
        <section className="login p-fixed d-flex text-center bg-primary common-img-bg">
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        {!verifyPage &&
                            <div className="login-card card-body auth-body ms-auto me-auto">
                                <Formik initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={submit}>
                                    <Form className="md-float-material">
                                        <div className="text-center">
                                            <img src={IconPNG1} alt="logo.png" />
                                        </div>
                                        <div className="auth-box">
                                            <div className="row mb-3">
                                                <div className="col-md-12">
                                                    <h3 className="text-left txt-primary">Reinitialisation</h3>
                                                </div>
                                            </div>
                                            <hr />
                                            {err && <Alert message={err} />}
                                            <InputBox name="email" placeholder="Addresse Email" type="email" />
                                            <div className="row mt-4">
                                                <div className="col-md-12">
                                                    <LoadingButton color={"primary"} name={"Soumettre"} type={"submit"} loading={loading}/>
                                                </div>
                                            </div>

                                            <div className="row text-left">
                                                <div className="col-12">
                                                    <div className="forgot-phone text-right f-right">
                                                        <Link to={'/inscription'}>Inscription</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </Formik>
                            </div>
                        }


                        {verifyPage &&
                            <div className="d-flex flex-column vh-100 align-items-center justify-content-center login-page">
                                <form className="md-float-material">
                                    <div className="text-center">
                                        <img src={IconPNG1} alt="logo.png" />
                                    </div>
                                    <div className="auth-box">
                                        <div className="row mb-3">
                                            <div className="col-md-12">
                                                <h3 className="text-left txt-primary">Reinitialisation</h3>
                                            </div>
                                        </div>
                                        <p className='text-dark text-left'>
                                            Nous avons envoyé un lien de vérification par e-mail a votre addresse e-mail <br /><b>{email}</b><br />
                                            Veuillez vérifier votre e-mail et cliquer sur le lien pour
                                            reinitialiser votre mot de passe <br />
                                            <strong>Le lien expire dans une heure</strong>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Reset