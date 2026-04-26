/**
 * Admin Promotion Script
 * Usage: npx tsx scripts/promote-admin.ts <email>
 * Example: npx tsx scripts/promote-admin.ts admin@hindustanembroidery.com
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌  Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    console.error("    Make sure this account has been registered first.");
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`✅  ${email} is already an admin. No changes made.`);
    process.exit(0);
  }

  await db.user.update({
    where: { email },
    data: { role: "admin" }
  });

  console.log(`✅  Successfully promoted ${email} to admin role.`);
  console.log("    They can now log in at /admin/login with their existing password.");
}

main()
  .catch((err) => {
    console.error("❌  Script failed:", err.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
