import React from 'react'
import { AppGlobalContext } from '../hooks/AppContext'
import useFetch from '../hooks/fetchHook'

export const Logo = () => {
    // use fetch to get tenant info and display custom logo if available
    const { data } = useFetch('/eglise/logo', 'get') || { logo: null }
    const logo = data?.logo_url || null

    return (
        <img
            src={logo ? logo : "/ecclesix-logo-light.png"}
            alt="logo.png"
            className="img-fluid"
            style={{ maxHeight: '60px', width: 'auto' }}
        />
    )
}

export default Logo