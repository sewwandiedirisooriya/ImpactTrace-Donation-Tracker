// models/applications.js
const { db } = require('../config/database');

class Application {
  // Get all aid applications with related data
  static getAll(callback) {
    const query = `
      SELECT 
        aa.*,
        u.name as beneficiary_name,
        u.email as beneficiary_email,
        u.phone as beneficiary_phone,
        p.id as project_id,
        p.title as project_title,
        p.description as project_description,
        reviewer.name as reviewed_by_name
      FROM aid_applications aa
      LEFT JOIN users u ON aa.beneficiary_id = u.id
      LEFT JOIN projects p ON p.application_id = aa.id
      LEFT JOIN users reviewer ON aa.reviewed_by = reviewer.id
      ORDER BY 
        CASE aa.status 
          WHEN 'pending' THEN 1 
          WHEN 'under_review' THEN 2 
          WHEN 'approved' THEN 3 
          WHEN 'rejected' THEN 4 
        END,
        aa.created_at DESC
    `;

    db.all(query, [], callback);
  }

  // Get application by ID
  static getById(id, callback) {
    const query = `
      SELECT 
        aa.*,
        u.name as beneficiary_name,
        u.email as beneficiary_email,
        u.phone as beneficiary_phone,
        u.location as beneficiary_location,
        p.title as project_title,
        p.description as project_description,
        p.category as project_category,
        reviewer.name as reviewed_by_name
      FROM aid_applications aa
      LEFT JOIN users u ON aa.beneficiary_id = u.id
      LEFT JOIN projects p ON p.application_id = aa.id
      LEFT JOIN users reviewer ON aa.reviewed_by = reviewer.id
      WHERE aa.id = ?
    `;

    db.get(query, [id], callback);
  }

  // Get applications by beneficiary ID
  static getByBeneficiary(beneficiaryId, callback) {
    const query = `
      SELECT 
        aa.*,
        p.title as project_title,
        p.description as project_description,
        reviewer.name as reviewed_by_name
      FROM aid_applications aa
      LEFT JOIN projects p ON p.application_id = aa.id
      LEFT JOIN users reviewer ON aa.reviewed_by = reviewer.id
      WHERE aa.beneficiary_id = ?
      ORDER BY aa.created_at DESC
    `;

    db.all(query, [beneficiaryId], callback);
  }

  // Get applications by status
  static getByStatus(status, callback) {
    const query = `
      SELECT 
        aa.*,
        u.name as beneficiary_name,
        u.email as beneficiary_email,
        u.phone as beneficiary_phone,
        p.id as project_id,
        p.title as project_title,
        p.description as project_description
      FROM aid_applications aa
      LEFT JOIN users u ON aa.beneficiary_id = u.id
      LEFT JOIN projects p ON p.application_id = aa.id
      WHERE aa.status = ?
      ORDER BY aa.created_at DESC
    `;

    db.all(query, [status], callback);
  }

  // Create new application
  static create(data, callback) {
    const query = `
      INSERT INTO aid_applications (
        beneficiary_id, title, description, category, application_type,
        target_amount, location, items_requested, reason, image_url,
        start_date, end_date, voice_recording_url, documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.beneficiary_id,
      data.title,
      data.description,
      data.category,
      data.application_type,
      data.target_amount,
      data.location,
      data.items_requested || null,
      data.reason,
      data.image_url || null,
      data.start_date || null,
      data.end_date || null,
      data.voice_recording_url || null,
      data.documents || null
    ];

    db.run(query, params, callback);
  }

  // Get created application with details
  static getCreatedWithDetails(id, callback) {
    const query = `
      SELECT 
        aa.*,
        u.name as beneficiary_name,
        u.email as beneficiary_email
      FROM aid_applications aa
      LEFT JOIN users u ON aa.beneficiary_id = u.id
      WHERE aa.id = ?
    `;

    db.get(query, [id], callback);
  }

  // Update application status
  static updateStatus(id, data, callback) {
    const query = `
      UPDATE aid_applications 
      SET status = ?, 
          reviewed_by = ?,
          review_notes = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(query, [data.status, data.reviewed_by || null, data.review_notes || null, id], callback);
  }

  // Update application
  static update(id, updates, callback) {
    const allowedFields = [
      'title', 'description', 'category', 'application_type', 'target_amount',
      'location', 'items_requested', 'reason', 'image_url', 'start_date', 
      'end_date', 'voice_recording_url', 'documents'
    ];
    
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return callback(new Error('No valid fields to update'));
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE aid_applications SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(query, values, callback);
  }

  // Delete application
  static delete(id, callback) {
    const query = 'DELETE FROM aid_applications WHERE id = ?';
    db.run(query, [id], callback);
  }

  // Get application statistics
  static getStats(callback) {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        ROUND(AVG(CASE 
          WHEN status IN ('approved', 'rejected') AND reviewed_at IS NOT NULL 
          THEN julianday(reviewed_at) - julianday(created_at) 
        END), 1) as avg_processing_days
      FROM aid_applications
    `;

    db.get(query, [], callback);
  }
}

module.exports = Application;
