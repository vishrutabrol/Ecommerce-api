import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTables1760989355947 implements MigrationInterface {
  name = 'CreateCartTables1760989355947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "totalAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_carts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_carts_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "productId" integer NOT NULL,
        "cartId" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "applicableAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cart_items_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_cart" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE
      )
    `);

    // Optional helpful indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_carts_userId" ON "carts" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_cart_items_cartId" ON "cart_items" ("cartId")`);
    await queryRunner.query(`CREATE INDEX "IDX_cart_items_userId" ON "cart_items" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_cart_items_productId" ON "cart_items" ("productId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_productId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_cartId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_carts_userId"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
  }
}
