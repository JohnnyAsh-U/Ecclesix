import React from 'react'


//without formik
const Search = ({value, ...rest}) => {
    return (
        <div className="input-group input-group-button input-group-primary input-group-sm">
            <input type="text" className="form-control" placeholder="Recherche" value={value} {...rest}/>
            <span className="btn btn-primary input-group-addon">
                <i className="icofont icofont-ui-search"></i>
            </span>
        </div>
    )
}

export default Search