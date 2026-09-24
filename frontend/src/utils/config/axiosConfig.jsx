import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_URL || "http://localhost:8000/api/v1",
    withCredentials: true,
})


// Request interceptor to add authorization;
api.interceptors.request.use(config=>{
    config.headers.Authorization = `BEARER ${localStorage.getItem('chms')}`
    const language = localStorage.getItem('i18nextLng') || 'fr';
    config.headers['Accept-Language'] = language;
    return config;
}, error=>{
    return Promise.reject(error)
})



//Refresh token interceptor
api.interceptors.response.use((response) => {
    return response
}, async(err) => {
    const originalRequest = err.config
    if (err.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try{
            const res = await api.post('/auth/refresh', {})
            localStorage.setItem('chms', res.data.token)
            return api(originalRequest)
        }catch(err){
            localStorage.removeItem('chms');
            window.location.reload()
            return Promise.reject(err)
        }
    }

    return Promise.reject(err)
})

export default api;
