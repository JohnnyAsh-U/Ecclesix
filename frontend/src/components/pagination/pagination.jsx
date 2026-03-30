import React from 'react'
import { useState } from 'react'

const Pagination = ({ handler, totalPages, currentPage }) => {

    const [readOnly, setReadOnly] = useState(true)
    const [page, setPage] = useState(currentPage)


    const handlerInput = (val) => {
        if (val === 'Enter' && !isNaN(parseInt(page)) && parseInt(page) <= totalPages && page > 0) {
            handler(page)
        }
    }

    return (
        <div className="jqpagination m-b-10 pagination">
            <a href="#"
                className={`first ${currentPage === 1 && "disabled"}`}
                data-action="first"
                style={{ cursor: 'pointer' }}
                onClick={currentPage !== 1 ? () => handler(1) : null}
            >«</a>


            <a href="#"
                className={`previous ${currentPage === 1 && "disabled"}`}
                data-action="previous"
                style={{ cursor: 'pointer' }}
                onClick={currentPage > 1 ? () => handler(parseInt(currentPage) - 1) : null}
            >‹</a>


            <input
                type='text'
                className="m-t-5"
                onChange={(e) => setPage(e.target.value)}
                onFocus={(e) => { setPage(currentPage); setReadOnly(false) }}
                onBlur={(e) => { handlerInput("Enter"); setReadOnly(true) }}
                onKeyDown={(e) => handlerInput(e.key)}
                placeholder={readOnly ? `Page ${currentPage} sur ${totalPages}` : page}
                value={readOnly ? `Page ${currentPage} sur ${totalPages}` : page}
                readOnly={readOnly}
            />

            <a href="#"
                className={`next ${currentPage === totalPages && "disabled"}`}
                data-action="next"
                style={{ cursor: 'pointer' }}
                onClick={currentPage < totalPages ? () => handler(parseInt(currentPage) + 1) : null}
            >›</a>


            <a href="#"
                data-action="last"
                className={`last ${currentPage === totalPages && "disabled"}`}
                style={{ cursor: 'pointer' }}
                onClick={currentPage !== totalPages ? () => handler(totalPages) : null}
            >»</a>
        </div>
    )
}

export default Pagination