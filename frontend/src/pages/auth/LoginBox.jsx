import React from 'react'
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import InputBox from '../../components/Inputbox/authBox';
import Alert from '../../components/alert/alert';
import { LoadingButton } from '../../components/buttons/loadingbuttons';


const LoginBox = ({ submit, error, loading }) => {

    const initialValues = {
        email: '',
        password: '',
    }

    const validationSchema = yup.object().shape({
        email: yup.string().trim().required('Ce champ est requis'),
        password: yup.string().trim().required('Ce champ est requis'),
    })


    return (
        <div className="login-card card-body auth-body ms-auto me-auto">

            <Formik initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, {resetForm}) => submit(values, {resetForm})}>
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
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <h3 className="text-left txt-primary">Connexion</h3>
                            </div>
                        </div>
                        <hr />
                    {error && <Alert message={error} />}

                        <InputBox name="email" placeholder="Addresse Email" type="email" />
                        <InputBox name="password" placeholder="Mot De Passe" type="password" />

                        <div className="row mt-4 text-left">
                            <div className="col-12">
                                <div className="checkbox-fade fade-in-primary d-">
                                    <label>
                                        <input type="checkbox" value="" />
                                        <span className="cr"><i
                                            className="cr-icon icofont icofont-ui-check txt-primary"></i></span>
                                        <span className="text-inverse">Remember me</span>
                                    </label>
                                </div>
                                <div className="forgot-phone text-right f-right">
                                    <Link to={'/reinitialisation'} className="text-right f-w-600 text-inverse">
                                        Mot de Passe Oublié?</Link>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-12">
                                <LoadingButton loading={loading} color={"primary"} type={"submit"} name={"Connexion"}/>
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
    )
}

export default LoginBox