import { useContext, useState, createContext, useEffect } from "react";
import useDeviceSize from "./screenWidth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Context = createContext()

const AppContext = ({ children }) => {

    const [admin, setAdmin] = useState({})
    const [permissions, setPermissions] = useState([])
    const [membrePage, setMembrePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [eglises, setEglises] = useState([])
    const navigate = useNavigate()
    const {
        verticalEffect,
        verticalNavType,
        deviceType,
        handleSideBarIconClick,
        setUserIconShow,
        userIconShow
    } = useDeviceSize()


    const connexion = (token) => {
        localStorage.setItem('chms', token)
        AdminPermissions();
        const id = jwtDecode(token)
        setAdmin(id)
    }

    const deconnexion = () => {
        axios.post('/auth/deconnexion', {})
            .then(data => {
                setAdmin({})
                localStorage.removeItem('chms')
                navigate('/connexion')
            })
            .catch(err => {
                setAdmin({})
                localStorage.removeItem('chms')
                navigate('/connexion')
            })
    }


    const AdminPermissions = () => {
        axios.get('/admin/permissions')
            .then(({ data }) => {
                setPermissions(data.permissions)
                setEglises(data.eglises)
            })
            .catch(err => {
                localStorage.removeItem('chms')
                navigate('/connexion')
            })
    }


    useEffect(() => {
        let token = localStorage.getItem('chms')
        if (token) {
            AdminPermissions()
            setAdmin(jwtDecode(token))
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps



    const values = {
        verticalEffect,
        verticalNavType,
        deviceType,
        handleSideBarIconClick,
        setUserIconShow,
        userIconShow,
        admin,
        permissions,
        eglises,
        membrePage,
        setMembrePage,
        loading,
        setLoading,
        connexion,
        deconnexion
    }

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    )
}

export default AppContext;

export const AppGlobalContext = () => useContext(Context)