const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'swais-db-test-env.cri2kcc26kxg.ap-south-2.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sgs_prod',
  user: process.env.DB_USER || 'swais_app_user',
  password: process.env.DB_PASSWORD || 'Swaisuser007',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('🔍 Testing local database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!');
    console.log('📅 Server time:', result.rows[0].now);
    
    // Get the highest student ID
    const idResult = await pool.query(`
      SELECT admission_no 
      FROM sgs_student_master 
      WHERE admission_no LIKE 'S%' 
      ORDER BY admission_no DESC 
      LIMIT 1
    `);
    
    if (idResult.rows.length > 0) {
      const lastId = idResult.rows[0].admission_no;
      const numPart = parseInt(lastId.replace('S', ''));
      console.log(`📊 Last student ID: ${lastId}`);
      console.log(`📊 Next student ID should be: S${String(numPart + 1).padStart(3, '0')}`);
    } else {
      console.log('📊 No students found, next ID should be: S001');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
