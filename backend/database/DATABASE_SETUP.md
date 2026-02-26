# Database Setup Guide

## Quick Start (One Command Setup)

To set up the complete database with all sample data, run:

```bash
node database/seedData.js
```

This single command will:
1. ✅ Create all database tables
2. ✅ Clear any existing data
3. ✅ Insert sample users (admin, donors, beneficiaries)
4. ✅ Insert sample applications
5. ✅ Insert sample projects
6. ✅ Insert sample donations
7. ✅ Insert project updates and feedback
8. ✅ Insert impact tracking data

## What Gets Created

### Sample Accounts
- **Admin**: admin@impacttrace.com / admin123
- **Donor 1**: john.donor@email.com / donor123
- **Donor 2**: jane.donor@email.com / donor123
- **Beneficiary 1**: mary.beneficiary@email.com / beneficiary123
- **Beneficiary 2**: john.beneficiary@email.com / beneficiary123

### Sample Data
- 5 Users (1 admin, 2 donors, 2 beneficiaries)
- 5 Applications (2 approved, 1 pending, 1 rejected, 1 under review)
- 2 Projects (created from approved applications)
- 4 Donations (linked to projects)
- 2 Project Updates
- 1 Feedback
- 5 Impact Tracking Records

## Database Reset

To reset the database and start fresh:

```bash
node database/resetDatabase.js
```

⚠️ **Warning**: This will delete all data! Make sure the server is stopped first.

⚠️ **Warning**: This will delete all data! Make sure the server is stopped first.

## Troubleshooting

### Error: Database is locked
- Make sure your backend server is not running
- Close any database browser tools that might be accessing the database

### Error: Tables already exist
- The seedData.js script will automatically clear existing data before inserting new data
- If you encounter issues, run `node database/resetDatabase.js` first

### Missing bcrypt module
```bash
cd backend
npm install bcrypt
```

## Database Location

The SQLite database file is located at:
```
backend/database/impacttrace.db
```

## After Setup

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. The API should be available at:
   ```
   http://localhost:5000
   ```

3. Test login with any of the sample accounts listed above

## Notes

- All passwords are hashed using bcrypt
- Foreign key constraints are properly handled
- The database uses SQLite for easy development
- All seed data is consolidated in one file (`seedData.js`) for simplicity
- For production, consider migrating to PostgreSQL or MySQL

