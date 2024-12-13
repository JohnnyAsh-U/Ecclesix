import React, { useState } from 'react'
import { LogPhrase } from '../../utils/logs/logs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const Activites = ({ logs }) => {

    const [viewAdminLog, setViewAdminLog] = useState(null)
    return (
        <div className="card-body pt-1 border-end">
            {logs && logs.map((log, index) =>
                <div className="card-notification" key={index} style={{cursor: 'pointer'}}  onClick={() => setViewAdminLog(viewAdminLog === log.id ? null : log.id)}>
                    <div className="card-noti-conatin m-b-15">
                        <small>{new Date(log.action_time).toLocaleString()}</small>
                        <div className="text-muted">{LogPhrase(log)}
                            {log.log_type === 'UPDATE' && <FontAwesomeIcon className='ms-2' cursor={'pointer'} icon={faCaretDown} />}
                            {log.log_type === 'UPDATE'  && viewAdminLog === log.id &&
                                  <div className=''>
                                  <pre>
                                      <strong>
                                          {JSON.stringify(log.detail.changes, null, 1)}
                                      </strong>
                                  </pre>
                              </div>
                            }
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default Activites