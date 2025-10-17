const { execSync } = require('child_process');

console.log('🌱 Starting database seeding...');

try {
  // 运行种子脚本
  execSync('node dist/seed.js', { stdio: 'inherit' });
  console.log('✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  process.exit(1);
}
