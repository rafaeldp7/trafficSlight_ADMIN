// Script to create admin account
// Run this script to create the initial admin account

const bcrypt = require('bcryptjs');

// Admin account data
const adminAccount = {
  firstName: "Admin",
  lastName: "User", 
  email: "admin@trafficslight.com",
  password: "admin123",
  role: "super_admin",
  isActive: true,
  permissions: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageAdmins: true,
    canAssignRoles: true
  }
};

// Hash the password
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(adminAccount.password, saltRounds);

// Create the admin user object
const adminUser = {
  ...adminAccount,
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log("Admin Account Created:");
console.log("Email:", adminAccount.email);
console.log("Password:", adminAccount.password);
console.log("Role:", adminAccount.role);
console.log("Hashed Password:", hashedPassword);

// MongoDB Insert Command
console.log("\n=== MongoDB Insert Command ===");
console.log("db.admins.insertOne(");
console.log(JSON.stringify(adminUser, null, 2));
console.log(");");

// SQL Insert Command  
console.log("\n=== SQL Insert Command ===");
console.log("INSERT INTO admins (first_name, last_name, email, password, role, is_active, created_at, updated_at)");
console.log("VALUES (");
console.log(`  '${adminUser.firstName}',`);
console.log(`  '${adminUser.lastName}',`);
console.log(`  '${adminUser.email}',`);
console.log(`  '${hashedPassword}',`);
console.log(`  '${adminUser.role}',`);
console.log(`  ${adminUser.isActive},`);
console.log(`  '${adminUser.createdAt.toISOString()}',`);
console.log(`  '${adminUser.updatedAt.toISOString()}'`);
console.log(");");

// API Endpoint to create admin
console.log("\n=== API Endpoint Usage ===");
console.log("POST /api/admin-management/admins");
console.log("Content-Type: application/json");
console.log("Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN");
console.log("");
console.log(JSON.stringify({
  firstName: adminAccount.firstName,
  lastName: adminAccount.lastName,
  email: adminAccount.email,
  password: adminAccount.password,
  role: adminAccount.role
}, null, 2));

module.exports = { adminUser, adminAccount };
