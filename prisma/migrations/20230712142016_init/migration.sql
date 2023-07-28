-- CreateTable
CREATE TABLE "GenericEphemeral" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GenericPersistent" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GenericEphemeral_key_key" ON "GenericEphemeral"("key");

-- CreateIndex
CREATE UNIQUE INDEX "GenericPersistent_key_key" ON "GenericPersistent"("key");
