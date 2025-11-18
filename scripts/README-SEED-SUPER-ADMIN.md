# Seed Super Admin Script

This script creates a super admin user in your Supabase database.

## ⚠️ Security Warning

**NEVER commit `SUPABASE_SERVICE_ROLE_KEY` to git!** This key has full admin access to your Supabase project.

## Prerequisites

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Usage

Run the script using `tsx`:

```bash
tsx scripts/seed-super-admin.ts
```

Or if you have an npm script configured:

```bash
npm run seed:super-admin
```

## What It Does

1. Creates a new user with email `admin@adtopia.com`
2. Sets a default password (⚠️ **change this after first login!**)
3. Assigns the `super_admin` role (or `admin` if `super_admin` doesn't exist)
4. Confirms the email automatically

## Default Credentials

- **Email:** `admin@adtopia.com`
- **Password:** `SecurePassword123!`

⚠️ **IMPORTANT:** Change the password immediately after first login!

## Troubleshooting

### Error: "Missing environment variables"
- Make sure `.env.local` exists in the project root
- Verify `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Error: "User already exists"
- The script will automatically check if the user exists
- If the user exists but doesn't have a role, it will assign one
- If the user already has a role, it will skip

### Error: "Error assigning role"
- Make sure the `user_roles` table exists in your Supabase database
- Verify the role enum includes `super_admin` or `admin`
- The script will try `super_admin` first, then fallback to `admin`

## Notes

- The script is idempotent - safe to run multiple times
- It will skip if the user and role already exist
- The script uses the Supabase Admin API, which requires the service role key

