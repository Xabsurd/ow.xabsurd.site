CREATE TABLE "MapOverride" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zhName" TEXT,
    "mode" TEXT NOT NULL,
    "image" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MapOverride_slug_key" ON "MapOverride"("slug");
CREATE INDEX "MapOverride_isEnabled_idx" ON "MapOverride"("isEnabled");
CREATE INDEX "MapOverride_mode_idx" ON "MapOverride"("mode");
