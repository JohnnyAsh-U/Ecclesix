import WidgetB from "../../components/widgets/widgetB"
import useFetch from "../../hooks/fetchHook"
import { formatAmount } from "../../utils/datetime/amount"
import { faBank, faMoneyBill } from "@fortawesome/free-solid-svg-icons"
import { LoadingData } from "../../components/Loading/loading"
import { useEffect } from "react"

const Comptes = ({ eglise, type, modal }) => {
    const { reload, data, error, loading } = useFetch(`/finance/account-balance?eglise=${eglise}&type=${type}`, 'get')

    useEffect(() => {
        reload()
    }, [modal])

    let color = ['primary', 'danger', 'primary', 'danger', 'inverse']
    return (
        <> {loading && <LoadingData />}
            <div className="row justify-content-center">
                {data && data.map((compte, index) =>
                    <div className="col-sm-6 col-lg-6 col-xs-12 col-xl-2 col-md-6 mx-1"  key={compte.id}>
                        <WidgetB
                            icon={compte.account_type == 'Caisse' ? faMoneyBill : faBank}
                            label={compte.account_name}
                            amount={formatAmount(compte.balance)}
                            color={color[index]}
                        />
                    </div>
                )}
            </div>
        </>
    )
}
export default Comptes