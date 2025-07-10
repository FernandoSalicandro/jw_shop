CREATE TABLE `product`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(8, 2) NOT NULL,
    `discount_price` DECIMAL(8, 2) NOT NULL,
    `is_promo` BOOLEAN NOT NULL,
    `image_url` TEXT NOT NULL,
    `stock_quantity` INT NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL
);
CREATE TABLE `order`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_tokem` VARCHAR(255) NOT NULL,
    `total_price` DECIMAL(8, 2) NOT NULL,
    `subtotal_price` DECIMAL(8, 2) NOT NULL,
    `shipping_cost` DECIMAL(8, 2) NOT NULL,
    `discount_code` VARCHAR(255) NOT NULL,
    `discount_value` DECIMAL(8, 2) NOT NULL,
    `payment_method` VARCHAR(255) NOT NULL,
    `billing_address` TEXT NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `first_name` BIGINT NOT NULL,
    `last_name` BIGINT NOT NULL,
    `phone_number` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL
);
CREATE TABLE `order_product`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(8, 2) NOT NULL,
    `name` BIGINT NOT NULL
);
ALTER TABLE
    `order_product` ADD INDEX `order_product_order_id_product_id_index`(`order_id`, `product_id`);
CREATE TABLE `discount_codes`(
    `code` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `value` DECIMAL(8, 2) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `min_order` DECIMAL(8, 2) NOT NULL,
    PRIMARY KEY(`code`)
);
CREATE TABLE `categories`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL,
    `rings` BIGINT NOT NULL,
    `necklaces` BIGINT NOT NULL,
    `earrings` BIGINT NOT NULL,
    `bracelets` BIGINT NOT NULL
);
ALTER TABLE
    `categories` ADD CONSTRAINT `categories_product_id_foreign` FOREIGN KEY(`product_id`) REFERENCES `product`(`id`);
ALTER TABLE
    `order_product` ADD CONSTRAINT `order_product_order_id_foreign` FOREIGN KEY(`order_id`) REFERENCES `order`(`id`);
ALTER TABLE
    `order_product` ADD CONSTRAINT `order_product_product_id_foreign` FOREIGN KEY(`product_id`) REFERENCES `product`(`id`);
ALTER TABLE
    `order` ADD CONSTRAINT `order_discount_code_foreign` FOREIGN KEY(`discount_code`) REFERENCES `discount_codes`(`code`);