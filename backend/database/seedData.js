// database/seedData.js
// Complete database setup and seeding script
// Run this file ONCE after creating the database: node database/seedData.js
// This script will:
// 1. Initialize all database tables
// 2. Clear any existing data
// 3. Insert sample users, applications, projects, donations, and impact data

const { db, dbPath, initDatabase } = require('../config/database');
const bcrypt = require('bcrypt');

console.log('🌱 Starting database setup and seeding...');
console.log('📍 Database:', dbPath);

async function seedDatabase() {
  try {
    // Initialize database tables
    await initDatabase();
    console.log('✅ Tables created');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const donorPassword = await bcrypt.hash('donor123', 10);
    const beneficiaryPassword = await bcrypt.hash('beneficiary123', 10);

    // Clear existing data in the correct order (to respect foreign keys)
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Disable foreign keys temporarily for clearing
        db.run('PRAGMA foreign_keys = OFF', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.run('DELETE FROM impact_tracking', () => {});
          db.run('DELETE FROM feedback', () => {});
          db.run('DELETE FROM project_updates', () => {});
          db.run('DELETE FROM donations', () => {});
          db.run('DELETE FROM projects', () => {});
          db.run('DELETE FROM aid_applications', () => {});
          db.run('DELETE FROM users', (err) => {
            // Re-enable foreign keys
            db.run('PRAGMA foreign_keys = ON', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
      });
    });

    console.log('✅ Database cleared');
    console.log('✅ Database cleared');

    // Insert all seed data
    db.serialize(() => {
      // 1. Insert Users
      const insertUsers = db.prepare(`
        INSERT INTO users (name, email, phone, password, role, location) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertUsers.run('Admin User', 'admin@impacttrace.com', '+1234567890', adminPassword, 'admin', 'New York, USA');
      insertUsers.run('John Donor', 'john.donor@email.com', '+1234567891', donorPassword, 'donor', 'California, USA');
      insertUsers.run('Jane Donor', 'jane.donor@email.com', '+1234567892', donorPassword, 'donor', 'Texas, USA');
      insertUsers.run('Mary Smith', 'mary.beneficiary@email.com', '+1234567893', beneficiaryPassword, 'beneficiary', 'Kenya');
      insertUsers.run('John Beneficiary', 'john.beneficiary@email.com', '+1234567894', beneficiaryPassword, 'beneficiary', 'Uganda');
      insertUsers.finalize();

      // 2. Insert Aid Applications
      const insertApplications = db.prepare(`
        INSERT INTO aid_applications (
          beneficiary_id, title, description, category, application_type, 
          target_amount, location, items_requested, reason, start_date, end_date, 
          status, reviewed_by, review_notes, reviewed_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertApplications.run(
        4, 'School Supplies for Rural Areas',
        'Providing essential school supplies to children in rural communities. Need notebooks, pens, backpacks for 50 children.',
        'Education', 'School Supplies', 50000, 'Kenya',
        'Notebooks, Pens, Backpacks, Books',
        'My children and others in our village cannot attend school without proper supplies. Many families cannot afford basic educational materials.',
        '2025-01-01', '2025-12-31', 'approved', 1,
        'Application approved. Excellent cause for rural education.',
        '2025-10-05 10:30:00'
      );

      insertApplications.run(
        5, 'Medical Aid Program',
        'Emergency medical assistance for families in need. Need funds for medicines and medical equipment.',
        'Healthcare', 'Medical Aid', 75000, 'Uganda',
        'Medical supplies, Medicines, First aid kits',
        'Emergency surgery needed for my mother and medical supplies for community health center.',
        '2025-02-01', '2025-11-30', 'pending', null, null, null
      );

      insertApplications.run(
        3, 'Clean Water Initiative',
        'Building wells and water filtration systems in remote villages to provide clean drinking water.',
        'Infrastructure', 'Water Infrastructure', 100000, 'Tanzania',
        'Water wells, Filtration systems, Pipes',
        'Our village has no access to clean water. People are getting sick from drinking contaminated water.',
        '2025-03-01', '2025-12-31', 'approved', 1,
        'Critical infrastructure need. Approved for immediate project creation.',
        '2025-10-08 14:20:00'
      );

      insertApplications.run(
        4, 'Personal Computer Request',
        'Need a laptop for personal use',
        'Education', 'Education Support', 3000, 'Kenya',
        'Laptop', 'Want to learn computer skills',
        '2025-04-01', '2025-06-30', 'rejected', 1,
        'Request is too personal. We fund community-level projects only.',
        '2025-10-09 09:15:00'
      );

      insertApplications.run(
        4, 'Community Library Project',
        'Setting up a small library for the community with books and reading materials.',
        'Education', 'Library Setup', 25000, 'Kenya',
        'Books, Shelves, Reading tables, Chairs',
        'Our community has no access to books or educational materials. A library would benefit 200+ families.',
        '2025-05-01', '2025-12-31', 'under_review', 1,
        'Good initiative. Reviewing budget and feasibility.',
        '2025-10-10 11:00:00'
      );
      insertApplications.finalize();

      // 3. Insert Projects
      const insertProjects = db.prepare(`
        INSERT INTO projects (
          application_id, title, description, category, target_amount, 
          current_amount, location, status, image_url, start_date, end_date, created_by
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertProjects.run(
        1, 'School Supplies for Rural Areas',
        'Providing essential school supplies to children in rural communities. Need notebooks, pens, backpacks for 50 children.',
        'Education', 50000, 15000, 'Kenya', 'active', null,
        '2025-01-01', '2025-12-31', 1
      );

      insertProjects.run(
        3, 'Clean Water Initiative',
        'Building wells and water filtration systems in remote villages to provide clean drinking water.',
        'Infrastructure', 100000, 10000, 'Tanzania', 'active', null,
        '2025-03-01', '2025-12-31', 1
      );
      insertProjects.finalize();

      // 4. Insert Donations
      const insertDonations = db.prepare(`
        INSERT INTO donations (project_id, donor_id, amount, currency, purpose, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertDonations.run(1, 2, 10000, 'LKR', 'For school supplies in rural areas', 'completed');
      insertDonations.run(1, 3, 5000, 'LKR', 'Educational books donation', 'completed');
      insertDonations.run(2, 2, 7000, 'LKR', 'Clean water initiative support', 'completed');
      insertDonations.run(2, 3, 3000, 'LKR', 'Help build water wells', 'pending');
      insertDonations.finalize();

      // 5. Insert Project Updates
      const insertUpdates = db.prepare(`
        INSERT INTO project_updates (project_id, title, description, created_by) 
        VALUES (?, ?, ?, ?)
      `);

      insertUpdates.run(
        1, 'First Batch Delivered',
        '50 children received school supplies this week! The community response has been overwhelming.',
        1
      );

      insertUpdates.run(
        2, 'Site Survey Completed',
        'Successfully completed site survey for well locations. Construction to begin next month.',
        1
      );
      insertUpdates.finalize();

      // 6. Insert Feedback
      const insertFeedback = db.prepare(`
        INSERT INTO feedback (beneficiary_id, application_id, project_id, rating, comment) 
        VALUES (?, ?, ?, ?, ?)
      `);

      insertFeedback.run(
        4, 1, 1, 5,
        'Thank you so much! My children are so happy with their new school supplies. This has changed their lives!'
      );
      insertFeedback.finalize();

      // 7. Insert Impact Tracking records
      const insertImpact = db.prepare(`
        INSERT INTO impact_tracking (project_id, beneficiary_id, donation_id, impact_description, amount_used, status_update) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertImpact.run(
        1, 4, 1,
        '50 children received school supplies including notebooks, pens, and backpacks',
        9000,
        'Successfully distributed school supplies to 50 children. They are now attending school regularly with proper materials.'
      );

      insertImpact.run(
        1, 4, 2,
        '25 families received educational books and reading materials',
        4500,
        'Educational books distributed to rural school. Students showing improved academic performance and increased library usage.'
      );

      insertImpact.run(
        2, 5, 3,
        'Water well construction completed in first village',
        6300,
        'First water well now operational. 150 families have access to clean drinking water. Waterborne diseases reduced by 60%.'
      );

      insertImpact.run(
        1, 4, null,
        '120 children benefited from the school supplies program',
        null,
        'Project milestone reached: Over 100 students now have access to proper learning materials. School attendance increased by 45%.'
      );

      insertImpact.run(
        2, 5, null,
        'Clean water access provided to 200+ individuals across 3 villages',
        null,
        'Water filtration systems installed in 3 locations. Community health metrics showing significant improvement. Planning expansion to 2 more villages.'
      );

      insertImpact.finalize();

      console.log('✅ Seed data inserted successfully!');
      
      console.log('\n📊 Sample accounts:');
      console.log('  Admin: admin@impacttrace.com / admin123');
      console.log('  Donor 1: john.donor@email.com / donor123');
      console.log('  Donor 2: jane.donor@email.com / donor123');
      console.log('  Beneficiary 1: mary.beneficiary@email.com / beneficiary123');
      console.log('  Beneficiary 2: john.beneficiary@email.com / beneficiary123');
      console.log('\n📈 Data Summary:');
      console.log('  • 5 Users (1 admin, 2 donors, 2 beneficiaries)');
      console.log('  • 5 Applications (2 approved, 1 pending, 1 rejected, 1 under review)');
      console.log('  • 2 Projects (from approved applications)');
      console.log('  • 4 Donations');
      console.log('  • 2 Project Updates');
      console.log('  • 1 Feedback');
      console.log('  • 5 Impact Tracking Records');
      console.log('\n✅ Database setup complete! You can now start your server.');
    });

    // Close database after all operations
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
      });
    }, 1000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
}

seedDatabase();
