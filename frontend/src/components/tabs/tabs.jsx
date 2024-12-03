import React, { useState } from 'react'


export const Tabs = ({ tabs = [] }) => {

    const [activeTab, setActiveTab] = useState(tabs[0].id)
    const handleTab = (id) => setActiveTab(id)

    return (
        <React.Fragment>
            <div className="tab-header card">
                <ul className="nav nav-tabs md-tabs tab-timeline nav-fill" role="tablist"
                    id="mytab">

                    {tabs.map(tab => (
                        <li className="nav-item"
                            onClick={() => handleTab(tab.id)}
                            key={tab.id}
                        >
                            <a className={`nav-link ${activeTab === tab.id && 'active'}`} role="tab" style={{ cursor: 'pointer' }}>
                                {tab.label}
                            </a>
                            <div className="slide" style={{ width: `calc(100%/${tabs.length})` }}></div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="tab-content">

                {tabs.map(tab => (
                    <div className={`tab-pane fade ${activeTab === tab.id && 'show active'}`} role="tabpanel" key={tab.id}>
                        {tab.content}
                    </div>
                ))}

            </div>
        </React.Fragment>
    )
}

