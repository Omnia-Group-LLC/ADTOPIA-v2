/**
 * Seed Super Admin Script
 * 
 * This script creates a super admin user in Supabase.
 * 
 * IMPORTANT: This script requires SUPABASE_SERVICE_ROLE_KEY which should NEVER be committed to git.
 * Only run this script locally or in a secure server environment.
 * 
 * Usage:
 *   tsx scripts/seed-super-admin.ts
 * 
 * Environment Variables Required:
 *   - VITE_SUPABASE_URL (or SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nExample .env.local:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSuperAdmin() {
  const email = 'admin@adtopia.com';
  const password = 'SecurePassword123!'; // ⚠️ Change this in production!

  console.log('🚀 Creating super admin user...');
  console.log(`📧 Email: ${email}`);

  try {
    // 1. Create user via admin API
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin',
      },
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      if (createError.message.includes('already registered')) {
        console.log('ℹ️  User already exists. Skipping user creation.');
        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === email);
        if (!existingUser) {
          console.error('❌ Could not find existing user');
          return;
        }
        console.log('✓ Found existing user:', existingUser.id);
        
        // Check if role already exists (check both super_admin and admin)
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .in('role', ['super_admin', 'admin']);
        
        if (existingRoles && existingRoles.length > 0) {
          console.log(`✓ Admin role already assigned: ${existingRoles[0].role}`);
          return;
        }
        
        // Assign role to existing user (try super_admin first, fallback to admin)
        let roleError = null;
        let roleAssigned = false;
        let assignedRole = 'super_admin';
        
        // Try super_admin first
        const { error: superAdminError } = await supabase
          .from('user_roles')
          .insert({
            user_id: existingUser.id,
            role: 'super_admin',
          });
        
        if (!superAdminError) {
          roleAssigned = true;
        } else {
          // Fallback to admin if super_admin doesn't exist
          console.log('ℹ️  super_admin role not found, trying admin...');
          const { error: adminError } = await supabase
            .from('user_roles')
            .insert({
              user_id: existingUser.id,
              role: 'admin',
            });
          
          if (!adminError) {
            roleAssigned = true;
            assignedRole = 'admin';
          } else {
            roleError = adminError;
          }
        }
        
        if (roleError || !roleAssigned) {
          console.error('❌ Error assigning role:', roleError?.message || 'Unknown error');
          console.error('💡 Make sure the user_roles table exists and the role enum includes your desired role');
          return;
        }
        
        console.log(`✓ ${assignedRole} role assigned successfully!`);
        console.log('\n📋 Login credentials:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        return;
      }
      return;
    }

    if (!user.user) {
      console.error('❌ No user data returned');
      return;
    }

    console.log('✓ User created:', user.user.id);

    // 2. Assign super_admin role (try super_admin first, fallback to admin)
    let roleError = null;
    let roleAssigned = false;
    let assignedRole = 'super_admin';
    
    // Try super_admin first
    const { error: superAdminError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.user.id,
        role: 'super_admin',
      });

    if (!superAdminError) {
      roleAssigned = true;
    } else {
      // Fallback to admin if super_admin doesn't exist
      console.log('ℹ️  super_admin role not found, trying admin...');
      const { error: adminError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.user.id,
          role: 'admin',
        });
      
      if (!adminError) {
        roleAssigned = true;
        assignedRole = 'admin';
      } else {
        roleError = adminError;
      }
    }

    if (roleError || !roleAssigned) {
      console.error('❌ Error assigning role:', roleError?.message || 'Unknown error');
      console.error('💡 Make sure the user_roles table exists and the role enum includes your desired role');
      console.error('Full error:', roleError);
      return;
    }

    console.log(`✓ ${assignedRole} role assigned successfully!`);
    console.log('\n📋 Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedSuperAdmin().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

