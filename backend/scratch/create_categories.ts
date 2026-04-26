import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, CategoryStatus } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting category creation...");

  // 1. Create Main Category
  const toolsAccessories = await prisma.category.upsert({
    where: { slug: "tools-accessories" },
    update: {},
    create: {
      name: "Tools & Accessories",
      slug: "tools-accessories",
      description: "Essential tools and accessories for traditional embroidery and artisan work.",
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
    },
  });
  console.log(`Main category: ${toolsAccessories.name} (ID: ${toolsAccessories.id})`);

  // 2. Create Catalog Sub-category
  const catalog = await prisma.category.upsert({
    where: { slug: "catalog" },
    update: { parentId: toolsAccessories.id },
    create: {
      name: "Catalog",
      slug: "catalog",
      description: "Our comprehensive collection of jewelry making and embroidery tools.",
      parentId: toolsAccessories.id,
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });
  console.log(`Sub-category: ${catalog.name} (ID: ${catalog.id})`);

  // 3. Create Sub-categories directly under Tools & Accessories
  await prisma.category.upsert({
    where: { slug: "embroidery-frame" },
    update: { parentId: toolsAccessories.id },
    create: {
      name: "Embroidery Frame",
      slug: "embroidery-frame",
      description: "High-quality frames for stabilizing fabric during detailed work.",
      parentId: toolsAccessories.id,
      status: CategoryStatus.ACTIVE,
    },
  });

  await prisma.category.upsert({
    where: { slug: "needles" },
    update: { parentId: toolsAccessories.id },
    create: {
      name: "Needles",
      slug: "needles",
      description: "Specialized needles for various embroidery techniques.",
      parentId: toolsAccessories.id,
      status: CategoryStatus.ACTIVE,
    },
  });

  console.log("Done! Created Embroidery Frame and Needles.");
}

main()
  .catch((e) => {
    console.error("Error creating categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
