import { useEffect, useLayoutEffect, useState } from "react";

function useDeviceSize() {
    const [verticalNavType, setVerticalNavType] = useState(null)
    const [verticalEffect, setVerticalEffect] = useState(null)
    const [deviceType, setDeviceType] = useState(null)
    const [userIconShow, setUserIconShow] = useState(null)

    const verticalMenueffect = {
        desktop: "shrink",
        tablet: "overlay",
        phone: "overlay",
    }

    const defaultVerticalMenu = {
        desktop: "expanded",
        tablet: "offcanvas",
        phone: "offcanvas",
    }

    const onToggleVerticalMenu = {
        desktop: "offcanvas",
        tablet: "expanded",
        phone: "expanded",
    }

    const changeAttributes = (totalwidth) => {
        if (totalwidth >= 768 && totalwidth <= 992) {

            setDeviceType('tablet')
            setUserIconShow(false)
            var value = defaultVerticalMenu.tablet;
            if (value != undefined && value != "") {
                setVerticalNavType(value)
            } else {
                setVerticalNavType('offcanvas')
            }

            var ev = verticalMenueffect.tablet;
            if (ev != undefined && value != "") {
                setVerticalEffect(ev)
            } else {
                setVerticalEffect('shrink')
            }

        } else if (totalwidth < 768) {
            setDeviceType('phone')
            setUserIconShow(false)

            var value = defaultVerticalMenu.phone;
            if (value != undefined && value != "") {
                setVerticalNavType(value)
            } else {
                setVerticalNavType('offcanvas')
            }

            var ev = verticalMenueffect.phone;
            if (ev != undefined && value != "") {
                setVerticalEffect(ev)
            } else {
                setVerticalEffect('push')
            }

        } else {
            setDeviceType('desktop')
            setUserIconShow(true)
            var value = defaultVerticalMenu.desktop;
            if (value != undefined && value != "") {
                setVerticalNavType(value)
            } else {
                setVerticalNavType('expanded')
            }

            var ev = verticalMenueffect.desktop;
            if (ev != undefined && value != "") {
                setVerticalEffect(ev)
            } else {
                setVerticalEffect('shrink')
            }

        }
    }

    const handleSideBarIconClick =()=> {
        if (deviceType == 'desktop') {
            setVerticalNavType(verticalNavType == 'expanded' ? 'offcanvas' : 'expanded')
        } else if (deviceType == "tablet") {
            setVerticalNavType(verticalNavType == 'expanded' ? 'offcanvas' : 'expanded')
        } else if (deviceType == "phone") {
            setVerticalNavType(verticalNavType == 'expanded' ? 'offcanvas' : 'expanded')
    }}

    useLayoutEffect(() => {
        changeAttributes(window.innerWidth)
        window.addEventListener('resize', () => changeAttributes(window.innerWidth));
        return () => window.removeEventListener('resize', () => changeAttributes(window.innerWidth))
    }, [])

    return {
        verticalEffect,
        verticalNavType,
        deviceType,
        handleSideBarIconClick,
        setUserIconShow,
        userIconShow
    }
};

export default useDeviceSize