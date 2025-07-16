-- MySQL dump 10.13  Distrib 8.4.5, for Win64 (x86_64)
--
-- Host: localhost    Database: jw_db
-- ------------------------------------------------------
-- Server version	8.4.5
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (3,'bracelets'),(4,'earrings'),(2,'necklaces'),(1,'rings');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_codes`
--

DROP TABLE IF EXISTS `discount_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_codes` (
  `code` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `value` decimal(8,2) NOT NULL,
  `type` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `min_order` decimal(8,2) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_codes`
--

LOCK TABLES `discount_codes` WRITE;
/*!40000 ALTER TABLE `discount_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `discount_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_product`
--

DROP TABLE IF EXISTS `order_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_product` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `price_at_time` decimal(8,2) DEFAULT '0.00',
  `name_at_time` varchar(255) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_product_order_id_product_id_index` (`order_id`,`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_product`
--

LOCK TABLES `order_product` WRITE;
/*!40000 ALTER TABLE `order_product` DISABLE KEYS */;
INSERT INTO `order_product` VALUES (1,3,1,1,NULL,NULL,'2025-07-16 13:57:05'),(2,3,2,2,NULL,NULL,'2025-07-16 13:57:05');
/*!40000 ALTER TABLE `order_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `total_price` decimal(8,2) DEFAULT NULL,
  `subtotal_price` decimal(8,2) DEFAULT '0.00',
  `shipping_cost` decimal(8,2) DEFAULT '0.00',
  `discount_code` varchar(255) DEFAULT NULL,
  `discount_value` decimal(8,2) DEFAULT '0.00',
  `payment_method` varchar(255) NOT NULL,
  `billing_address` text NOT NULL,
  `shipping_address` text,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `order_status` varchar(50) DEFAULT 'pending',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stripe_session` (`stripe_session_id`),
  KEY `idx_stripe_payment` (`stripe_payment_intent_id`),
  KEY `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (3,3000.00,NULL,NULL,NULL,NULL,'credit_card','Via Roma 1, 00100 Roma, Italia',NULL,'mario.rossi@example.com','Mario','Rossi','+393331234567',NULL,NULL,NULL,'pending','pending','2025-07-16 13:53:09');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `discount_price` decimal(8,2) NOT NULL,
  `is_promo` tinyint(1) NOT NULL,
  `relevant` tinyint(1) DEFAULT NULL,
  `image_url` text NOT NULL,
  `stock_quantity` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'diamond-eternity-ring','Diamond Eternity Ring','Timeless eternity ring crafted in 18k white gold with round-cut diamonds.',3543.33,0.00,0,1,'https://yourdomain.com/images/ring_1.jpg',9,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(2,'ruby-halo-ring','Ruby Halo Ring','Elegant ruby ring surrounded by a halo of brilliant-cut diamonds.',1146.43,869.95,1,1,'https://yourdomain.com/images/ring_2.jpg',4,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(3,'vintage-sapphire-ring','Vintage Sapphire Ring','Antique-inspired sapphire ring set in rose gold.',3932.35,3039.04,1,1,'https://yourdomain.com/images/ring_3.jpg',18,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(4,'emerald-dome-ring','Emerald Dome Ring','Bold dome-shaped ring with a central emerald and pavé diamonds.',9825.87,6878.95,1,1,'https://yourdomain.com/images/ring_4.jpg',16,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(5,'platinum-wedding-band','Platinum Wedding Band','Classic platinum wedding band with a polished finish.',4321.55,3157.61,1,1,'https://yourdomain.com/images/ring_5.jpg',5,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(6,'twist-gold-ring','Twist Gold Ring','Modern twisted band in 14k yellow gold.',4666.30,3904.77,1,1,'https://yourdomain.com/images/ring_6.jpg',5,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(7,'opal-statement-ring','Opal Statement Ring','Statement ring with a large opal and diamond accents.',3739.97,3403.62,1,0,'https://yourdomain.com/images/ring_7.jpg',7,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(8,'rose-gold-infinity-ring','Rose Gold Infinity Ring','Infinity loop design in rose gold with diamond details.',3251.57,0.00,0,0,'https://yourdomain.com/images/ring_8.jpg',14,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(9,'three-stone-engagement-ring','Three-Stone Engagement Ring','Three-stone ring with a central diamond and sapphire sides.',7281.53,0.00,0,0,'https://yourdomain.com/images/ring_9.jpg',20,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(10,'black-diamond-ring','Black Diamond Ring','Sleek black diamond set in white gold.',2984.34,0.00,0,1,'https://yourdomain.com/images/ring_10.jpg',12,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(11,'pearl-drop-earrings','Pearl Drop Earrings','Elegant drop earrings with freshwater pearls and gold hooks.',6503.83,5954.80,1,1,'https://yourdomain.com/images/earrings_1.jpg',19,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(12,'diamond-studs','Diamond Studs','Timeless diamond studs in platinum settings.',4058.05,0.00,0,1,'https://yourdomain.com/images/earrings_2.jpg',13,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(13,'sapphire-hoop-earrings','Sapphire Hoop Earrings','Hoop earrings with channel-set sapphires.',9318.77,7799.04,1,0,'https://yourdomain.com/images/earrings_3.jpg',6,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(14,'chandelier-diamond-earrings','Chandelier Diamond Earrings','Luxurious chandelier-style earrings with diamonds.',1555.97,0.00,0,1,'https://yourdomain.com/images/earrings_4.jpg',8,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(15,'emerald-teardrop-earrings','Emerald Teardrop Earrings','Teardrop-shaped emeralds with pavé diamonds.',7403.91,7012.27,1,0,'https://yourdomain.com/images/earrings_5.jpg',13,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(16,'minimalist-gold-studs','Minimalist Gold Studs','Small gold studs perfect for everyday wear.',8928.75,8250.04,1,0,'https://yourdomain.com/images/earrings_6.jpg',5,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(17,'opal-and-diamond-earrings','Opal & Diamond Earrings','Oval opals surrounded by diamond halos.',1139.94,967.95,1,1,'https://yourdomain.com/images/earrings_7.jpg',4,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(18,'rose-gold-cluster-earrings','Rose Gold Cluster Earrings','Cluster of diamonds in rose gold.',8357.91,0.00,0,1,'https://yourdomain.com/images/earrings_8.jpg',16,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(19,'art-deco-earrings','Art Deco Earrings','Vintage Art Deco design with geometric lines.',8261.86,6452.42,1,1,'https://yourdomain.com/images/earrings_9.jpg',13,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(20,'tahitian-pearl-earrings','Tahitian Pearl Earrings','Dark Tahitian pearls with white gold hooks.',6246.93,4698.59,1,0,'https://yourdomain.com/images/earrings_10.jpg',7,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(21,'sapphire-tennis-bracelet','Sapphire Tennis Bracelet','Sapphires and diamonds set in a classic tennis bracelet.',8664.91,6724.57,1,0,'https://yourdomain.com/images/bracelet_1.jpg',9,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(22,'gold-cuff-bracelet','Gold Cuff Bracelet','Bold 18k gold cuff with a brushed finish.',3003.28,0.00,0,1,'https://yourdomain.com/images/bracelet_2.jpg',16,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(23,'emerald-chain-bracelet','Emerald Chain Bracelet','Delicate chain bracelet with emerald stations.',5352.22,0.00,0,1,'https://yourdomain.com/images/bracelet_3.jpg',15,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(24,'infinity-diamond-bracelet','Infinity Diamond Bracelet','Infinity symbols connected by diamonds.',3090.78,2865.39,1,1,'https://yourdomain.com/images/bracelet_4.jpg',6,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(25,'leather-and-gold-bracelet','Leather & Gold Bracelet','Braided leather band with gold clasp.',7412.10,6109.43,1,0,'https://yourdomain.com/images/bracelet_5.jpg',18,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(26,'white-gold-bangle','White Gold Bangle','Sleek white gold bangle with a hinge.',7864.36,5806.75,1,0,'https://yourdomain.com/images/bracelet_6.jpg',9,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(27,'multi-gemstone-bracelet','Multi-Gemstone Bracelet','Colorful mix of semi-precious stones in gold.',6777.12,6316.44,1,0,'https://yourdomain.com/images/bracelet_7.jpg',12,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(28,'rose-gold-heart-bracelet','Rose Gold Heart Bracelet','Romantic rose gold bracelet with heart charms.',9463.81,0.00,0,1,'https://yourdomain.com/images/bracelet_8.jpg',15,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(29,'diamond-bar-bracelet','Diamond Bar Bracelet','Minimalist bracelet with horizontal diamond bar.',2731.16,2262.93,1,0,'https://yourdomain.com/images/bracelet_9.jpg',9,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(30,'charm-bracelet','Charm Bracelet','Personalized charm bracelet with luxury details.',2725.96,0.00,0,1,'https://yourdomain.com/images/bracelet_10.jpg',19,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(31,'emerald-pendant-necklace','Emerald Pendant Necklace','Emerald-cut pendant with pavé diamond frame.',5901.79,4455.63,1,0,'https://yourdomain.com/images/necklace_1.jpg',18,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(32,'gold-locket-necklace','Gold Locket Necklace','18k gold locket with vintage engraving.',5724.49,4887.17,1,1,'https://yourdomain.com/images/necklace_2.jpg',7,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(33,'diamond-choker','Diamond Choker','Modern choker covered in brilliant diamonds.',7228.34,5825.03,1,1,'https://yourdomain.com/images/necklace_3.jpg',15,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(34,'sapphire-pendant','Sapphire Pendant','Teardrop sapphire with delicate gold chain.',5870.60,4642.94,1,1,'https://yourdomain.com/images/necklace_4.jpg',6,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(35,'nameplate-necklace','Nameplate Necklace','Customized gold nameplate on fine chain.',2109.54,0.00,0,1,'https://yourdomain.com/images/necklace_5.jpg',4,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(36,'heart-diamond-necklace','Heart Diamond Necklace','Heart-shaped diamond in platinum.',5116.64,0.00,0,1,'https://yourdomain.com/images/necklace_6.jpg',6,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(37,'layered-necklace-set','Layered Necklace Set','Trendy layered look with mixed metals.',9568.36,7690.90,1,0,'https://yourdomain.com/images/necklace_7.jpg',9,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(38,'pearl-strand-necklace','Pearl Strand Necklace','Classic freshwater pearl strand.',9390.57,0.00,0,0,'https://yourdomain.com/images/necklace_8.jpg',17,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(39,'infinity-symbol-necklace','Infinity Symbol Necklace','Infinity design with small diamonds.',7171.91,5704.30,1,1,'https://yourdomain.com/images/necklace_9.jpg',20,'2025-07-10 14:48:25','2025-07-10 14:48:25'),(40,'starburst-medallion','Starburst Medallion','Golden medallion with starburst and diamond.',2288.71,1798.10,1,0,'https://yourdomain.com/images/necklace_10.jpg',6,'2025-07-10 14:48:25','2025-07-10 14:48:25');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `product_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(31,2),(32,2),(33,2),(34,2),(35,2),(36,2),(37,2),(38,2),(39,2),(40,2),(21,3),(22,3),(23,3),(24,3),(25,3),(26,3),(27,3),(28,3),(29,3),(30,3),(11,4),(12,4),(13,4),(14,4),(15,4),(16,4),(17,4),(18,4),(19,4),(20,4);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-16 14:23:14
