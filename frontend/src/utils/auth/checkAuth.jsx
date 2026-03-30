import { Navigate } from "react-router-dom";


function CheckAuth({children}) {
    
    let token = localStorage.getItem('chms')
    return token !==null ? children :<Navigate to={'/connexion'}></Navigate>
}

export default CheckAuth