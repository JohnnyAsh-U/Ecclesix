import React from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

const autoInsights = [
    {
        title: 'Department Joiners Stay Longer',
        text: 'Members who join a department within 2 weeks are 3x more likely to stay active after 6 months.',
        badge: 'success',
    },
    {
        title: 'Retention Dropped This Month',
        text: 'Retention dropped 12% this month compared to last month, mainly among first-time visitors.',
        badge: 'danger',
    },
    {
        title: 'Top Growth Branch',
        text: 'Kinshasa Central is outperforming other branches in growth with +18% this quarter.',
        badge: 'primary',
    },
    {
        title: 'Early Follow-up Works',
        text: 'Visitors contacted within 72 hours show a 41% higher second-visit rate.',
        badge: 'info',
    },
    {
        title: 'Youth Momentum',
        text: 'Youth department contributes 28% of all new member growth this month.',
        badge: 'warning',
    },
    {
        title: 'Attendance Time Pattern',
        text: 'Most reliable attendance happens on Sunday between 08:30 and 09:15.',
        badge: 'inverse',
    },
]

const recommendations = [
    {
        title: 'Improve Follow-up Process for Visitors',
        text: 'Set a 72-hour follow-up checklist for every new visitor and assign follow-up owners by branch.',
        priority: 'High Priority',
        tone: 'danger',
    },
    {
        title: 'Encourage Department Participation',
        text: 'Promote department signup during first-month onboarding to improve retention and engagement.',
        priority: 'High Impact',
        tone: 'success',
    },
    {
        title: 'Coach Low-Performing Branches',
        text: 'Replicate Kinshasa Central outreach and onboarding process in lower-performing branches.',
        priority: 'Medium Priority',
        tone: 'warning',
    },
    {
        title: 'Protect At-Risk Members',
        text: 'Trigger care alerts after 4 weeks of inactivity and assign leaders to contact each member.',
        priority: 'Immediate Action',
        tone: 'info',
    },
]

const InsightsDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Insights Dashboard'} />

            <div className='row'>
                <div className='col-12 mb-2'>
                    <div className='card'>
                        <div className='card-body'>
                            <h4 className='mb-1'>Auto Insights</h4>
                            <p className='text-muted mb-0'>This section highlights intelligence generated from church behavior patterns.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                {autoInsights.map((insight, index) => (
                    <div className='col-md-12 col-xl-6 mb-3' key={index}>
                        <div className='card h-100'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-start mb-2'>
                                    <h5 className='mb-0'>{insight.title}</h5>
                                    <span className={`badge bg-${insight.badge}`}>Insight</span>
                                </div>
                                <p className='mb-0'>{insight.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='row'>
                <div className='col-12 mb-2'>
                    <div className='card'>
                        <div className='card-body'>
                            <h4 className='mb-1'>Recommendations</h4>
                            <p className='text-muted mb-0'>Actionable next steps based on the current insights.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                {recommendations.map((item, index) => (
                    <div className='col-md-12 col-xl-6 mb-3' key={index}>
                        <div className='card h-100 border-left border-3'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-start mb-2'>
                                    <h5 className='mb-0'>{item.title}</h5>
                                    <span className={`badge bg-${item.tone}`}>{item.priority}</span>
                                </div>
                                <p className='mb-0'>{item.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default InsightsDashboard
