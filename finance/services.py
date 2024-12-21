from decimal import Decimal
import copy
from .models import Transaction


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


def report_table(
    accounts: list[dict],
    InitialBalance: list[dict],
    FinalBalance: list[dict],
    categories_report: list[dict],
    queryset: list[Transaction],
) -> dict:
    TotalExpenses = copy.deepcopy(accounts)
    TotalIncome = copy.deepcopy(accounts)
    TotalTransferIn = copy.deepcopy(accounts)
    TotalTransferOut = copy.deepcopy(accounts)

    for trans in queryset:
        if trans.transaction_type == "Credit":
            # checks if the transaction is not a rule based income
            if not trans.parent:
                # Total Balance
                # give the main account the amount to gradually reduce it as the rules apply
                next((a for a in FinalBalance if a["is_main"] == True))[
                    "balance"
                ] += trans.amount

                # Total Income
                next((a for a in TotalIncome if a["is_main"] == True))[
                    "balance"
                ] += trans.amount

                # Total Category
                cate = next(
                    (a for a in categories_report if a["id"] == trans.category_id), None
                )

                if cate:
                    mainAcc = next(
                        (a for a in cate["accounts"] if a["is_main"] == True)
                    )
                    mainAcc["balance"] += trans.amount
            else:
                # total balance
                debitAccount = next(
                    (a for a in FinalBalance if a["id"] == trans.from_account_id), None
                )
                creditAccount = next(
                    (a for a in FinalBalance if a["id"] == trans.to_account_id), None
                )

                # we check if the debited and credited account belongs to the church
                # if so we debit and credit accounts
                if debitAccount and creditAccount:
                    # subtract the amount transferred to other accounts and add to the credited account
                    creditAccount["balance"] += trans.amount
                    debitAccount["balance"] -= trans.amount

                    # Total Income
                    d_acc = next(
                        (a for a in TotalIncome if a["id"] == trans.from_account_id)
                    )
                    c_acc = next(
                        (a for a in TotalIncome if a["id"] == trans.to_account_id)
                    )

                    # subtract the amount transferred to other accounts and add to the credited account
                    c_acc["balance"] += trans.amount
                    d_acc["balance"] -= trans.amount

                    #   //Total Categories
                    cate = next(
                        (a for a in categories_report if a["id"] == trans.category_id),
                        None,
                    )
                    if cate:
                        debitAcc = next(
                            (
                                a
                                for a in cate["accounts"]
                                if a["id"] == trans.from_account_id
                            )
                        )
                        creditAcc = next(
                            (
                                a
                                for a in cate["accounts"]
                                if a["id"] == trans.to_account_id
                            )
                        )
                        creditAcc["balance"] += trans.amount
                        debitAcc["balance"] -= trans.amount

                elif debitAccount:
                    # but if the credited account isn't among church account, we just consider it as
                    # outgoing transfer from the account, so we only debit account
                    debitAccount["balance"] -= trans.amount
                    d_acc = next(
                        (
                            a
                            for a in TotalTransferOut
                            if a["id"] == trans.from_account_id
                        )
                    )
                    d_acc["balance"] -= trans.amount
                elif creditAccount:
                    # but if the debited account isnt among chuch accounts, we just consider it as
                    # incoming transfer from foreign account, so we only credit account
                    creditAccount["balance"] += trans.amount
                    c_acc = next(
                        (a for a in TotalTransferIn if a["id"] == trans.to_account_id)
                    )
                    c_acc["balance"] += trans.amount
        elif trans.transaction_type == "Debit":
            #  //Total Balance
            debitAccount = next(
                (a for a in FinalBalance if a["id"] == trans.from_account_id)
            )
            debitAccount["balance"] -= trans.amount

            # //Total Expenses
            acc = next((a for a in TotalExpenses if a["id"] == trans.from_account_id))
            acc["balance"] -= trans.amount

            # //Total Categorie
            cate = next((a for a in categories_report if a["id"] == trans.category_id))
            if cate:
                account = next(
                    (a for a in cate["accounts"] if a["id"] == trans.from_account_id)
                )
                account["balance"] -= trans.amount

        elif trans.transaction_type == "Transfer":
            #  //Total Balance
            debitAccount = next(
                (a for a in FinalBalance if a["id"] == trans.from_account_id)
            )
            creditAccount = next(
                (a for a in FinalBalance if a["id"] == trans.to_account_id)
            )

            if debitAccount:
                debitAccount["balance"] -= trans.amount

            if creditAccount:
                creditAccount["balance"] += trans.amount

            # Total Transfers
            d_acc = next(
                (a for a in TotalTransferOut if a["id"] == trans.from_account_id)
            )
            c_acc = next((a for a in TotalTransferIn if a["id"] == trans.to_account_id))
            if d_acc:
                d_acc["balance"] -= trans.amount

            if c_acc:
                c_acc["balance"] += trans.amount

    # add the total(final) column to the accounts
    accounts.append({"id": 0, "name": "Total", "is_main": False})

    # total expenses
    total = sum(tx["balance"] for tx in TotalExpenses if tx["name"] != "Total")
    TotalExpenses.append({"id": 0, "name": "Total", "is_main": False, "balance": total})

    # total income
    total = sum(tx["balance"] for tx in TotalIncome if tx["name"] != "Total")
    TotalIncome.append({"id": 0, "name": "Total", "is_main": False, "balance": total})

    # total transferIn
    total = sum(tx["balance"] for tx in TotalTransferIn if tx["name"] != "Total")
    TotalTransferIn.append(
        {"id": 0, "name": "Total", "is_main": False, "balance": total}
    )

    # total transfer out
    total = sum(tx["balance"] for tx in TotalTransferOut if tx["name"] != "Total")
    TotalTransferOut.append(
        {"id": 0, "name": "Total", "is_main": False, "balance": total}
    )

    # total initial balance
    total = sum(tx["balance"] for tx in InitialBalance if tx["name"] != "Total")
    InitialBalance.append(
        {"id": 0, "name": "Total", "is_main": False, "balance": total}
    )

    # total final balance
    total = sum(tx["balance"] for tx in FinalBalance if tx["name"] != "Total")
    FinalBalance.append({"id": 0, "name": "Total", "is_main": False, "balance": total})

    # Sum of all the categories
    for cat in categories_report:
        total = sum(tx["balance"] for tx in cat["accounts"] if tx["name"] != "Total")
        cat["accounts"].append(
            {"id": 0, "name": "Total", "is_main": False, "balance": total}
        )

    return {
        "accountsName": FinalBalance,
        "accountCols": accounts,
        "InitialBalance": InitialBalance,
        "TotalExpenses": TotalExpenses,
        "TotalTransferIn": TotalTransferIn,
        "TotalTransferOut": TotalTransferOut,
        "TotalIncome": TotalIncome,
        "rapportCategories": categories_report,
    }
