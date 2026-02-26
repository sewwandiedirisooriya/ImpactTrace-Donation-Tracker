// models/Beneficiary.js
const { db } = require('../config/database');

class Beneficiary {
  // Create new beneficiary (stores in users table with role='beneficiary')
  static create(beneficiaryData, callback) {
    const { name, email, phone, address, needs_description } = beneficiaryData;
    
    // Insert into users table as a beneficiary
    const sql = `INSERT INTO users (name, email, phone, role, location, password, created_at, updated_at) 
                 VALUES (?, ?, ?, 'beneficiary', ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    
    db.run(
      sql, 
      [name, email, phone, address], 
      function(err) {
        if (err) {
          return callback(err);
        }
        
        // If you need to store the needs_description separately, consider adding an aid_application
        // For now, we're storing it in the users table via location field or you could create a separate beneficiary_profiles table
        
        callback(null, { 
          id: this.lastID, 
          name, 
          email, 
          phone, 
          address,
          needs_description,
          role: 'beneficiary',
          status: 'pending'
        });
      }
    );
  }

  // Get all beneficiaries
  static findAll(callback) {
    const sql = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC';
    db.all(sql, ['beneficiary'], callback);
  }

  // Get beneficiary by ID
  static findById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ? AND role = ?';
    db.get(sql, [id, 'beneficiary'], callback);
  }

  // Update beneficiary status (if you add a status column to users table)
  // Or update via aid_applications status
  static updateStatus(id, status, callback) {
    // If you add a status column to users table:
    const sql = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = ?';
    db.run(sql, [id, 'beneficiary'], callback);
  }

  // Delete beneficiary
  static delete(id, callback) {
    const sql = 'DELETE FROM users WHERE id = ? AND role = ?';
    db.run(sql, [id, 'beneficiary'], callback);
  }

  // Get beneficiaries by application status (from aid_applications table)
  static findByStatus(status, callback) {
    const sql = `
      SELECT DISTINCT u.* 
      FROM users u
      INNER JOIN aid_applications aa ON u.id = aa.beneficiary_id
      WHERE u.role = ? AND aa.status = ?
      ORDER BY u.created_at DESC
    `;
    db.all(sql, ['beneficiary', status], callback);
  }

  // Get beneficiary's applications
  static getApplications(beneficiaryId, callback) {
    const sql = `
      SELECT aa.*, p.title as project_title 
      FROM aid_applications aa
      LEFT JOIN projects p ON aa.project_id = p.id
      WHERE aa.beneficiary_id = ?
      ORDER BY aa.created_at DESC
    `;
    db.all(sql, [beneficiaryId], callback);
  }

  // Create an aid application (better approach for needs_description)
  static createApplication(applicationData, callback) {
    const { project_id, beneficiary_id, description, amount_requested } = applicationData;
    const sql = `
      INSERT INTO aid_applications 
      (project_id, beneficiary_id, application_type, description, amount_requested, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(
      sql,
      [project_id, beneficiary_id, 'general', description, amount_requested],
      function(err) {
        callback(err, { id: this.lastID, ...applicationData, status: 'pending' });
      }
    );
  }

  // Get beneficiaries by email
  static findByEmail(email, callback) {
    const sql = 'SELECT * FROM beneficiaries WHERE email = ? ORDER BY created_at DESC';
    db.all(sql, [email], callback);
  }

  // Get dashboard data for a beneficiary
  static getDashboardData(email, callback) {
    // First, get the beneficiary user ID
    const userQuery = 'SELECT id FROM users WHERE email = ? AND role = ?';
    
    db.get(userQuery, [email, 'beneficiary'], (err, user) => {
      if (err) {
        return callback(err);
      }

      if (!user) {
        return callback(null, {
          totalDonationsReceived: 0,
          recentActivities: [],
          applicationStats: {
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
            total: 0
          }
        });
      }

      const beneficiaryId = user.id;

      // Get total donations received for all projects linked to this beneficiary's applications
      const donationsQuery = `
        SELECT COALESCE(SUM(d.amount), 0) as total_donations
        FROM donations d
        INNER JOIN projects p ON d.project_id = p.id
        INNER JOIN aid_applications aa ON p.id = aa.project_id
        WHERE aa.beneficiary_id = ? AND d.status = 'completed'
      `;

      // Get application statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM aid_applications 
        WHERE beneficiary_id = ?
      `;

      // Get recent applications with project info
      const recentQuery = `
        SELECT 
          aa.id,
          aa.status,
          aa.description,
          aa.amount_requested,
          aa.created_at,
          aa.updated_at,
          p.title as project_title
        FROM aid_applications aa
        LEFT JOIN projects p ON aa.project_id = p.id
        WHERE aa.beneficiary_id = ?
        ORDER BY aa.updated_at DESC 
        LIMIT 5
      `;

      // Execute all queries
      db.get(donationsQuery, [beneficiaryId], (err, donations) => {
        if (err) {
          return callback(err);
        }

        db.get(statsQuery, [beneficiaryId], (err, stats) => {
          if (err) {
            return callback(err);
          }

          db.all(recentQuery, [beneficiaryId], (err, applications) => {
            if (err) {
              return callback(err);
            }

            // Format recent activities
            const recentActivities = (applications || []).map(app => {
              const statusIcons = {
                'pending': 'clock',
                'under_review': 'eye',
                'approved': 'checkmark-circle',
                'rejected': 'close-circle'
              };

              const statusColors = {
                'pending': '#ff9800',
                'under_review': '#2196f3',
                'approved': '#4caf50',
                'rejected': '#f44336'
              };

              return {
                id: app.id,
                type: app.status,
                icon: statusIcons[app.status] || 'document',
                color: statusColors[app.status] || '#999',
                title: `Application ${app.status.replace('_', ' ')}`,
                subtitle: app.project_title || app.description?.substring(0, 50) + '...' || 'No description',
                timestamp: app.updated_at || app.created_at
              };
            });

            const dashboardData = {
              totalDonationsReceived: donations?.total_donations || 0,
              recentActivities: recentActivities,
              applicationStats: {
                pending: stats?.pending || 0,
                under_review: stats?.under_review || 0,
                approved: stats?.approved || 0,
                rejected: stats?.rejected || 0,
                total: stats?.total || 0
              }
            };

            callback(null, dashboardData);
          });
        });
      });
    });
  }
}

module.exports = Beneficiary;