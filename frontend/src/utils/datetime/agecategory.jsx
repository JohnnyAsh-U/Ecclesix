export const AgeCategory = (dob) => {
    if (!dob) return "";
    let dateBirth = new Date(dob)
    let year = dateBirth.getFullYear()
    let age = new Date().getFullYear() - year

    if (age < 13) {
        return "Enfants"
    } else if (age > 13 && age <= 20) {
        return "Adolescent"
    } else if (age > 20 && age <= 35) {
        return "Jeune Adulte"
    } else if (age > 35 && age <= 50) {
        return "Adulte"
    } else if (age > 50) {
        return "Personnes Agees"
    } else {
        return ""
    }
}