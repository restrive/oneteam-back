-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.36 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table beone_leaderboard.users
CREATE TABLE IF NOT EXISTS `users` (
  `gid` bigint(20) NOT NULL DEFAULT '0',
  `status` smallint(6) NOT NULL DEFAULT '1',
  `name` varchar(50) NOT NULL DEFAULT '0',
  `rating` json DEFAULT NULL,
  `misc` json DEFAULT NULL,
  PRIMARY KEY (`gid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Dumping data for table beone_leaderboard.users: 25 rows
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`gid`, `status`, `name`, `rating`, `misc`) VALUES
	(4670926474297, 0, 'George Gericke', NULL, NULL),
	(45723569319447, 0, 'Joanita Gericke', NULL, NULL),
	(550795213575630, 0, 'Louis van Rooyen', NULL, NULL),
	(718523747590387, 0, 'ev.edisonnera@gmail.com', NULL, NULL),
	(1199559863308142, 1, 'Chad Danker', NULL, NULL),
	(1199686241000179, 0, 'Linda Smith', NULL, NULL),
	(1199884877383616, 1, 'Anthony Stachel', NULL, NULL),
	(1200136891130799, 0, 'Yulane Venter', NULL, NULL),
	(1200308591219556, 1, 'Ashley Ducray', NULL, NULL),
	(1200439423072117, 1, 'Damian Dowie', NULL, NULL),
	(1200552057897551, 1, 'Ernst van den Berg', NULL, NULL),
	(1200596091464711, 1, 'Daniel Montile', NULL, NULL),
	(1201485451931840, 1, 'Johan Davids', NULL, NULL),
	(1201637687356933, 1, 'Johan Van Der Merwe', NULL, NULL),
	(1201684963132164, 0, 'Lara Stevens', NULL, NULL),
	(1201704391632656, 0, 'Jeandré Hattingh', NULL, NULL),
	(1201755588039746, 0, 'Vuyo Ngwenya', NULL, NULL),
	(1201855411427173, 1, 'Shane Oosthuizen', NULL, NULL),
	(1201899233354637, 1, 'Rochelle Kleynhans', NULL, NULL),
	(1201028717414278, 0, 'Fiona Buchanan', NULL, NULL),
	(1201970311160051, 1, 'Christine Hinterlang', NULL, NULL),
	(331080895138440, 0, 'markr@mdi-global.com', NULL, NULL),
	(1202003683372288, 1, 'Zelda Halgryn', NULL, NULL),
	(1202125475370166, 1, 'Stacy Dry Lara', NULL, NULL),
	(1202382486280902, 1, 'Zanda-Lee van Zyl', NULL, NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
