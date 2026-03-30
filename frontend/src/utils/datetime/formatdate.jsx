import { list_month } from "./month";

export const padZero = (num) => num < 10 ? '0' + num : num;
export const date_aujourdhui = (date) => `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;


export const formatDate = (date) => {
    if (!date) return '';
    var dateFormate = date.split('-');
    const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
    return dateFormate[2] + ' ' + mois[parseInt(dateFormate[1]) - 1] + ' ' + dateFormate[0]
}

export const dateDisplay = (arg) => {
    if (!arg) return "";
    let datetime = new Date(arg)
    let time = `${padZero(datetime.getHours())}H${padZero(datetime.getMinutes())}   `;
    let date = `${datetime.getDate()} ${list_month[datetime.getMonth()]} ${datetime.getFullYear()}`;
    return date
}