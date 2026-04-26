const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:kinari123@localhost:5432/hindustanemb_db?schema=public'
    }
  }
});

db.user
  .update({
    where: { email: 'admin@hindustanembroidery.com' },
    data: { role: 'admin' }
  })
  .then((u) => {
    console.log('Success: Promoted', u.email, 'to role:', u.role);
  })
  .catch(console.error)
  .finally(() => db.$disconnect());
