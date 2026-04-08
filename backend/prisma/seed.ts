import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, ProductStatus, ProductVariantStatus, CategoryStatus } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Root Categories
  const threadsZari = await prisma.category.create({
    data: {
      name: "Threads & Zari",
      slug: "threads-and-zari",
      description: "Premium metallic threads and zari for fine embroidery and hand-crafted pieces.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnt8Ye2zoDsaaisRu2UQ0n4lIcgohzlWPmOtAyzrUGl5CvqI9DnWGswxqd50eIrOk8LzxCjicoW13ipLbeLRbErk82cbQCdvm7pm8AaVoCFDg7MQMq1R28trSU8ohnfF-kQspFCl6dqQdxakqOgBHhpqd6cEQ_xbTBjI5rO658JnuIgcmOn3QPTaAHNll13FhnJMFVLpf6i-gqo3XcfHqmMXJxmeZI0hCvJEYrxQju8f6mV7inFqMeBXnST9_mlaI2esB-wSTFDF8",
      status: CategoryStatus.ACTIVE,
      sortOrder: 1
    }
  });

  const embellishments = await prisma.category.create({
    data: {
      name: "Embellishments",
      slug: "embellishments",
      description: "Artisan beads, sequins, and pearls for elevating elegant design projects.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVJjCXm1nDyWGXNAyt-rkZyoT5BTlIaLvEVI7vokxWVSdYa5BNGwUq9NX-mtrwDSUdly4pnrYB6DhuLnU9ecZiTfuVAYZ8TJ9K63GlvR3ApKPcuD8qvQ6vLVGPh0_9J8YqT7QxZCI15sOaCD5w-2kv9KpSRvZozIxkYRk2vU9JGi9esh9DfLYpFLqP87w8-RiZbIssp474vut5nt5P3wg6Hc0ZYJuWln1QlHUBzbSCCm4XlA9wsHGrmlDXOcbYWuj8PqufFAseGiw",
      status: CategoryStatus.ACTIVE,
      sortOrder: 2
    }
  });

  // Subcategories
  const goldDabka = await prisma.category.create({
    data: {
      name: "Gold Dabka",
      slug: "gold-dabka",
      description: "Coiled metallic gold wires for zardosi craft.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNerdXAZM9-RYKZfOWAY4r5OhS42R6yO5YUKcW6YtC30oHTEYszTS9V2meGkVEyVtsF_jfSGe6vh9jTww6lvyxR-l-MziiJg0t9L6QKtDPXC0nh6r145LHfQTySO1YZnkIDntlJreS-9PHoeHuS8GjGYH5qMA4lwwdT9tisPkAOtyQ7R_Xna5J0AcDht0aHWoZbuM7T50uY09Bs9ZmSyqjxiKQPYb_1CK7PZZr7gzMxweDf3j2tceTuLmCw2iccTpRca00M19pX4k",
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
      parentId: threadsZari.id
    }
  });

  const silverNakshi = await prisma.category.create({
    data: {
      name: "Silver Nakshi",
      slug: "silver-nakshi",
      description: "Delicate silver wires with detailed engraving.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi2c_TyM9f6kBfbZJGnTEjwli3z8n636cclHkGbGfynEYaSe8ayaP9SvuBom0ji5a4_7N42W8vKr0Tnk1attuLy4Vz2T9bYc6i-8BVU5Dl_RC0jpR4n2cVa_abfABbZKLdCdRwshKB-Voh9mduLTrfZklmQGhDoZfbciBZ0q4DOmSXj21WTGNFjlYIMHagSZpv_l8ddBJ3omFgC5P3qUJlTDVdp4fUgeZSCMZ5uN7aaPQCKyWMTk_oT--YRpDT01AHO3HQkHj22NE",
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
      parentId: threadsZari.id
    }
  });

  const copperGijai = await prisma.category.create({
    data: {
      name: "Copper Gijai",
      slug: "copper-gijai",
      description: "Traditional twisted copper wiring.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuU452P7gLY5qjhkgEE_o5RA1pwCdgdtGs3tSIxEl0-rwDHjkD_kosHnCYzueGUFUsZScLT42COMjw1EhIwOAEVEizrDuH0kBvM9sfgEquwL9Oe6N3ag6EmgCAmkev23aRUHS1Ij8_gI9hrG8RXRV5eFC0UrurLl5qvoU1n8kNcbLk5MvrVCxVoA1gWnzDbpV2dzA4Q-GeQOuDr5GgMLu1-A3lXyzl1PrDMaMkHbSCCyMeKItVOcjdDvM_Rw0RFHPGYtIqyldrYXc",
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
      parentId: threadsZari.id
    }
  });

  const sequins = await prisma.category.create({
    data: {
      name: "Sequins",
      slug: "sequins",
      description: "Vibrant sequins for glamorous accents.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu19GJp5XWRhmlllvvbGIfU_aedK-wSgJmuTocBZoPY3bLNIYUZGSZosVr_1qHQr-lDEVci-RmGJpH_O4-BasSjyh-FjGY-WK9mK_UpgAYWRlsymEnvk5yI6ssREPdzLLZhpdG8cza0D2r057EtfapmBdFGhhqBGejNBYjEtq7tmZ7iXnmiUUsvj1vGpwuIVemjmqzoCRZgRCI6r-UdqwTZUXFY8-be-FGt1ezuwGwzAoom16wMISwFySrTU8V_dtSr4QBGeR0r5Q",
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
      parentId: embellishments.id
    }
  });

  const beadsPearls = await prisma.category.create({
    data: {
      name: "Beads & Pearls",
      slug: "beads-pearls",
      description: "Hand-polished beads and pearls for delicate textures.",
      primaryImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVJjCXm1nDyWGXNAyt-rkZyoT5BTlIaLvEVI7vokxWVSdYa5BNGwUq9NX-mtrwDSUdly4pnrYB6DhuLnU9ecZiTfuVAYZ8TJ9K63GlvR3ApKPcuD8qvQ6vLVGPh0_9J8YqT7QxZCI15sOaCD5w-2kv9KpSRvZozIxkYRk2vU9JGi9esh9DfLYpFLqP87w8-RiZbIssp474vut5nt5P3wg6Hc0ZYJuWln1QlHUBzbSCCm4XlA9wsHGrmlDXOcbYWuj8PqufFAseGiw",
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
      parentId: embellishments.id
    }
  });

  const products: Prisma.ProductCreateInput[] = [
    {
      name: "Antique French Zari Thread",
      slug: "antique-french-zari-thread",
      shortDescription: "A fine vintage zari thread for delicate metallic embroidery.",
      description: "Our Antique French Zari Thread is unparalleled in its richness. With decades of preserved luster, it serves perfectly for specialized handcrafted projects.",
      status: ProductStatus.ACTIVE,
      sku: "ZARI-ANT-FR-01",
      stockQuantity: 150,
      basePrice: new Prisma.Decimal("124.00"),
      isFeatured: true,
      sortOrder: 1,
      category: { connect: { id: goldDabka.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs",
            altText: "Antique French Zari Thread Spool",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "Pack of 3",
            size: "3 Units",
            color: "Gold",
            material: "Metallic Thread",
            sku: "ZARI-ANT-FR-01-PK3",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("124.00"),
            stockQuantity: 150,
            sortOrder: 1
          }
        ]
      }
    },
    {
      name: "Premium Sterling Dabka Coil",
      slug: "premium-sterling-dabka-coil",
      shortDescription: "High-grade sterling silver coiled wire.",
      description: "Perfectly crafted sterling silver dabka coils, offering flexibility and striking shine for wedding apparel.",
      status: ProductStatus.ACTIVE,
      sku: "DABKA-SIL-PREM-02",
      stockQuantity: 85,
      basePrice: new Prisma.Decimal("89.00"),
      isFeatured: true,
      sortOrder: 2,
      category: { connect: { id: silverNakshi.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi2c_TyM9f6kBfbZJGnTEjwli3z8n636cclHkGbGfynEYaSe8ayaP9SvuBom0ji5a4_7N42W8vKr0Tnk1attuLy4Vz2T9bYc6i-8BVU5Dl_RC0jpR4n2cVa_abfABbZKLdCdRwshKB-Voh9mduLTrfZklmQGhDoZfbciBZ0q4DOmSXj21WTGNFjlYIMHagSZpv_l8ddBJ3omFgC5P3qUJlTDVdp4fUgeZSCMZ5uN7aaPQCKyWMTk_oT--YRpDT01AHO3HQkHj22NE",
            altText: "Sterling Dabka Coil",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "Grade A",
            size: "100g",
            color: "Silver",
            material: "Sterling Silver",
            sku: "DABKA-SIL-PREM-02-100G",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("89.00"),
            stockQuantity: 85,
            sortOrder: 1
          }
        ]
      }
    },
    {
      name: "Iridescent Glass Sequins",
      slug: "iridescent-glass-sequins",
      shortDescription: "Multicolor iridescent sequins providing brilliant light reflection.",
      description: "A favorite among artisans, these glass sequins shift colors depending on the viewing angle.",
      status: ProductStatus.ACTIVE,
      sku: "SEQ-GLS-IRI-03",
      stockQuantity: 200,
      basePrice: new Prisma.Decimal("45.00"),
      isFeatured: false,
      sortOrder: 3,
      category: { connect: { id: sequins.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu19GJp5XWRhmlllvvbGIfU_aedK-wSgJmuTocBZoPY3bLNIYUZGSZosVr_1qHQr-lDEVci-RmGJpH_O4-BasSjyh-FjGY-WK9mK_UpgAYWRlsymEnvk5yI6ssREPdzLLZhpdG8cza0D2r057EtfapmBdFGhhqBGejNBYjEtq7tmZ7iXnmiUUsvj1vGpwuIVemjmqzoCRZgRCI6r-UdqwTZUXFY8-be-FGt1ezuwGwzAoom16wMISwFySrTU8V_dtSr4QBGeR0r5Q",
            altText: "Iridescent Glass Sequins",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "50g Pack",
            size: "50g",
            color: "Iridescent",
            material: "Glass",
            sku: "SEQ-GLS-IRI-03-50G",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("45.00"),
            stockQuantity: 200,
            sortOrder: 1
          }
        ]
      }
    },
    {
      name: "Burnt Copper Gijai Wire",
      slug: "burnt-copper-gijai-wire",
      shortDescription: "Professional grade burnt copper wire with a rustic finish.",
      description: "Perfect for defining borders and creating 3D elements in traditional embroidery.",
      status: ProductStatus.ACTIVE,
      sku: "GIJ-COP-B-04",
      stockQuantity: 60,
      basePrice: new Prisma.Decimal("68.00"),
      isFeatured: false,
      sortOrder: 4,
      category: { connect: { id: copperGijai.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuU452P7gLY5qjhkgEE_o5RA1pwCdgdtGs3tSIxEl0-rwDHjkD_kosHnCYzueGUFUsZScLT42COMjw1EhIwOAEVEizrDuH0kBvM9sfgEquwL9Oe6N3ag6EmgCAmkev23aRUHS1Ij8_gI9hrG8RXRV5eFC0UrurLl5qvoU1n8kNcbLk5MvrVCxVoA1gWnzDbpV2dzA4Q-GeQOuDr5GgMLu1-A3lXyzl1PrDMaMkHbSCCyMeKItVOcjdDvM_Rw0RFHPGYtIqyldrYXc",
            altText: "Burnt Copper Gijai Wire",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "Professional Grade",
            size: "100g",
            color: "Burnt Copper",
            material: "Copper",
            sku: "GIJ-COP-B-04-PRO",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("68.00"),
            stockQuantity: 60,
            sortOrder: 1
          }
        ]
      }
    },
    {
      name: "Hand-Polished Bead Assortment",
      slug: "hand-polished-bead-assortment",
      shortDescription: "A limited batch of hand-polished artisan beads.",
      description: "A meticulously sourced assortment of heritage beads designed for high-end fashion and heirloom preservation.",
      status: ProductStatus.ACTIVE,
      sku: "BEAD-AST-05",
      stockQuantity: 30,
      basePrice: new Prisma.Decimal("112.00"),
      isFeatured: true,
      sortOrder: 5,
      category: { connect: { id: beadsPearls.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVJjCXm1nDyWGXNAyt-rkZyoT5BTlIaLvEVI7vokxWVSdYa5BNGwUq9NX-mtrwDSUdly4pnrYB6DhuLnU9ecZiTfuVAYZ8TJ9K63GlvR3ApKPcuD8qvQ6vLVGPh0_9J8YqT7QxZCI15sOaCD5w-2kv9KpSRvZozIxkYRk2vU9JGi9esh9DfLYpFLqP87w8-RiZbIssp474vut5nt5P3wg6Hc0ZYJuWln1QlHUBzbSCCm4XlA9wsHGrmlDXOcbYWuj8PqufFAseGiw",
            altText: "Hand-Polished Bead Assortment",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "Limited Batch",
            size: "Box of 200",
            color: "Mixed Earth",
            material: "Polished Stone",
            sku: "BEAD-AST-05-LTD",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("112.00"),
            stockQuantity: 30,
            sortOrder: 1
          }
        ]
      }
    },
    {
      name: "Champagne Gold Bullion",
      slug: "champagne-gold-bullion",
      shortDescription: "Fine gold bullion coils reserved for royal applications.",
      description: "This Champagne Gold Bullion adds rich, three-dimensional volume to artisanal zari work.",
      status: ProductStatus.ACTIVE,
      sku: "BUL-GLD-C-06",
      stockQuantity: 120,
      basePrice: new Prisma.Decimal("156.00"),
      isFeatured: true,
      sortOrder: 6,
      category: { connect: { id: goldDabka.id } },
      images: {
        create: [
          {
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk_kQV_ZRJq3n2Tc2V61fSouK_XBdWbUtmk3DYLVbGUP9CSIAHesDJ5C2UqKQUSYCopL7m7Qq0dnzg_Rwltz6a9-KUm5T2pEcFE3zhkuSQ5RvhsfIqEnQmbfJ5uYQkmTX9IlWxxrssB1llP0O2iQVfMIEdqgj8FGG0o6VGpgjuWeqq3n_sBchLk5bqKSVKEqvluKHWAlEUoIYG0vwot1OCQ62n9_TX70d3Xpa_MUyOqBTZkAaWDI0Ebnt4i5hb-_hRbhSFQ4P-Ehw",
            altText: "Champagne Gold Bullion",
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            title: "Pack of 5",
            size: "10g per Pack",
            color: "Champagne Gold",
            material: "Metallic Coil",
            sku: "BUL-GLD-C-06-PK5",
            status: ProductVariantStatus.ACTIVE,
            priceOverride: new Prisma.Decimal("156.00"),
            stockQuantity: 120,
            sortOrder: 1
          }
        ]
      }
    }
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    });
  }

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const imageCount = await prisma.productImage.count();
  const variantCount = await prisma.productVariant.count();

  console.log(
    JSON.stringify(
      {
        seeded: true,
        categories: categoryCount,
        products: productCount,
        productImages: imageCount,
        productVariants: variantCount
      },
      null,
      2
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
