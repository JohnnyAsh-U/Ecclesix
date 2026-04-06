import React, { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppGlobalContext } from '../../hooks/AppContext'
import { LoadingButton } from '../../components/buttons/loadingbuttons'
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import InputBox from '../../components/Inputbox/authBox'
import SetupOTP from './setupOtp'



const ResetPassword = () => {
  const { admin } = AppGlobalContext()
  const [loading, setLoading] = useState(false)
  const [membreInfo, setMembreInfo] = useState({})
  const [authenticator, setAuthenticator] = useState(false)
  const [tempToken, setTempToken] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const initialValues = {
    password: '',
    password2: '',
  }


  const validationSchema = yup.object().shape({
    password: yup.string().trim().min(6, "Doit etre d'au moins 6 caracteres").required('Ce champ est requis'),
    password2: yup.string().trim().oneOf([yup.ref('password'), null], 'Les mots de passe doivent correspondre').required('Ce champ est requis'),
  })


  useEffect(() => {
    if (Object.keys(admin).length == 0) {
      const params = new URLSearchParams(location.search)
      const token = params.get('token')
      axios.get(`/auth/reset?token=${token}`)
        .then(({ data }) => {setMembreInfo(data)})
        .catch(err => navigate('/connexion'))
    } else {
      navigate('/connexion')
    }
  }, [])



  const submit = async (values) => {
    setLoading(true)
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    try {
      const { data } = await axios.post(`/auth/reset-password?token=${token}`, { values }, { withCredentials: true });
      if (data.token && data.next == "OTP") {
        setAuthenticator(true)
        setTempToken(data.token)
      } else {
        navigate('/connexion')
      }
      setLoading(false)
    } catch (err) {
      navigate('/connexion')
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
            {!authenticator &&
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
                      <div className="row mb-1">
                        <div className="col-md-12">
                          <h3 className="text-left txt-primary">Reinitialisation</h3>
                          <p className='text-dark text-left mb-0'>{membreInfo.name}</p>
                          <p className='text-dark text-left'>Entrez votre nouveau mot de Passe</p>
                        </div>
                      </div>
                     
                      <InputBox name="password" placeholder="Mot de Passe" type="password" />
                      <InputBox name="password2" placeholder="Mot de Passe" type="password" />
                      <div className="row mt-4">
                        <div className="col-md-12">
                          <LoadingButton color={"primary"} name={"Soumettre"} type={"submit"} loading={loading} />
                        </div>
                      </div>
                    </div>
                  </Form>
                </Formik>
              </div>
            }



            {authenticator && <SetupOTP token={tempToken} user={membreInfo.name} />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResetPassword