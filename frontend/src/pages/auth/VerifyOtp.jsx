import React from 'react'
import Alert from '../../components/alert/alert'
import { Formik, Form } from 'formik'
import * as yup from 'yup';
import IconPNG1 from '../../assets/images/logo-dark.png'
import InputBox from '../../components/Inputbox/authBox';
import { LoadingButton } from '../../components/buttons/loadingbuttons';




const VerifyOtp = ({ verify, verification, loading }) => {

    return (
        <div className="login-card card-body auth-body ms-auto me-auto">
            <Formik initialValues={{ otp_token: '' }}
                validationSchema={yup.object().shape({
                    otp_token: yup.string()
                        .trim().min(6, "Doit etre d'au moins 6 caracteres")
                        .required('Ce champ est requis'),
                })}
                onSubmit={(values) => verify(values)}>
                <Form className="md-float-material">
                    <div className="text-center">
                        <img src={IconPNG1} alt="logo.png" />
                    </div>
                    <div className="auth-box">
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <h3 className="text-left txt-primary">Verification</h3>
                                <p className='text-left text-dark'> Ouvriez L'Appli Authenticator
                                    Et Entrez le code ici</p>
                            </div>
                        </div>
                        {verification == "false" && <Alert message={'Code Incorrect'} />}
                        <InputBox name="otp_token" autoFocus placeholder="Code" type="text" autoComplete="new-otp_token" />
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

export default VerifyOtp