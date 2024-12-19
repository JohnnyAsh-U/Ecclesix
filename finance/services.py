from decimal import Decimal


def transaction_table(data):
    result = []
    for trans in data:
        if trans["transaction_type"] == "Credit":
            # checks if the transaction is not a rule based income
            if not trans["parent"]:
                # we get the main account that is always be involved in parent transactions
                principal_acc = next(
                    (
                        a
                        for a in trans["accounts"]
                        if a["is_main"] == True and a["id"] == trans["from_account"]
                    ),
                    None,
                )
                if principal_acc:
                    # if true we add the amount to the account and
                    # push the transaction to the result list
                    principal_acc["balance"] = Decimal(trans["amount"])
                    result.append(trans)
            else:
                # if it's a rule based we find the parent transaction
                last_income = next(
                    (r for r in result if r["id"] == trans["parent"]), None
                )
                if last_income:
                    # if the parent transaction exist we check if the credited account is among
                    # the church accounts because the debited account will always be among the church
                    # accounts since the children transaction involves the main account sending to
                    # other accounts
                    credit_acc = next(
                        (
                            a
                            for a in last_income["accounts"]
                            if a["id"] == trans["to_account"]
                        ),
                        None,
                    )
                    if credit_acc:
                        debit_acc = next(
                            (
                                a
                                for a in last_income["accounts"]
                                if a["id"] == trans["from_account"]
                            ),
                            None,
                        )
                        debit_acc["balance"] = Decimal(debit_acc["balance"]) - Decimal(
                            trans["amount"]
                        )
                        credit_acc["balance"] = Decimal(trans["amount"])
                    else:
                        # if the credited accounts is not among the church account, we just debit the church main
                        #  accounts and push the transaction to the result
                        debit_acc = next(
                            (
                                a
                                for a in trans["accounts"]
                                if a["id"] == trans["from_account"]
                            ),
                            None,
                        )
                        debit_acc["balance"] = Decimal(debit_acc["balance"]) - Decimal(
                            trans["amount"]
                        )
                        result.append(trans)
                else:
                    # if the parent of the child transaction isn't among the church transaction we just
                    # credit the receiving account and push the row to results
                    credit_acc = next(
                        (
                            a
                            for a in trans["accounts"]
                            if a["id"] == trans["to_account"]
                        ),
                        None,
                    )
                    if credit_acc:
                        credit_acc["balance"] = Decimal(trans["amount"])
                        result.append(trans)
        elif trans["transaction_type"] == "Debit":
            debit_acc = next(
                (a for a in trans["accounts"] if a["id"] == trans["from_account"]),
                None,
            )
            debit_acc["balance"] = Decimal(debit_acc["balance"]) - Decimal(
                trans["amount"]
            )
            result.append(trans)
        elif trans["transaction_type"] == "Transfer" and not trans["parent"]:
            debit_acc = next(
                (a for a in trans["accounts"] if a["id"] == trans["from_account"]),
                None,
            )
            credit_acc = next(
                (a for a in trans["accounts"] if a["id"] == trans["to_account"]),
                None,
            )
            if debit_acc:
                debit_acc["balance"] = Decimal(debit_acc["balance"]) - Decimal(
                    trans["amount"]
                )
            if credit_acc:
                credit_acc["balance"] = Decimal(trans["amount"])
            result.append(trans)

    return result
