import React, { useEffect, useState } from 'react'
import axios from 'axios'

const useFetch = (url, method, values = {}) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)


    const fetchData = async () => {
        setLoading(true)
        try {
            const { data } = await axios[method](url, values)
            // throw new Error('Error')
            setData(data)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [url])

    const reload = ()=> fetchData()

    return { loading, reload, data, error }

}

export default useFetch