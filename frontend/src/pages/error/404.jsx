import React from 'react'

const Page404 = () => {
    return (
        <section className="login offline-404 p-fixed d-flex text-center">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="auth-body">
                            <form>
                                <h1>Erreur</h1>
                                <h2>Oops! 404</h2>
                                <div className="left-icon-control">
                                    <input type="text" className="form-control form-control-lg" placeholder="Try a new Search" />
                                    <div className="form-icon">
                                        <i className="icofont icofont-search"></i>
                                    </div>
                                </div>
                                <a href="index-2.html" className="btn btn-primary btn-lg m-t-30">Retour</a>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default Page404