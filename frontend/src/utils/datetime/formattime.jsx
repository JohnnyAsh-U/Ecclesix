export const timeFormat = (time) => {
    if (!time) return "";
    let now = new Date()
    let time_seconds = new Date(time).getTime()
    let now_seconds = now.getTime()
    let time_diff = now_seconds - time_seconds
    if (time_diff < 60 * 60 * 1000) {
        let mins = parseInt(time_diff / (60 * 1000))
        return mins == 0 ? `A l'instant` : `il y a ${mins} minutes`
    } else if (time_diff > 60 * 60 * 1000 && time_diff < 24 * 60 * 60 * 1000) {
        let hrs = parseInt(time_diff / (60 * 60 * 1000))
        return `il y a ${hrs} heures`
    } else {
        let days = parseInt(time_diff / (60 * 60 * 1000 * 24))
        return `il y a ${days} jour(s)`
    }
}