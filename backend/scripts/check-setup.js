#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Dayla Backend Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('   Please copy .env.example to .env and fill in your values\n');
  process.exit(1);
} else {
  console.log('✅ .env file exists');
}

// Check if package.json exists
const packagePath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ package.json not found');
  process.exit(1);
} else {
  console.log('✅ package.json exists');
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_AI_API_KEY'
];

const optionalEnvVars = [
  'EMAIL_USER',
  'EMAIL_PASS'
];

console.log('\n🔧 Checking Environment Variables:');

let allRequiredPresent = true;
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`❌ ${envVar} is missing`);
    allRequiredPresent = false;
  } else if (process.env[envVar] === `your_${envVar.toLowerCase()}`) {
    console.log(`⚠️  ${envVar} has default placeholder value`);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`ℹ️  ${envVar} is optional (not set)`);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

// Check JWT secret length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('⚠️  JWT_SECRET should be at least 32 characters long');
  allRequiredPresent = false;
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n⚠️  node_modules not found - run "npm install" first');
} else {
  console.log('\n✅ Dependencies are installed');
}

console.log('\n' + '='.repeat(50));

if (allRequiredPresent) {
  console.log('🎉 Setup check passed! You can now run:');
  console.log('   npm run dev    # Development mode');
  console.log('   npm run seed   # Seed database with sample data');
  console.log('   npm start      # Production mode');
} else {
  console.log('❌ Setup incomplete. Please fix the issues above.');
  console.log('   For help, check the README.md file');
  process.exit(1);
}

console.log('\n🚀 Ready to launch Dayla Backend!');
console.log('🌲 Explore Together ✨\n');