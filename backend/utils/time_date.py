from datetime import datetime, date, timedelta
import calendar
import dateutil.relativedelta



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





class custom_date :
    
    def __init__(self, year, month = 1, day=1) -> None:
        self.date = date(year, month, day)
        
    @staticmethod
    def now():
        t = date.today()
        return custom_date(t.year, t.month, t.day)
        
    def start_of_month(self):
        self.date = self.date.replace(day=1)
        return self
    
    def end_of_month(self):
        year = self.date.year
        month = self. date.month
        self.date = self.date.replace(
            day=calendar.monthrange(year, month)[1]
        )
        return self
    
    def add_months(self, amount):
        year = self.date.year
        month = self.date.month
        
        new_month = month + amount
        new_year = year + (new_month // 12)
        new_month = new_month % 12
        
        new_day = min(self.date.day, calendar.monthrange(new_year, new_month)[1])
        self.date = self.date.replace(year=new_year, month=new_month, day=new_day)
        return self
    
        
    def sub_months(self, amount):
        year = self.date.year
        month = self.date.month -amount
        
        while month < 1:
            year -= 1
            month+=12
        
        new_day = min(self.date.day, calendar.monthrange(year, month)[1])
        self.date = self.date.replace(year=year, month=month, day=new_day)
        return self

    
    def sub_years(self, amount):
        self.date = self.date.replace(
            year= self.date.year - amount
        )
        return self
    
    def add_years(self, amount):
        self.date = self.date.replace(
            year= self.date.year + amount
        )
        return self
    
    def start_of_week(self):
        weekday = self.date.weekday()
        self.date = self.date - timedelta(days=weekday)
        return self
    
    def end_of_week(self):
        weekday = self.date.weekday()
        self.date = self.date - timedelta(days=weekday) +timedelta(days=6)
        return self
    
    def start_of_year(self):
        self.date = self.date.replace(
            month=1, day=1
        )
        return self
    
    def end_of_year(self):
        self.date = self.date.replace(
            month=12, day=31
        )
        return self
    
    def is_leap_year(self):
        year = self.date.year
        if year % 4 == 0 and year % 100 !=0:
            return True
        if year % 100 == 0 and year % 400 ==0:
            return True
        return False
    
    def __str__(self):
        return f"{self.date}"
    
