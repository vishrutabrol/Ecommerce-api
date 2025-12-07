import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFullaNameToFullName1761046849233 implements MigrationInterface {
  name = 'RenameFullaNameToFullName1761046849233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "fullaName" TO "fullName"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "fullName" TO "fullaName"`);
  }
}
