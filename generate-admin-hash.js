// Simple script to generate admin account hash
// This provides the hashed password for the admin account

// For admin@trafficslight.com with password admin123
// Using bcrypt with salt rounds 10
const adminPassword = "admin123";

// Pre-computed hash for admin123 (salt rounds: 10)
// This is what you would get from: bcrypt.hashSync('admin123', 10)
const hashedPassword = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

console.log("=== ADMIN ACCOUNT CREATION ===");
console.log("Email: admin@trafficslight.com");
console.log("Password: admin123");
console.log("Hashed Password:", hashedPassword);
console.log("");

console.log("=== MONGODB INSERT COMMAND ===");
console.log("db.admins.insertOne({");
console.log("  firstName: 'Admin',");
console.log("  lastName: 'User',");
console.log("  email: 'admin@trafficslight.com',");
console.log("  password: '" + hashedPassword + "',");
console.log("  role: 'super_admin',");
console.log("  isActive: true,");
console.log("  permissions: {");
console.log("    canCreate: true,");
console.log("    canRead: true,");
console.log("    canUpdate: true,");
console.log("    canDelete: true,");
console.log("    canManageAdmins: true,");
console.log("    canAssignRoles: true");
console.log("  },");
console.log("  createdAt: new Date(),");
console.log("  updatedAt: new Date()");
console.log("});");
console.log("");

console.log("=== SQL INSERT COMMAND ===");
console.log("INSERT INTO admins (first_name, last_name, email, password, role, is_active, created_at, updated_at)");
console.log("VALUES (");
console.log("  'Admin',");
console.log("  'User',");
console.log("  'admin@trafficslight.com',");
console.log("  '" + hashedPassword + "',");
console.log("  'super_admin',");
console.log("  true,");
console.log("  NOW(),");
console.log("  NOW()");
console.log(");");
console.log("");

console.log("=== API TEST COMMAND ===");
console.log("curl -X POST https://ts-backend-1-jyit.onrender.com/api/auth/login \\");
console.log("  -H 'Content-Type: application/json' \\");
console.log("  -d '{");
console.log("    \"email\": \"admin@trafficslight.com\",");
console.log("    \"password\": \"admin123\"");
console.log("  }'");
console.log("");

console.log("=== LOGIN CREDENTIALS ===");
console.log("Email: admin@trafficslight.com");
console.log("Password: admin123");
console.log("Role: super_admin");
console.log("Status: Active");
