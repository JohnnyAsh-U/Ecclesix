import axios from 'axios'


axios.defaults.baseURL = "/api/v1"
axios.defaults.withCredentials = true


// Request interceptor to add authorization;
axios.interceptors.request.use(config=>{
    config.headers.Authorization = `BEARER ${localStorage.getItem('chms')}`
    return config;
}, error=>{
    return Promise.reject(error)
})



//Refresh token interceptor
axios.interceptors.response.use((response) => {
    return response
}, async(err) => {
    const originalRequest = err.config
    if (err.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try{
            const res = await axios.post('/auth/refresh', {})
            localStorage.setItem('chms', res.data.token)
            return axios(originalRequest)
        }catch(err){
            localStorage.removeItem('chms');
            window.location.reload()
            return Promise.reject(err)
        }
    }

    return Promise.reject(err)
})

export default axios;