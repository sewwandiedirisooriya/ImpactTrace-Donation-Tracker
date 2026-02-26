// models/User.js
const { db } = require('../config/database');

class User {
  // Create a new user (signup)
  static create(userData, callback) {
    const { name, email, phone, password, role } = userData;
    
    console.log('User.create called with:', { name, email, phone: phone ? 'present' : 'null', role });
    
    const sql = `
      INSERT INTO users (name, email, phone, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, email, phone, password, role], function(err) {
      if (err) {
        console.error('❌ Database error in User.create:');
        console.error('   Error message:', err.message);
        console.error('   Error code:', err.code);
        console.error('   SQL:', sql);
        console.error('   Values:', [name, email, phone ? 'present' : null, 'password-hidden', role]);
        return callback(err, null);
      }
      
      console.log('✅ User created successfully with ID:', this.lastID);
      
      callback(null, {
        id: this.lastID,
        name,
        email,
        phone,
        role,
        createdAt: new Date().toISOString()
      });
    });
  }

  // Find user by email
  static findByEmail(email, callback) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    
    db.get(sql, [email], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Find user by ID
  static findById(id, callback) {
    const sql = `SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`;
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Get all users (admin only)
  static getAll(callback) {
    const sql = `SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // Update user
  static update(id, userData, callback) {
    const { name, phone } = userData;
    
    const sql = `
      UPDATE users 
      SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [name, phone, id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, changes: this.changes });
    });
  }

  // Delete user
  static delete(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { changes: this.changes });
    });
  }
}

module.exports = User;
