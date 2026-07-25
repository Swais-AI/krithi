const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'swais-db-test-env.cri2kcc26kxg.ap-south-2.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sgs_prod',
  user: process.env.DB_USER || 'swais_app_user',
  password: process.env.DB_PASSWORD || 'Swaisuser007',
  ssl: { rejectUnauthorized: false }
});

async function addClasses() {
  try {
    console.log('Checking existing classes...');
    
    // Check existing classes
    const existing = await pool.query('SELECT class_id FROM sgs_class_master');
    const existingIds = existing.rows.map(row => row.class_id);
    console.log('Existing class IDs:', existingIds);
    
    // Add missing classes 1-12
    const classesToAdd = [];
    for (let i = 1; i <= 12; i++) {
      if (!existingIds.includes(i)) {
        classesToAdd.push(i);
      }
    }
    
    if (classesToAdd.length === 0) {
      console.log('All classes 1-12 already exist!');
      process.exit(0);
    }
    
    console.log(`Adding classes: ${classesToAdd.join(', ')}`);
    
    // Insert each class
    for (const classId of classesToAdd) {
      const className = `${classId}`;
      const sectionName = 'A'; // Default section
      
      await pool.query(
        `INSERT INTO sgs_class_master (class_id, class_name, section_name, record_status) 
         VALUES ($1, $2, $3, 'Active')`,
        [classId, className, sectionName]
      );
      console.log(`✅ Added Class ${classId} (${className})`);
    }
    
    console.log('\n✅ All classes added successfully!');
    
    // Show all classes
    const result = await pool.query(
      'SELECT class_id, class_name, section_name FROM sgs_class_master ORDER BY class_id'
    );
    console.log('\n📚 All Classes in Database:');
    console.log('----------------------------------------');
    result.rows.forEach(row => {
      console.log(`Class ID: ${row.class_id} | Name: ${row.class_name} | Section: ${row.section_name}`);
    });
    console.log('----------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addClasses();
