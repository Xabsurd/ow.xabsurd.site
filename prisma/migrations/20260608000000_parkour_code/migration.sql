CREATE TABLE "ParkourCode" (
    "id" TEXT NOT NULL,
    "workshopCodeId" TEXT NOT NULL,
    "hero" TEXT NOT NULL,
    "levelCount" INTEGER NOT NULL,
    "difficultyStart" TEXT,
    "timerSupported" BOOLEAN NOT NULL DEFAULT false,
    "beginnerFriendly" BOOLEAN NOT NULL DEFAULT false,
    "averageClearTime" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkourCode_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ParkourCode" (
    "id",
    "workshopCodeId",
    "hero",
    "levelCount",
    "timerSupported",
    "beginnerFriendly",
    "averageClearTime",
    "notes",
    "createdAt",
    "updatedAt"
)
SELECT
    'parkour_' || "id",
    "workshopCodeId",
    'genji',
    "levelCount",
    "timerSupported",
    "beginnerFriendly",
    "averageClearTime",
    "notes",
    "createdAt",
    "updatedAt"
FROM "GenjiPkCode"
ON CONFLICT DO NOTHING;

CREATE UNIQUE INDEX "ParkourCode_workshopCodeId_key" ON "ParkourCode"("workshopCodeId");
CREATE INDEX "ParkourCode_hero_idx" ON "ParkourCode"("hero");
CREATE INDEX "ParkourCode_levelCount_idx" ON "ParkourCode"("levelCount");
CREATE INDEX "ParkourCode_difficultyStart_idx" ON "ParkourCode"("difficultyStart");
CREATE INDEX "ParkourCode_source_idx" ON "ParkourCode"("source");
CREATE UNIQUE INDEX "ParkourCode_source_sourceId_key" ON "ParkourCode"("source", "sourceId");

ALTER TABLE "ParkourCode" ADD CONSTRAINT "ParkourCode_workshopCodeId_fkey" FOREIGN KEY ("workshopCodeId") REFERENCES "WorkshopCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
