import WidgetB from "../../components/widgets/widgetB"
import useFetch from "../../hooks/fetchHook"
import { formatAmount } from "../../utils/datetime/amount"
import { faBank, faMoneyBill } from "@fortawesome/free-solid-svg-icons"
import { LoadingData } from "../../components/Loading/loading"
import { useEffect } from "react"

const Comptes = ({ eglise, type, modal }) => {
    const { reload, data, error, loading } = useFetch(`/finance/montant?eglise=${eglise}&type=${type}`, 'get')

    useEffect(() => {
        reload()
    }, [modal])

    let color = ['primary', 'danger', 'primary', 'danger', 'inverse']
    return (
        <> {loading && <LoadingData />}
            <div className="row justify-content-center">
                {data && data.comptes && data.comptes?.map((compte, index) =>
                    <div className="col-sm-4 col-lg-6 col-xs-12 col-xl-3 col-md-6"  key={compte.id_compte}>
                        <WidgetB
                            icon={compte.type == 'Caisse' ? faMoneyBill : faBank}
                            label={compte.lib_compte}
                            amount={formatAmount(compte.montant)}
                            color={color[index]}
                        />
                    </div>
                )}
            </div>
        </>
    )
}
export default Comptes