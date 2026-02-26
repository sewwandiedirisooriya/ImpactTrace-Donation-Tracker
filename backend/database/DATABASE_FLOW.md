# Database Flow - Corrected Structure

## 📋 Overview
The database has been restructured to follow the correct flow:
**Applications → Approval → Projects → Donations**

---

## 🔄 New Flow

### 1. **Beneficiaries Submit Applications**
- Beneficiaries create applications with **ALL** project details:
  - Title, Description, Category
  - Target Amount, Location
  - Start Date, End Date
  - Items Requested, Reason
  - Optional: Images, Voice Recordings, Documents
- Status starts as `pending`

### 2. **Admin Reviews Applications**
- Admin reviews pending applications
- Can set status to:
  - ✅ `approved` - Ready to become a project
  - ❌ `rejected` - Not suitable
  - 🔍 `under_review` - Needs more information
- Admin adds review notes and timestamp

### 3. **Admin Creates Projects from Approved Applications**
- Once approved, admin clicks "Create Project" button
- System creates a new project linked to the application via `application_id`
- Project inherits all details from the application:
  - Title, Description, Category
  - Target Amount, Location
  - Start Date, End Date, Image URL
- Project starts as `active` status

### 4. **Donors View and Donate to Projects**
- Donors browse active projects
- Make donations to specific projects
- Track their donation history
- See project updates and impact

### 5. **Project Updates & Impact Tracking**
- Admin posts updates on project progress
- Impact tracking records how donations are used
- Beneficiaries provide feedback
- Donors see the real impact of their contributions

---

## 📊 Key Tables

### `aid_applications` (Primary)
Contains all application details submitted by beneficiaries:
```sql
- beneficiary_id (who applied)
- title, description, category
- target_amount, location
- start_date, end_date
- items_requested, reason
- status (pending/approved/rejected/under_review)
- reviewed_by, review_notes, reviewed_at
```

### `projects` (Created from Applications)
Linked to approved applications:
```sql
- application_id (UNIQUE - links to aid_applications)
- title, description, category (copied from application)
- target_amount, current_amount
- location, status
- created_by (admin who created the project)
```

### `donations` (Linked to Projects)
```sql
- project_id (which project)
- donor_id (who donated)
- amount, currency, purpose
- status (pending/completed/failed)
```

---

## 🔗 Relationships

```
aid_applications (1) ←→ (1) projects
    ↓
beneficiaries        donations
                        ↓
                     donors
```

### Key Constraints:
- ✅ One Application → One Project (via UNIQUE `application_id`)
- ✅ One Beneficiary → Many Applications
- ✅ One Project → Many Donations
- ✅ One Donor → Many Donations
- ✅ Projects CANNOT exist without an approved application

---

## 🎯 Example Workflow

### Step 1: Beneficiary Creates Application
```javascript
POST /api/applications
{
  "title": "School Supplies for 100 Children",
  "description": "Provide basic school supplies...",
  "category": "Education",
  "target_amount": 50000,
  "location": "Kenya",
  "items_requested": "Notebooks, Pens, Backpacks",
  "reason": "Children cannot attend school...",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```
→ Creates application with `status: 'pending'`

### Step 2: Admin Reviews Application
```javascript
PATCH /api/applications/:id/review
{
  "status": "approved",
  "review_notes": "Excellent cause for rural education"
}
```
→ Updates application status to `approved`

### Step 3: Admin Creates Project
```javascript
POST /api/projects/from-application/:applicationId
```
→ Creates project linked to application

### Step 4: Donors Donate
```javascript
POST /api/donations
{
  "project_id": 1,
  "amount": 5000,
  "purpose": "Supporting education"
}
```
→ Creates donation, updates `current_amount` in project

---

## 🗄️ Database Setup Instructions

### 1. Delete old database (if exists)
```bash
# Delete the old database file
rm backend/database/impacttrace.db
```

### 2. Setup new database structure
```bash
node backend/database/setupDatabase.js
```

### 3. Seed with sample data
```bash
node backend/database/seedData.js
```

### 4. Verify the setup
Sample accounts created:
- **Admin**: `admin@impacttrace.com` / `admin123`
- **Donor**: `john.donor@email.com` / `donor123`
- **Beneficiary**: `mary.beneficiary@email.com` / `beneficiary123`

---

## 📝 Sample Data Included

### Applications (5 total)
1. ✅ **School Supplies** - Approved → Project created
2. ⏳ **Medical Aid** - Pending review
3. ✅ **Clean Water Initiative** - Approved → Project created
4. ❌ **Personal Computer** - Rejected
5. 🔍 **Community Library** - Under review

### Projects (2 total)
1. **School Supplies for Rural Areas** (from Application #1)
   - Target: 50,000 LKR
   - Current: 15,000 LKR
   - Status: Active

2. **Clean Water Initiative** (from Application #3)
   - Target: 100,000 LKR
   - Current: 10,000 LKR
   - Status: Active

### Donations (4 total)
- Various donations to the active projects
- Some completed, some pending

---

## 🚨 Important Notes

1. **Projects MUST be created from applications** - Cannot create standalone projects
2. **Only approved applications can become projects** - Status must be 'approved'
3. **One application = One project** - The `application_id` is UNIQUE in projects table
4. **All project details come from application** - Admin doesn't enter details twice
5. **Beneficiaries own applications** - Projects are owned by admin but linked to beneficiary via application

---

## 🔧 Migration from Old Structure

If you have existing data in the old structure, you'll need to:

1. **Backup old database**
2. **Extract application data from projects**
3. **Create applications first**
4. **Recreate projects with application links**
5. **Update all foreign key references**

---

## ✅ Benefits of New Structure

1. ✅ **Correct workflow** - Applications → Approval → Projects
2. ✅ **Better tracking** - Know which application each project came from
3. ✅ **Cleaner data** - No duplicate information
4. ✅ **Audit trail** - Full history of application → project creation
5. ✅ **Flexibility** - Can have approved applications without projects yet
