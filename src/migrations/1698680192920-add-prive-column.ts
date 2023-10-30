import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1698680192920 implements MigrationInterface {
  name = 'Migrations1698680192920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product_entity" ADD COLUMN "price" numeric',
    );

    await queryRunner.query(
      'UPDATE "product_entity" SET "price" = 1 WHERE "price" IS NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_entity" DROP CONSTRAINT "CHK_3b402fd9804e76834a0ef999ba"`,
    );
    await queryRunner.query(`ALTER TABLE "product_entity" DROP COLUMN "price"`);
  }
}
