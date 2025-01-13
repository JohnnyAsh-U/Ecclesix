from models import Account, Monthly_Balance
from django.utils import timezone
from backend.utils import time_date

import logging

logger = logging.getLogger(__name__)


def monthly_balance_update():
    today = timezone.now()
    logger.info(f"Mise a jour du Solde Du Mois de {time_date.list_month[today.month-1]} le {today}")




# const cron = require('node-cron')
# const { MonthlyBalance } = require('./services/financeService')

# //running at 12AM of 1st of every month updating monthly balance
# cron.schedule('0 0 1 * *', MonthlyBalance)

# //running at 1AM in case the previous didn't complete
# cron.schedule('0 1 1 * *', MonthlyBalance)


# const MonthlyBalance = async () => {
#     const { sequelize: { models: { SoldeDuMois, Comptes } } } = require('../models')
#     let today = new Date()
#     console.log(`Mise a jour du Solde Du Mois de ${list_month[today.getMonth()]} le ${today.toLocaleDateString('fr-fr')}`)
#     try {
#         let month = today.getMonth() + 1
#         let year = today.getFullYear()
#         const liste = await Comptes.findAll()
#         for (let one of liste) {
#             let presentAccountBalance = await SoldeDuMois.findOne({
#                 where: {
#                     mois: month,
#                     annee: year,
#                     id_compte: one.id_compte
#                 }
#             })
#             if (presentAccountBalance) {
#                 await presentAccountBalance.update({
#                     solde: encryption(one.montant)
#                 })
#             } else {
#                 await SoldeDuMois.create({
#                     mois: month,
#                     annee: year,
#                     id_compte: one.id_compte,
#                     solde: encryption(one.montant)
#                 })
#             }
#         }
#         console.log("Mise a jour terminé ...")
#     } catch (err) {
#         console.error(err, "Unable to Update Monthly Balance Table...")
#     }
# }
