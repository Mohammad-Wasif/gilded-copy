import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { name: true } });
  console.log("Products in DB:", products.map(p => p.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
