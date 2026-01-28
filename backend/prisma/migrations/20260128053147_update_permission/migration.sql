/*
  Warnings:

  - Added the required column `apiPath` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "apiPath" TEXT NOT NULL,
ADD COLUMN     "method" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL;
