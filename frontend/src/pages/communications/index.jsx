import React, { useState } from 'react'
import { Tabs } from '../../components/tabs/tabs'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import Campaigns from './campaigns'
import CreateCampaign from './create'
import Channels from './channels'
import Analytics from './analytics'

const CommunicationsPage = () => {
    const [refreshCampaigns, setRefreshCampaigns] = useState(0)
    const [refreshChannels, setRefreshChannels] = useState(0)

    const handleCampaignCreated = () => {
        setRefreshCampaigns(prev => prev + 1)
    }

    const handleChannelConnected = () => {
        setRefreshChannels(prev => prev + 1)
    }

    const tabs = [
        {
            id: 'campaigns',
            label: 'Campaigns',
            content: <Campaigns refresh={refreshCampaigns} />
        },
        {
            id: 'create',
            label: 'Create Campaign',
            content: <CreateCampaign onCampaignCreated={handleCampaignCreated} />
        },
        {
            id: 'channels',
            label: 'Channels',
            content: <Channels refresh={refreshChannels} />
        },
        {
            id: 'analytics',
            label: 'Analytics',
            content: <Analytics />
        }
    ]

    return (
        <div className="page-wrapper">
            <BreadCrumb title="Communications" />
            <div className="page-content">
                <div className="container-xl">
                    <div className="row">
                        <div className="col-12">
                            <Tabs tabs={tabs} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommunicationsPage
