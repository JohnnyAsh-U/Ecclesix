import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'


const SideBarNavigation = ({ items }) => {

    const { permissions } = AppGlobalContext()
    const pathname = useLocation().pathname
    const [active, setActive] = useState(
        // items.find((item) => (item?.items?.some(i => i.to === pathname) && item))?.name
        "Dashboard"
    )

    const toggleActiveDropDown = (name) => {
        if (name) {
            setActive(name === active ? null : name)
        }
    }

    const navigationLink = (item, component, parentName, index) => {
        const { name, to, icon, badge, color, ...rest } = item
        return (
            <NavLink to={component === NavLink ? to : '#'} onClick={() => toggleActiveDropDown(parentName)}>
                <span className="pcoded-micon" style={{ backgroundColor: color }} >{icon}</span>
                <span className="pcoded-mtext">{name}</span>
                <span className="pcoded-mcaret"></span>
            </NavLink>
        )
    }


    const navigationItem = (item, index) => {
        const { name, to, icon, badge, perms, ...rest } = item
        let classname = item.icon ? " " : "pcoded-hasmenu";
        return (
            <ContentPermsWrapper requiredPerms={perms} key={index}>
                <li
                    className={`${classname} ${pathname === item.to ? ' active' : ''}`}
                    key={index}
                >
                    {navigationLink(item, NavLink)}
                </li>
            </ContentPermsWrapper>
        )
    }


    const navigationGroup = (item, index) => {
        const { name, to, icon, badge, perms, ...rest } = item
        let checkOpen = active === name ? ' pcoded-trigger' : '';

        //checks for a perm or superadmin before rendering the navgroup
        if (!permissions.perms?.some(p => perms?.includes(p)) && !permissions.superAdmin && perms?.length > 0) {
            return
        }
        return (
            <li
                className={"pcoded-hasmenu" + checkOpen}
                dropdown-icon="style1"
                subitem-icon="style6"
                key={index}
            >
                {navigationLink(item, '', name, index)}
                <ul className="pcoded-submenu" >
                    {item.items && item.items.map((item, index) => navigationItem(item, index))}
                </ul>
            </li>
        )
    }



    const navigationTitle = (item, index) => {
        const { perms } = item
        return (
            <ContentPermsWrapper requiredPerms={perms} key={index}>
                <div
                    className="pcoded-navigatio-lavel"
                    menu-title-theme="theme1"
                    key={index}>
                    {item.title}
                </div>
            </ContentPermsWrapper>
        )
    }

    return (
        <>
            {items && items.map((item, index) => (
                item.title ?
                    navigationTitle(item, index) :
                    <ul
                        className="pcoded-item pcoded-left-item"
                        item-border="true"
                        item-border-style="none"
                        subitem-border="true"
                        key={index}
                    >
                        {item.items ?
                            navigationGroup(item, index) :
                            navigationItem(item, index)
                        }
                    </ul>
            ))}
        </>
    )
}

export default SideBarNavigation