export const list_month = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']


export const formatDate = (date) => {
    if (!date) return '';
    var dateFormate = date.split('-');
    const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
    return dateFormate[2] + ' ' + mois[parseInt(dateFormate[1]) - 1] + ' ' + dateFormate[0]
}


export const rangeMonth = [
    { month: "Janvier- Mars", value: '0-2' },
    { month: "Avril- Juin", value: '3-5' },
    { month: "Juillet- Septembre", value: '6-8' },
    { month: "Octobre- Decembre", value: '9-11' },
]
