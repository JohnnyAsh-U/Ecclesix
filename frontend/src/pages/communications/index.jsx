import React, { useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import Campaigns from './campaigns'
import CreateCampaign from './create'

const CommunicationsPage = () => {
    const [refreshCampaigns, setRefreshCampaigns] = useState(0)
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)

    const handleCampaignCreated = () => {
        setRefreshCampaigns(prev => prev + 1)
        setIsCreatingCampaign(false)
    }


        // const selectedMembers = useMemo(() => Object.values(selectedMap), [selectedMap])
        // const selectedEmails = useMemo(
        //     () => selectedMembers.map((member) => member.email).filter(Boolean),
        //     [selectedMembers]
        // )
        // const selectedPhones = useMemo(
        //     () => selectedMembers.map((member) => member.phone).filter(Boolean),
        //     [selectedMembers]
        // )

    //  const sendCommunication = async () => {
    //         if (!message.trim()) {
    //             toast.warn('Ajoutez un message')
    //             return
    //         }

    //         if (channel === 'email') {
    //             if (!subject.trim()) {
    //                 toast.warn('Ajoutez un objet pour le mail')
    //                 return
    //             }
    //             if (selectedEmails.length === 0) {
    //                 toast.warn('Selectionnez au moins un membre avec une adresse email')
    //                 return
    //             }
    //         }

    //         if (selectedPhones.length === 0) {
    //             toast.warn('Selectionnez au moins un membre avec un numero de telephone')
    //             return
    //         }

    //         try {
    //             setSending(true)
    //             const payload = {
    //                 channel,
    //                 subject: channel === 'email' ? subject.trim() : '',
    //                 message: message.trim(),
    //                 member_ids: selectedMembers.map((member) => member.id),
    //             }

    //             const { data } = await axios.post('/communication/send', payload)
    //             toast.success(
    //                 `Envoi termine. Succes: ${data.success_count || 0}, Echec: ${data.failed_count || 0}`
    //             )
    //             setSelectedMap({})
    //             setSubject('')
    //             setMessage('')
    //         } catch (err) {
    //             const apiMessage =
    //                 err?.response?.data?.detail ||
    //                 err?.response?.data?.message ||
    //                 "Echec de l'envoi de la communication"
    //             toast.error(apiMessage)
    //         } finally {
    //             setSending(false)
    //         }
    //     }

    const breadcrumbAction = (
        <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreatingCampaign(true)}
        >
            <i className="fa fa-plus me-2"></i> Nouvelle campagne
        </button>
    )

    return (
        <div>
            <BreadCrumb
                icon={<i className="icofont icofont-envelope-open"></i>}
                title={'Communication'}
                action={breadcrumbAction}
            >
                {breadcrumbAction}
                {/* <span className="text-muted small">Envoyer un email ou un WhatsApp en masse aux membres filtrés</span> */}
            </BreadCrumb>
            <div className="row">
                <div className="col-12">
                    {isCreatingCampaign ? (
                        <CreateCampaign
                            onCampaignCreated={handleCampaignCreated}
                            onBack={() => setIsCreatingCampaign(false)}
                        />
                    ) : (
                        <Campaigns refresh={refreshCampaigns} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommunicationsPage
