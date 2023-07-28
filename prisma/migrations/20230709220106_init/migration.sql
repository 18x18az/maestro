-- CreateTable
CREATE TABLE "Team" (
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "teamNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "CheckIn_teamNumber_fkey" FOREIGN KEY ("teamNumber") REFERENCES "Team" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionGroup" (
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InspectionCriteria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "program" TEXT,
    CONSTRAINT "InspectionCriteria_groupName_fkey" FOREIGN KEY ("groupName") REFERENCES "InspectionGroup" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckedInspection" (
    "teamNumber" TEXT NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    CONSTRAINT "CheckedInspection_teamNumber_fkey" FOREIGN KEY ("teamNumber") REFERENCES "Team" ("number") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckedInspection_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "InspectionCriteria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_number_key" ON "Team"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_teamNumber_key" ON "CheckIn"("teamNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionGroup_name_key" ON "InspectionGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionCriteria_text_key" ON "InspectionCriteria"("text");

-- CreateIndex
CREATE UNIQUE INDEX "CheckedInspection_teamNumber_criteriaId_key" ON "CheckedInspection"("teamNumber", "criteriaId");
