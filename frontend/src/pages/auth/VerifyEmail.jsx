import React from 'react'
import Alert from '../../components/alert/alert'
import { Formik, Form } from 'formik'
import * as yup from 'yup';
import InputBox from '../../components/Inputbox/authBox';
import { LoadingButton } from '../../components/buttons/loadingbuttons';


const VerifyEmail = ({ verify, email, verification, loading }) => {

    return (
        <div className="login-card card-body auth-body ms-auto me-auto">
            <Formik initialValues={{ email_token: '' }}
                validationSchema={yup.object().shape({
                    email_token: yup.string()
                        .trim().min(6, "Doit etre d'au moins 6 caracteres")
                        .required('Ce champ est requis'),
                })}
                onSubmit={(values) => verify(values)}>
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
                                <h3 className="text-left txt-primary">Verification Email</h3>
                                <p className='text-left text-dark'>
                                    Nous avons envoyé un code de vérification par e-mail a votre addresse e-mail <br /><b>{email}</b><br />
                                    Veuillez entrer le code ici</p>
                            </div>
                        </div>
                        {verification == "false" && <Alert message={'Code Incorrect'} />}
                        <InputBox name="email_token" autoFocus placeholder="Code" type="text" />
                        <div className="row mt-4">
                            <div className="col-md-12">
                                <LoadingButton loading={loading} color={"primary"} type={"submit"} name={"Verification"}/>
                            </div>
                        </div>

                    </div>
                </Form>

            </Formik>

        </div>

    )
}

export default VerifyEmail