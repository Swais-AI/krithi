const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'swais-db-test-env.cri2kcc26kxg.ap-south-2.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sgs_prod',
  user: process.env.DB_USER || 'swais_app_user',
  password: process.env.DB_PASSWORD || 'Swaisuser007',
  ssl: { rejectUnauthorized: false }
});

async function checkClasses() {
  try {
    const result = await pool.query(
      'SELECT class_id, class_name, section_name FROM sgs_class_master WHERE record_status = \'Active\' ORDER BY class_id'
    );
    console.log('\n📚 Available Classes in Database:');
    console.log('========================================');
    result.rows.forEach(row => {
      console.log(`✅ Class ID: ${row.class_id} | Name: ${row.class_name || 'Class ' + row.class_id} | Section: ${row.section_name || '-'}`);
    });
    console.log('========================================');
    console.log(`Total: ${result.rows.length} classes available`);
    console.log('\n💡 To add a student, use one of these Class IDs (e.g., 1, 2, 3, etc.)');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkClasses();
