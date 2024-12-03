from django.test import SimpleTestCase
from ..utils import time_date


class Test_Time_Date(SimpleTestCase):

    def test_leap_year(self):

        test_param = [
            {"year": 2023, "month": 2, "leap": False},
            {"year": 2024, "month": 2, "leap": True},
            {"year": 1900, "month": 2, "leap": False},
            {"year": 2000, "month": 2, "leap": True},
            {"year": 2100, "month": 2, "leap": False},
        ]
        for d in test_param:
            dt = time_date.custom_date(d["year"], d["month"])
            is_leap = dt.is_leap_year()
            self.assertEqual(is_leap, d["leap"])
            
    def test_year_boundary(self):
        a = time_date.custom_date(2023, 6, 15)
        val = a.start_of_year().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 1)
        self.assertEqual(val.day, 1)
        
        a = time_date.custom_date(2023, 3, 15)
        val = a.end_of_year().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 12)
        self.assertEqual(val.day, 31)
        
    def test_month_boundary(self):
        a = time_date.custom_date(2023, 4, 15)
        val = a.start_of_month().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 4)
        self.assertEqual(val.day, 1)
        
        a = time_date.custom_date(2023, 4, 15)
        val = a.end_of_month().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 4)
        self.assertEqual(val.day, 30)
        
        a = time_date.custom_date(2023, 3, 15)
        val = a.start_of_month().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 3)
        self.assertEqual(val.day, 1)
        
        a = time_date.custom_date(2023, 3, 15)
        val = a.end_of_month().date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 3)
        self.assertEqual(val.day, 31)
            
            
    def test_month_add(self):
        a = time_date.custom_date(2023, 2, 28)
        val = a.add_months(1).date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 3)
        self.assertEqual(val.day, 28)
        
        a = time_date.custom_date(2023, 1, 31)
        val = a.add_months(1).date
        self.assertEqual(val.year, 2023)
        self.assertEqual(val.month, 2)
        self.assertEqual(val.day, 28)
        
        a = time_date.custom_date(2024, 1, 31)
        val = a.add_months(1).date
        self.assertEqual(val.year, 2024)
        self.assertEqual(val.month, 2)
        self.assertEqual(val.day, 29)
        
        
            
    
