import React from 'react'
import cover from '../../assets/images/social/bg-img1.jpg'
import homme from '../../assets/images/social/homme.jpg'
import femme from '../../assets/images/social/femme.jpg'
import { capitalizeFirstLetter } from '../../utils/string/formatting'
import { StatutBadge } from '../../utils/membre/statut'
import NommerAdmin from './nommeradmin'



const Header = ({ membre }) => {
    return (
        <div className="cover-profile position-relative">
            <div className="profile-bg-img">
                <img className="profile-bg-img img-fluid"
                    src={cover}
                    alt="bg-img" />
                <div className="card-body user-info" style={{bottom: '1px'}}>
                    <div className="col-md-12">
                        <div className="media-left ">
                            <a href="#" className="profile-image">
                                {membre.gender === 'H' &&
                                    <img className="user-img img-radius border border-primary-subtle"
                                        src={homme}
                                        alt="user-img" />}
                                {membre.gender === 'F' && <img className="user-img img-radius border border-primary-subtle"
                                    src={femme}
                                    alt="user-img" />}
                            </a>
                        </div>
                        <div className="media-body row ">
                            <div className="col-lg-12">
                                <div className="user-title">
                                    <h2>{membre.get_full_name}</h2>
                                    <span className="text-white">{membre.church_name} {StatutBadge(membre.status)}</span>
                                </div>
                            </div>
                            <div>
                                <div className="pull-right cover-btn">
                                   <NommerAdmin membre={membre}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default Header