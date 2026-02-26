// models/Impact.js
const { db } = require('../config/database');

class Impact {
  // Create new impact record
  static create(impactData, callback) {
    const { project_id, beneficiary_id, donation_id, impact_description, amount_used, status_update } = impactData;
    const sql = `INSERT INTO impact_tracking (project_id, beneficiary_id, donation_id, impact_description, amount_used, status_update) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [project_id, beneficiary_id, donation_id, impact_description, amount_used, status_update], function(err) {
      callback(err, { id: this.lastID, ...impactData });
    });
  }

  // Get all impact records with joins
  static findAll(callback) {
    const sql = `
      SELECT 
        it.*,
        p.name as project_name,
        b.name as beneficiary_name,
        d.donor_name,
        d.amount as donation_amount
      FROM impact_tracking it
      LEFT JOIN projects p ON it.project_id = p.id
      LEFT JOIN users b ON it.id = b.id
      LEFT JOIN donations d ON it.donation_id = d.id
      ORDER BY it.created_at DESC
    `;
    db.all(sql, [], callback);
  }

  // Get impact by ID
  static findById(id, callback) {
    const sql = `
      SELECT 
        it.*,
        p.name as project_name,
        b.name as beneficiary_name,
        d.donor_name
      FROM impact_tracking it
      LEFT JOIN projects p ON it.project_id = p.id
      LEFT JOIN users b ON it.id = b.id
      LEFT JOIN donations d ON it.donation_id = d.id
      WHERE it.id = ?
    `;
    db.get(sql, [id], callback);
  }

  // Get impact summary
  static getSummary(callback) {
    // First, let's check what tables exist and get data from them
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'beneficiary') as beneficiaries_helped,
        (SELECT COUNT(*) FROM projects) as active_projects,
        (SELECT COALESCE(SUM(amount_used), 0) FROM impact_tracking) as total_funds_utilized,
        (SELECT COUNT(*) FROM impact_tracking) as total_impact_records
    `;
    db.get(sql, [], (err, result) => {
      if (err) {
        console.error('Error getting summary:', err);
        return callback(err);
      }
      console.log('Raw summary from database:', result);
      callback(null, result);
    });
  }

  // Get donor impact dashboard data
  static getDonorImpact(donorId, callback) {
    const sql = `
      SELECT 
        COUNT(DISTINCT d.project_id) as projects_supported,
        COALESCE(SUM(d.amount), 0) as total_donated,
        COALESCE(AVG(d.amount), 0) as avg_donation,
        (
          SELECT COUNT(DISTINCT it.beneficiary_id) 
          FROM impact_tracking it
          INNER JOIN donations d2 ON it.donation_id = d2.id
          WHERE d2.donor_id = ?
        ) as beneficiaries_impacted,
        (
          SELECT COUNT(*) 
          FROM impact_tracking it
          INNER JOIN donations d2 ON it.donation_id = d2.id
          WHERE d2.donor_id = ?
        ) as impact_records_count
      FROM donations d
      WHERE d.donor_id = ?
    `;
    
    db.get(sql, [donorId, donorId, donorId], (err, stats) => {
      if (err) {
        return callback(err);
      }
      
      // Get donation history with impact details
      const historySql = `
        SELECT 
          d.id as donation_id,
          d.amount,
          d.created_at as donation_date,
          d.status,
          p.title as project_title,
          p.category as project_category,
          it.impact_description,
          it.status_update,
          it.amount_used,
          it.created_at as impact_date
        FROM donations d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN impact_tracking it ON d.id = it.donation_id
        WHERE d.donor_id = ?
        ORDER BY d.created_at DESC
      `;
      
      db.all(historySql, [donorId], (err, history) => {
        if (err) {
          return callback(err);
        }
        
        callback(null, {
          stats: stats || {
            projects_supported: 0,
            total_donated: 0,
            avg_donation: 0,
            beneficiaries_impacted: 0,
            impact_records_count: 0
          },
          history: history || []
        });
      });
    });
  }
}

module.exports = Impact;