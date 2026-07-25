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
    const existing = await pool.query('SELECT class_id, class_name FROM sgs_class_master');
    const existingIds = existing.rows.map(row => row.class_id);
    const existingNames = existing.rows.map(row => row.class_name);
    
    console.log('Existing class IDs:', existingIds);
    console.log('Existing class names:', existingNames);
    
    // Add missing classes 1-12
    let addedCount = 0;
    let skippedCount = 0;
    
    for (let i = 1; i <= 12; i++) {
      const className = `${i}`;
      
      // Skip if class name already exists
      if (existingNames.includes(className)) {
        console.log(`⏭️ Skipping Class ${i} (${className}) - already exists`);
        skippedCount++;
        continue;
      }
      
      // Skip if class ID already exists
      if (existingIds.includes(i)) {
        console.log(`⏭️ Skipping Class ID ${i} - already exists`);
        skippedCount++;
        continue;
      }
      
      const sectionName = 'A'; // Default section
      
      try {
        await pool.query(
          `INSERT INTO sgs_class_master (class_id, class_name, section_name, record_status) 
           VALUES ($1, $2, $3, 'Active')`,
          [i, className, sectionName]
        );
        console.log(`✅ Added Class ${i} (${className})`);
        addedCount++;
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⏭️ Skipping Class ${i} - duplicate`);
          skippedCount++;
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Added: ${addedCount} classes`);
    console.log(`⏭️ Skipped: ${skippedCount} classes`);
    
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
