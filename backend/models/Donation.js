// models/Donation.js
const { db } = require('../config/database');

class Donation {
  // Create new donation
  static create(donationData, callback) {
    const { project_id, donor_id, amount, currency, purpose } = donationData;
    const sql = `INSERT INTO donations (project_id, donor_id, amount, currency, purpose) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [project_id, donor_id, amount, currency || 'LKR', purpose || ''], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: this.lastID, ...donationData });
    });
  }

  // Get all donations with user and project details
  static findAll(callback) {
    const sql = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email,
        p.title as project_title,
        p.category as project_category
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN projects p ON d.project_id = p.id
      ORDER BY d.created_at DESC
    `;
    db.all(sql, [], callback);
  }

  // Get donation by ID with details
  static findById(id, callback) {
    const sql = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email,
        p.title as project_title,
        p.category as project_category
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.id = ?
    `;
    db.get(sql, [id], callback);
  }

  // Get donations by donor ID
  static findByDonor(donor_id, callback) {
    const sql = `
      SELECT 
        d.*,
        p.title as project_title,
        p.category as project_category
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.donor_id = ?
      ORDER BY d.created_at DESC
    `;
    db.all(sql, [donor_id], callback);
  }

  // Get donations by project ID
  static findByProject(project_id, callback) {
    const sql = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE d.project_id = ?
      ORDER BY d.created_at DESC
    `;
    db.all(sql, [project_id], callback);
  }

  // Update donation status
  static updateStatus(id, status, callback) {
    const sql = 'UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [status, id], callback);
  }

  // Get total donations amount
  static getTotalAmount(callback) {
    const sql = 'SELECT SUM(amount) as total FROM donations WHERE status = "completed"';
    db.get(sql, [], callback);
  }

  // Get donations by status
  static findByStatus(status, callback) {
    const sql = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email,
        p.title as project_title
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.status = ?
      ORDER BY d.created_at DESC
    `;
    db.all(sql, [status], callback);
  }
}

module.exports = Donation;