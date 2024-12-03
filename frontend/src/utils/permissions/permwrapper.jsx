import { AppGlobalContext } from "../../hooks/AppContext"
import Page404 from '../../pages/error/404'
import { Link } from "react-router-dom"


//compares two arrays to check if at least one of the required perms in included in the 
// users perms
function checkPerms(userPerms, requiredPerms) {
    return requiredPerms.some(perm => userPerms?.includes(perm))
};

//Page Permission check wrapper
export const PagePermsWrapper = ({ requiredPerms, children }) => {
    const { permissions } = AppGlobalContext()

    //if superadmin 
    if (permissions.superAdmin) {
        return children
    }

    //if no perms then its open
    if (!requiredPerms.length) {
        return children
    }

    return checkPerms(permissions.perms, requiredPerms) ? children : <Page404 />;
}

//Content Permission check wrapper
export const ContentPermsWrapper = ({ requiredPerms, children }) => {
    const { permissions } = AppGlobalContext()

    //if superadmin 
    if (permissions.superAdmin) {
        return children
    }

    //if no perms then its open
    if (!requiredPerms?.length) {
        return children
    }
    return checkPerms(permissions.perms, requiredPerms) ? children : '';
}



// Le superadmin seul a le droit de modifier ou supprimer un admin
export const AdminEtSuperAdmin = ({ membre, children }) => {
    const { admin, permissions } = AppGlobalContext()


    //First Super admin can edit and delete any account
    if (permissions.superAdmin && admin.id == 1) {
        return children
    }
    //If admin is a super admin or not
    if (permissions.superAdmin) {
        //Checks if the member account if is a superuser or not
        if (membre.profile_admin && membre.profile_admin?.super_admin) {
            //return children if its the superadmin account
            if (admin.id == membre.id) return children;
            //return null for any other super admin account
            return null;
        } else {
            //return children for any other non superadmin account
            return children
        }

    } else {
        //if the admin is not a superadmin, checks if the member account is a superadmin
        if (membre.profile_admin && membre.profile_admin?.super_admin) {
            //return null if its a superadmin member
            return null
        } else if (membre.admin) {
            return null;
        } else {
            //return children for any other accounts
            return children
        };
    }
}


export const LinkProfile = ({ children, ...rest }) => {
    const { permissions } = AppGlobalContext()

    if (permissions.superAdmin) {
        return <Link {...rest}>{children}</Link>
    }
    if (permissions.perms.includes('voir_membre')) {
        return <Link {...rest}>{children}</Link>
    }
    return children
}