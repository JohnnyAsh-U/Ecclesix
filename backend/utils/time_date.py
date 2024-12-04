from datetime import datetime, date, timedelta

list_month = [
    "Janvier",
    "Fevrier",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Aout",
    "Septembre",
    "Octobre",
    "Novembre",
    "Decembre",
]
month_abbr = [
    "Jan",
    "Fev",
    "Mars",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Aout",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
]

def age_range_to_year_range(age : str):
    if age.find('>') != -1:
        second_year = date.today().year - int(age.split('>')[1])
        first_date = date(1900, 1, 1)
        second_date = date(second_year, 1, 1)
    elif age.find('-') != -1:
        first_year  = date.today().year - int(age.split('-')[0])
        second_year  = date.today().year - int(age.split('-')[1])
        first_date = date(second_year, 1, 1)
        second_date = date(first_year, 1, 1)
    elif age.find('<') !=1:
        first_year = date.today().year - int(age.split('<')[1])
        first_date = date(first_year, 1,1)
        second_date = date.today()
    return first_date, second_date
