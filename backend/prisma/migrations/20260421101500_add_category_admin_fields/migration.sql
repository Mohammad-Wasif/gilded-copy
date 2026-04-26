ALTER TABLE "categories"
ADD COLUMN "thumbnailImageUrl" TEXT,
ADD COLUMN "bannerImageUrl" TEXT,
ADD COLUMN "seoTitle" VARCHAR(180),
ADD COLUMN "seoDescription" VARCHAR(320);
