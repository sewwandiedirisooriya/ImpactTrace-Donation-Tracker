// models/Project.js
const { db } = require('../config/database');

class Project {
  // Create new project
  static create(projectData, callback) {
    const { 
      application_id,
      title, 
      description, 
      category, 
      target_amount, 
      location, 
      image_url, 
      start_date, 
      end_date, 
      created_by 
    } = projectData;
    
    const sql = `INSERT INTO projects (
      application_id, title, description, category, target_amount, location, 
      image_url, start_date, end_date, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      application_id,
      title, 
      description, 
      category || 'General', 
      target_amount, 
      location, 
      image_url, 
      start_date, 
      end_date, 
      created_by || 1
    ], function(err) {
      callback(err, { id: this.lastID, ...projectData });
    });
  }

  // Get all projects with creator info
  static findAll(callback) {
    const sql = `
      SELECT 
        p.*,
        p.title as name,
        p.current_amount as collected_amount,
        u.name as creator_name,
        aa.beneficiary_id,
        b.name as beneficiary_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN aid_applications aa ON p.application_id = aa.id
      LEFT JOIN users b ON aa.beneficiary_id = b.id
      ORDER BY p.created_at DESC
    `;
    db.all(sql, [], callback);
  }

  // Get project by ID
  static findById(id, callback) {
    const sql = `
      SELECT 
        p.*,
        p.title as name,
        p.current_amount as collected_amount,
        u.name as creator_name,
        aa.beneficiary_id,
        b.name as beneficiary_name,
        b.email as beneficiary_email,
        b.phone as beneficiary_phone,
        b.location as beneficiary_location
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN aid_applications aa ON p.application_id = aa.id
      LEFT JOIN users b ON aa.beneficiary_id = b.id
      WHERE p.id = ?
    `;
    db.get(sql, [id], callback);
  }

  // Update project current amount
  static updateCollectedAmount(id, amount, callback) {
    const sql = 'UPDATE projects SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [amount, id], callback);
  }

  // Update project status
  static updateStatus(id, status, callback) {
    const sql = 'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [status, id], callback);
  }

  // Update project details
  static update(id, projectData, callback) {
    const { title, description, category, target_amount, location, image_url } = projectData;
    const sql = `UPDATE projects 
                 SET title = ?, description = ?, category = ?, target_amount = ?, 
                     location = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    db.run(sql, [title, description, category, target_amount, location, image_url, id], callback);
  }

  // Delete project
  static delete(id, callback) {
    const sql = 'DELETE FROM projects WHERE id = ?';
    db.run(sql, [id], callback);
  }

  // Get project progress
  static getProgress(callback) {
    const sql = `
      SELECT 
        id,
        title as name,
        target_amount,
        current_amount as collected_amount,
        (CAST(current_amount AS REAL) / target_amount) * 100 as progress_percentage
      FROM projects 
      WHERE status = 'active'
    `;
    db.all(sql, [], callback);
  }

  // Get trending projects (highest target_amount, most popular)
  static findTrending(limit = 5, callback) {
    const sql = `
      SELECT 
        p.*,
        p.title as name,
        p.current_amount as collected_amount,
        u.name as creator_name,
        aa.beneficiary_id,
        b.name as beneficiary_name,
        (CAST(p.current_amount AS REAL) / p.target_amount) * 100 as progress_percentage,
        CASE 
          WHEN p.current_amount >= p.target_amount THEN 'completed'
          ELSE 'active'
        END as funding_status
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN aid_applications aa ON p.application_id = aa.id
      LEFT JOIN users b ON aa.beneficiary_id = b.id
      WHERE p.status = 'active'
      ORDER BY p.target_amount DESC, p.current_amount DESC
      LIMIT ?
    `;
    db.all(sql, [limit], callback);
  }
}

module.exports = Project;