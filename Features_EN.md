#  Ecclesix - Your Churches Centralized, Your Administration Simplified

**Ecclesix** is a web app designed to help churches, including headquarters and branches, manage their operations smoothly. It centralizes church administration while giving different leaders and staff the ability to manage tasks according to their roles and permissions. Headquarters can oversee all activities across branches, while branch leaders focus on their local churches.

## Core Features

- **Dashboard**  
- **Member Management**  
- **Department Management**  
- **Church Management**  
- **Event Management**  
- **Finance Management**  
- **Admin Logs and Settings**  
- **Authentication System**  

---

## 1. **Authentication System**

- **Admin Registration**: New admins can register with an email and password to access the app.  
- **OTP Verification**: A one-time password (OTP) using an authenticator is required at login for security.  
- **Password Recovery**: Admins can reset their password and OTP via email if forgotten.  

---

## 2. **User Roles and Permissions**

The system uses roles and permissions to control what admins can access and manage. This makes it easier to assign tasks to the right people.  

### Access Levels

- **SuperAdmins**: Full access to all features and branches.  
- **Admins**: Limited access, focusing only on their assigned church.  
- **Members**: Regular members don’t have access unless promoted to admin roles.

**Key Features:**

- Roles can have up to **22 permissions**.  
- SuperAdmins can assign permissions to roles as needed.  
- Only SuperAdmins can delete members; admins can deactivate them.

---

## 3. **Dashboard**

The dashboard provides an overview of key statistics and trends across all churches.

**Key Metrics:**

- **Member Growth** (Last 6 months)  
- **Church Growth** (Last 6 years)  
- **Minister Count** (Last 6 months)  
- **Event Trends** (Last 6 months)  
- **Attendance Patterns** (Monthly, by event type)  
- **Demographics**: Stats by gender, profession, marital status, and age.  
- **New Members**: Details of the last six new members.  

**Note**: The dashboard is accessible to all admins without special permissions.

---

## 4. **Member Management**

This module helps in managing members efficiently. Admins can add new members, update their details, and assign roles.  

**Key Features:**

- Add, edit,delete and deactivate members.  
- Assign admin or superadmin roles.  
- Search and filter members by criteria like age, gender, profession, marital status, church affiliation, and more.  
- Connect members through family relationships.  
- View full member profiles, including church involvement and baptism status, etc...  
- Track admin activities like last login and roles.

**Permissions:**

- **Add, modify and view members**: Admins can add, edit, and view members in their church.  
- **View All Members**: Gives access to list of all members from all churches.

---

## 5. **Department Management**

Each church can create and manage its departments using this module.  

**Key Features:**

- Add, edit, or delete departments.  
- Assign department heads and manage members.  
- Each church manages its own departments separately.

**Permissions:**

- **Add, modify, delete, and view departments**: Admins can manage departments within their church.
- **Department Heads Permission**: View the list of members within their department.
- **View All Departments**: For viewing departments across all churches.

---

## 6. **Event Management**

This module helps churches organize and track events, including attendance.  

**Key Features:**

- Add and edit events for each church.  
- Define event types and track attendance (men, women, children).  
- Filter events by month, year, type, or church.  
- Generate attendance graphs for weekly and monthly trends.

**Permissions:**

- **Add, modify, delete, and view events**: Admins handle events within their church.  
- **View All Events**:  To access events across all churches.

**Note**: Events can only be edited within 7 days of their creation.

---

## 7. **Church Management**

This module allows superadmins to manage the churches themselves, with the ability to create, modify, and delete churches.

**Key Features:**

- Add, edit, or delete churches.  
- Record church details (name, address, pastor, type—HQ or branch).  
- Churches are grouped by city.
- Each church has a personalized dashboard showing:
  - **Member Count**  
  - **Registration Trends** (Last 6 months)  
  - **Event Stats** (Last 6 months)  
  - **Attendance Rates** (Weekly)  
  - **Demographics**

**Permissions:**

- **Manage Churches**: SuperAdmins have full control, while admins with specific permissions can edit church details.

**Note**: The module is accessible to all admins to view without special permissions.

---

## 8. **Finance Management**

This module provides tools for tracking church income, expenses, and accounts.

**Key Features:**

- **Account Management**: Create accounts like cash or bank.  
- **Income and Expense Tracking**: Record offerings, tithes, salaries, and other expenses etc...  
- **Transaction Approvals**: Transactions need to be approved before affecting balances.  
- **Automated Transfers**: Set up percentage-based automatic transfers between accounts based on income categories.
- **Profit and Loss Reports**: Generate reports for income, expenses, and transfers.  
- **Budget Management**: Create budgets, allocate funds, and track spending history.
- **Finance Log** : Tracks Transactions History, from the time of creation, edit or delete to confirmation/rejection

**Permissions:**

- **View Finance and Add transactions**: Admins can add and view their church’s finances.
- **Confirmation/rejection permissions**:  For approval or rejection of transactions.
- **View finance log**: For viewing finances log.
- **View all finances**: For viewing finances across all churches.
-**Add Budget**: For creating budgets

---

## 9. **Admin Logs**

This module keeps track of all admin activities in the system.

**Key Features:**

- Logs show actions like registration, login, adds, edits, and deletions with timestamps.  
- Logs are kept for 10 days (or longer if needed).  
- Only SuperAdmins can access the logs.

**Permissions:**

- **View Admin Log**: Admins can view admin logs

---

## 10. **Settings**

The settings module allows SuperAdmins to configure system-wide options.

**Key Features:**

- Manage church types, cities, event types, accounts, income/expense categories, and transfer rules etc..  
- Create and manage roles and permissions.

---

## Conclusion

**Ecclesix** is a complete solution for managing both headquarters and branch churches. Its flexible role-based permissions ensure that each admin only accesses what they need. With tools for member management, events, departments, finances, and more, ChMS simplifies church operations and provides useful insights for leaders. Whether managing a single branch or an entire network of churches, ChMS offers the structure and features needed to keep everything running smoothly.
