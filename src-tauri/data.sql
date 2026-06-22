PRAGMA foreign_keys = ON;

INSERT INTO accounts (id, name, acc_type, currency, notes) VALUES
(1, 'Checking Account', 'checking', 'ARS', 'Main account for daily expenses'),
(2, 'Savings Account', 'savings', 'ARS', 'Emergency fund'),
(3, 'USD Wallet', 'wallet', 'USD', 'For international transactions'),
(4, 'Credit Card', 'credit_card', 'ARS', 'Personal credit card'),
(5, 'Investment Account', 'investment', 'ARS', 'Long-term investments');

INSERT INTO balance_snapshots (id, account_id, balance, snapshot_date) VALUES
(1, 1, 150000000, '2004-01-01'),
(2, 2, 500000000, '2004-01-01'),
(3, 3, 5000000, '2004-01-01'),
(4, 4, 0, '2024-01-01'),
(5, 5, 1000000000, '2024-01-01');

INSERT INTO categories (id, name) VALUES
(1, 'Groceries'),
(2, 'Transportation'),
(3, 'Utilities'),
(4, 'Entertainment'),
(5, 'Healthcare'),
(6, 'Dining Out'),
(7, 'Shopping'),
(8, 'Salary'),
(9, 'Freelance'),
(10, 'Investments'),
(11, 'Insurance'),
(12, 'Rent'),
(13, 'Education');

INSERT INTO stores (id, name, color) VALUES
(1, 'Carrefour', '#d62828'),
(2, 'Disco', '#f77f00'),
(3, 'Jumbo', '#fcbf49'),
(4, 'Local Market', '#e29578'),
(5, 'Farmacia del Dr. Simi', '#588157'),
(6, 'Starbucks', '#f72585'),
(7, 'McDonald''s', '#fdf0d5'),
(8, 'Pizza Hut', '#0f4c5c'),
(9, 'Shell Station', '#6f1d1b'),
(10, 'YPF Gas Station', '#e56b6f'),
(11, 'Cinema', '#faf3dd'),
(12, 'Gym', '#250902'),
(13, 'Amazon', '#01161e'),
(14, 'Local Butcher', '#2d3142'),
(15, 'Organic Store', '#f9c80e');

INSERT INTO items (id, name, brand, is_archived) VALUES
(1, 'Milk', 'La Serenísima', 0),
(2, 'Bread', 'Bimbo', 0),
(3, 'Cheese', 'La Serenísima', 0),
(4, 'Chicken Breast', 'Local', 0),
(5, 'Rice', 'Gallo', 0),
(6, 'Pasta', 'Barilla', 0),
(7, 'Tomato Sauce', 'Natura', 0),
(8, 'Olive Oil', 'Cocinero', 0),
(9, 'Coffee', 'Illy', 0),
(10, 'Tea', 'Taragui', 0),
(11, 'Chocolate', 'Arcor', 0),
(12, 'Yogurt', 'Sancor', 0),
(13, 'Eggs', 'Local', 0),
(14, 'Butter', 'Sancor', 0),
(15, 'Sugar', 'Ledesma', 0),
(16, 'Flour', 'Molino Crespo', 0),
(17, 'Oil', 'Natura', 0),
(18, 'Salt', 'Iossal', 0),
(19, 'Spices Mix', 'Maggi', 0),
(20, 'Beans', 'Gallo', 0),
(21, 'Lentils', 'Gallo', 0),
(22, 'Vegetables Bundle', 'Local', 0),
(23, 'Apples', 'Local', 0),
(24, 'Oranges', 'Local', 0),
(25, 'Bananas', 'Local', 0),
(26, 'Beef', 'Local Butcher', 0),
(27, 'Pork', 'Local Butcher', 0),
(28, 'Fish', 'Local Butcher', 0),
(29, 'Shrimp', 'Local Market', 0),
(30, 'Mozzarella', 'La Serenísima', 0),
(31, 'Lettuce', 'Local', 0),
(32, 'Tomato', 'Local', 0),
(33, 'Onion', 'Local', 0),
(34, 'Garlic', 'Local', 0),
(35, 'Potatoes', 'Local', 0),
(36, 'Carrots', 'Local', 0),
(37, 'Pepper', 'Local', 0),
(38, 'Cucumber', 'Local', 0),
(39, 'Zucchini', 'Local', 0),
(40, 'Eggplant', 'Local', 0),
(41, 'Spinach', 'Local', 0),
(42, 'Kale', 'Local', 0),
(43, 'Broccoli', 'Local', 0),
(44, 'Cauliflower', 'Local', 0),
(45, 'Peas', 'Knorr', 0),
(46, 'Corn', 'Choclo', 0),
(47, 'Green Beans', 'Choclo', 0),
(48, 'Chickpeas', 'Gallo', 0),
(49, 'Honey', 'Local', 0),
(50, 'Jam', 'Arcor', 0),
(51, 'Peanut Butter', 'Maradona', 0),
(52, 'Cereal', 'Granola', 0),
(53, 'Granola', 'Quaker', 0),
(54, 'Crackers', 'Galletas Chocolatadas', 0),
(55, 'Cookies', 'Arcor', 0),
(56, 'Cake', 'Bimbo', 0),
(57, 'Alfajores', 'Havanna', 0),
(58, 'Dulce de Leche', 'Arcor', 0),
(59, 'Nuts Mix', 'Local', 0),
(60, 'Dark Chocolate', 'Lindt', 0);

INSERT INTO movements (id, details, date, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id) VALUES
(1, 'Salary January', '2024-01-15', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(2, 'Supermarket shopping', '2024-01-18', 'expense', 'ARS', 45000000, 45000000, NULL, NULL, 1, 1),
(3, 'Gas station', '2024-01-20', 'expense', 'ARS', 8000000, 8000000, NULL, NULL, 1, 2),
(4, 'Restaurant dinner', '2024-01-22', 'expense', 'ARS', 12000000, 12000000, NULL, NULL, 1, 6),
(5, 'Electricity bill', '2024-01-25', 'expense', 'ARS', 6500000, 6500000, NULL, NULL, 1, 3),
(6, 'Freelance project', '2024-01-28', 'income', 'ARS', 150000000, 150000000, NULL, NULL, 1, 9),
(7, 'Supermarket shopping', '2024-02-02', 'expense', 'ARS', 52000000, 52000000, NULL, NULL, 1, 1),
(8, 'Cinema tickets', '2024-02-05', 'expense', 'ARS', 3000000, 3000000, NULL, NULL, 1, 4),
(9, 'Pharmacy purchase', '2024-02-08', 'expense', 'ARS', 2500000, 2500000, NULL, NULL, 1, 5),
(10, 'Coffee with friends', '2024-02-10', 'expense', 'ARS', 1800000, 1800000, NULL, NULL, 1, 6),
(11, 'Insurance payment', '2024-02-12', 'expense', 'ARS', 15000000, 15000000, NULL, NULL, 1, 11),
(12, 'Supermarket shopping', '2024-02-15', 'expense', 'ARS', 48000000, 48000000, NULL, NULL, 1, 1),
(13, 'Salary February', '2024-02-16', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(14, 'Gas for car', '2024-02-18', 'expense', 'ARS', 9000000, 9000000, NULL, NULL, 1, 2),
(15, 'Restaurant dinner', '2024-02-20', 'expense', 'ARS', 14000000, 14000000, NULL, NULL, 1, 6),
(16, 'Gym membership', '2024-02-22', 'expense', 'ARS', 5000000, 5000000, NULL, NULL, 1, 4),
(17, 'Supermarket shopping', '2024-03-01', 'expense', 'ARS', 55000000, 55000000, NULL, NULL, 1, 1),
(18, 'Utilities payment', '2024-03-05', 'expense', 'ARS', 7000000, 7000000, NULL, NULL, 1, 3),
(19, 'Online shopping', '2024-03-08', 'expense', 'USD', 10000000, 1400000000, 140000, 'blue', 3, 7),
(20, 'Freelance project', '2024-03-12', 'income', 'ARS', 120000000, 120000000, NULL, NULL, 1, 9),
(21, 'Salary March', '2024-03-15', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(22, 'Gas station', '2024-03-18', 'expense', 'ARS', 8500000, 8500000, NULL, NULL, 1, 2),
(23, 'Supermarket shopping', '2024-03-20', 'expense', 'ARS', 50000000, 50000000, NULL, NULL, 1, 1),
(24, 'Restaurant lunch', '2024-03-22', 'expense', 'ARS', 9000000, 9000000, NULL, NULL, 1, 6),
(25, 'Medical consultation', '2024-03-25', 'expense', 'ARS', 5000000, 5000000, NULL, NULL, 1, 5),
(26, 'Savings transfer', '2024-03-28', 'transfer', 'ARS', 100000000, 100000000, NULL, NULL, 1, NULL),
(27, 'Supermarket shopping', '2024-04-02', 'expense', 'ARS', 48000000, 48000000, NULL, NULL, 1, 1),
(28, 'Internet bill', '2024-04-05', 'expense', 'ARS', 4500000, 4500000, NULL, NULL, 1, 3),
(29, 'Entertainment', '2024-04-08', 'expense', 'ARS', 2000000, 2000000, NULL, NULL, 1, 4),
(30, 'Salary April', '2024-04-15', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(31, 'Supermarket shopping', '2024-04-18', 'expense', 'ARS', 52000000, 52000000, NULL, NULL, 1, 1),
(32, 'Fuel', '2024-04-20', 'expense', 'ARS', 8000000, 8000000, NULL, NULL, 1, 2),
(33, 'Pizza dinner', '2024-04-22', 'expense', 'ARS', 7500000, 7500000, NULL, NULL, 1, 6),
(34, 'Medicines', '2024-04-25', 'expense', 'ARS', 3000000, 3000000, NULL, NULL, 1, 5),
(35, 'Freelance earnings', '2024-04-28', 'income', 'ARS', 100000000, 100000000, NULL, NULL, 1, 9),
(36, 'Supermarket', '2024-05-02', 'expense', 'ARS', 54000000, 54000000, NULL, NULL, 1, 1),
(37, 'Water bill', '2024-05-05', 'expense', 'ARS', 2000000, 2000000, NULL, NULL, 1, 3),
(38, 'Movie tickets', '2024-05-08', 'expense', 'ARS', 3500000, 3500000, NULL, NULL, 1, 4),
(39, 'Salary May', '2024-05-15', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(40, 'Supermarket shopping', '2024-05-18', 'expense', 'ARS', 49000000, 49000000, NULL, NULL, 1, 1),
(41, 'Gas station', '2024-05-20', 'expense', 'ARS', 9000000, 9000000, NULL, NULL, 1, 2),
(42, 'Restaurant', '2024-05-22', 'expense', 'ARS', 11000000, 11000000, NULL, NULL, 1, 6),
(43, 'Doctor visit', '2024-05-25', 'expense', 'ARS', 4500000, 4500000, NULL, NULL, 1, 5),
(44, 'Course enrollment', '2024-05-28', 'expense', 'ARS', 8000000, 8000000, NULL, NULL, 1, 13),
(45, 'Freelance project', '2024-05-30', 'income', 'ARS', 130000000, 130000000, NULL, NULL, 1, 9),
(46, 'Supermarket shopping', '2024-06-03', 'expense', 'ARS', 51000000, 51000000, NULL, NULL, 1, 1),
(47, 'Gas', '2024-06-06', 'expense', 'ARS', 8500000, 8500000, NULL, NULL, 1, 2),
(48, 'Lunch', '2024-06-08', 'expense', 'ARS', 6500000, 6500000, NULL, NULL, 1, 6),
(49, 'Salary June', '2024-06-15', 'income', 'ARS', 500000000, 500000000, NULL, NULL, 1, 8),
(50, 'Supermarket shopping', '2024-06-18', 'expense', 'ARS', 53000000, 53000000, NULL, NULL, 1, 1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (51,"Sed pharetra, felis eget varius ultrices,","2007-01-18","expense","ARS",53044535,"53044535",4,13),
  (52,"fames ac turpis egestas. Fusce aliquet","2011-03-22","expense","ARS",48581377,"48581377",4,8),
  (53,"Donec elementum, lorem ut aliquam iaculis, lacus pede sagittis","2006-05-10","expense","ARS",41537827,"41537827",1,9),
  (54,"nibh. Phasellus nulla. Integer vulputate, risus a","2012-11-26","expense","ARS",12228687,"12228687",1,11),
  (55,"arcu et pede. Nunc","2006-03-20","expense","ARS",77706682,"77706682",4,9),
  (56,"Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut","2014-09-02","income","ARS",87316932,"87316932",5,8),
  (57,"Cras pellentesque. Sed dictum. Proin","2007-10-04","expense","ARS",43534722,"43534722",2,11),
  (58,"volutpat nunc sit amet metus. Aliquam erat volutpat. Nulla facilisis.","2015-03-26","income","ARS",82534550,"82534550",2,11),
  (59,"Fusce diam nunc, ullamcorper eu, euismod ac, fermentum","2007-11-11","income","ARS",35030238,"35030238",3,11),
  (60,"vitae aliquam eros turpis non enim.","2021-10-27","income","ARS",16264714,"16264714",2,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (61,"ipsum primis in faucibus","2017-08-11","expense","ARS",68736659,"68736659",2,6),
  (62,"malesuada id, erat. Etiam vestibulum massa rutrum","2013-09-11","income","ARS",8328714,"8328714",5,2),
  (63,"arcu imperdiet ullamcorper. Duis at","2009-09-22","expense","ARS",21839819,"21839819",3,2),
  (64,"vulputate, risus a ultricies adipiscing,","2020-07-09","expense","ARS",87097127,"87097127",3,5),
  (65,"Duis cursus, diam at pretium aliquet,","2010-01-22","expense","ARS",1986986,"1986986",5,7),
  (66,"Curabitur consequat, lectus sit amet","2019-04-03","income","ARS",66299186,"66299186",4,11),
  (67,"Mauris magna. Duis dignissim tempor arcu. Vestibulum","2006-09-15","expense","ARS",26908848,"26908848",3,5),
  (68,"ridiculus mus. Proin vel nisl. Quisque","2017-12-02","expense","ARS",84050791,"84050791",4,7),
  (69,"sed libero. Proin sed turpis nec","2008-02-01","income","ARS",86789960,"86789960",3,10),
  (70,"eros. Proin ultrices. Duis volutpat","2014-06-18","expense","ARS",66744637,"66744637",3,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (71,"purus. Maecenas libero est, congue a, aliquet vel, vulputate","2016-02-05","income","ARS",88684035,"88684035",1,7),
  (72,"egestas lacinia. Sed congue, elit","2022-01-05","income","ARS",70280495,"70280495",3,4),
  (73,"non, dapibus rutrum, justo. Praesent","2011-07-16","expense","ARS",37576547,"37576547",2,12),
  (74,"nunc id enim. Curabitur","2019-02-06","expense","ARS",62315646,"62315646",3,7),
  (75,"ullamcorper, velit in aliquet lobortis, nisi","2011-06-10","income","ARS",80057808,"80057808",4,10),
  (76,"turpis non enim. Mauris quis turpis vitae","2014-01-25","expense","ARS",59016838,"59016838",1,6),
  (77,"Fusce fermentum fermentum arcu. Vestibulum ante ipsum primis","2009-11-15","expense","ARS",56143145,"56143145",3,3),
  (78,"a odio semper cursus. Integer mollis. Integer tincidunt aliquam","2006-12-21","income","ARS",43504449,"43504449",4,3),
  (79,"in aliquet lobortis, nisi nibh","2021-12-05","income","ARS",72597006,"72597006",2,12),
  (80,"Nunc mauris sapien, cursus in, hendrerit","2018-05-12","expense","ARS",7929141,"7929141",2,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (81,"cursus et, eros. Proin ultrices. Duis volutpat nunc","2006-05-25","income","ARS",94183640,"94183640",4,8),
  (82,"metus facilisis lorem tristique aliquet. Phasellus fermentum convallis","2015-05-19","expense","ARS",66738537,"66738537",3,4),
  (83,"at risus. Nunc ac sem ut dolor dapibus","2014-05-20","income","ARS",92796143,"92796143",2,9),
  (84,"porta elit, a feugiat tellus","2017-10-27","expense","ARS",81598395,"81598395",3,11),
  (85,"cubilia Curae Phasellus ornare. Fusce mollis. Duis sit amet","2017-03-01","expense","ARS",56881849,"56881849",3,4),
  (86,"lobortis risus. In mi pede, nonummy","2009-11-03","income","ARS",69497995,"69497995",3,12),
  (87,"egestas. Duis ac arcu. Nunc mauris. Morbi","2007-07-28","expense","ARS",6735432,"6735432",3,7),
  (88,"Pellentesque tincidunt tempus risus.","2018-07-12","income","ARS",90672033,"90672033",1,10),
  (89,"fermentum vel, mauris. Integer","2007-08-06","expense","ARS",3143338,"3143338",1,9),
  (90,"a, scelerisque sed, sapien. Nunc","2018-11-25","income","ARS",38192843,"38192843",2,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (91,"sem elit, pharetra ut, pharetra sed, hendrerit","2005-04-17","expense","ARS",66345687,"66345687",3,9),
  (92,"Curabitur sed tortor. Integer","2008-05-19","income","ARS",27303922,"27303922",4,8),
  (93,"sollicitudin commodo ipsum. Suspendisse non leo.","2009-10-08","expense","ARS",94184759,"94184759",2,12),
  (94,"molestie in, tempus eu, ligula. Aenean euismod mauris eu","2005-08-30","income","ARS",95094834,"95094834",4,2),
  (95,"placerat eget, venenatis a, magna. Lorem ipsum dolor","2006-10-28","income","ARS",41248586,"41248586",4,1),
  (96,"Proin vel arcu eu odio tristique pharetra. Quisque","2013-08-13","income","ARS",61256397,"61256397",4,9),
  (97,"erat, eget tincidunt dui augue eu tellus. Phasellus elit pede,","2005-05-14","income","ARS",54686065,"54686065",2,6),
  (98,"fermentum arcu. Vestibulum ante ipsum","2014-11-04","income","ARS",24095461,"24095461",1,3),
  (99,"dis parturient montes, nascetur ridiculus mus.","2007-12-03","expense","ARS",65402077,"65402077",2,7),
  (100,"convallis convallis dolor. Quisque tincidunt pede ac urna. Ut","2022-04-03","expense","ARS",7076608,"7076608",3,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (101,"amet, dapibus id, blandit at, nisi. Cum sociis","2022-04-18","expense","ARS",47919273,"47919273",3,8),
  (102,"nibh vulputate mauris sagittis placerat. Cras dictum","2008-05-22","income","ARS",62740408,"62740408",2,3),
  (103,"facilisi. Sed neque. Sed eget lacus. Mauris non dui nec","2015-05-07","income","ARS",18789693,"18789693",4,9),
  (104,"sem molestie sodales. Mauris blandit enim consequat purus. Maecenas","2015-06-11","expense","ARS",33747858,"33747858",4,10),
  (105,"Nulla tincidunt, neque vitae semper","2017-03-05","income","ARS",73963250,"73963250",3,6),
  (106,"Duis a mi fringilla mi lacinia","2005-05-17","income","ARS",14078996,"14078996",3,10),
  (107,"blandit viverra. Donec tempus, lorem fringilla ornare placerat,","2009-08-30","expense","ARS",18073715,"18073715",2,6),
  (108,"suscipit, est ac facilisis facilisis,","2022-05-01","income","ARS",4465735,"4465735",2,13),
  (109,"et libero. Proin mi. Aliquam gravida mauris","2022-05-06","income","ARS",14787399,"14787399",4,8),
  (110,"Ut tincidunt orci quis lectus. Nullam suscipit, est ac","2021-10-18","expense","ARS",12997524,"12997524",5,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (111,"Fusce dolor quam, elementum at, egestas","2007-08-08","income","ARS",84709110,"84709110",1,3),
  (112,"diam at pretium aliquet, metus urna","2006-08-11","income","ARS",59386895,"59386895",1,3),
  (113,"sapien imperdiet ornare. In faucibus.","2006-08-03","income","ARS",10228493,"10228493",3,6),
  (114,"eget laoreet posuere, enim nisl elementum purus, accumsan","2005-04-05","income","ARS",37387717,"37387717",3,7),
  (115,"Donec luctus aliquet odio. Etiam ligula tortor, dictum eu,","2021-09-16","expense","ARS",16316131,"16316131",3,7),
  (116,"porta elit, a feugiat tellus lorem eu metus. In","2011-05-15","expense","ARS",36771293,"36771293",5,10),
  (117,"Fusce feugiat. Lorem ipsum dolor sit amet,","2009-08-18","expense","ARS",97568221,"97568221",1,10),
  (118,"dui nec urna suscipit nonummy. Fusce","2014-03-08","income","ARS",54199035,"54199035",4,6),
  (119,"mi. Aliquam gravida mauris ut","2013-06-03","expense","ARS",20399483,"20399483",1,3),
  (120,"imperdiet nec, leo. Morbi neque tellus, imperdiet","2011-04-19","expense","ARS",47021529,"47021529",1,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (121,"egestas hendrerit neque. In ornare","2005-10-07","expense","ARS",1945121,"1945121",4,2),
  (122,"Mauris vel turpis. Aliquam","2007-09-16","income","ARS",23567199,"23567199",5,5),
  (123,"mus. Donec dignissim magna a tortor. Nunc commodo auctor","2011-03-31","income","ARS",4092826,"4092826",1,13),
  (124,"pede. Praesent eu dui. Cum sociis natoque penatibus et magnis","2006-08-25","income","ARS",16528879,"16528879",3,3),
  (125,"interdum. Curabitur dictum. Phasellus in","2012-11-05","expense","ARS",3001918,"3001918",4,8),
  (126,"dignissim. Maecenas ornare egestas ligula. Nullam feugiat placerat","2015-04-06","income","ARS",14606902,"14606902",3,5),
  (127,"aliquet molestie tellus. Aenean egestas hendrerit neque. In ornare","2011-04-16","income","ARS",29565319,"29565319",3,5),
  (128,"eget massa. Suspendisse eleifend. Cras sed leo. Cras","2011-01-09","income","ARS",58681568,"58681568",4,2),
  (129,"libero nec ligula consectetuer rhoncus. Nullam velit dui, semper et,","2005-05-19","income","ARS",42962307,"42962307",1,7),
  (130,"laoreet ipsum. Curabitur consequat, lectus sit amet","2007-09-22","income","ARS",2628108,"2628108",3,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (131,"eget odio. Aliquam vulputate","2021-12-07","expense","ARS",2934875,"2934875",5,7),
  (132,"Integer urna. Vivamus molestie dapibus","2014-09-19","income","ARS",68959980,"68959980",4,8),
  (133,"aliquet vel, vulputate eu, odio. Phasellus at augue id","2020-02-04","income","ARS",11338208,"11338208",2,11),
  (134,"nulla. In tincidunt congue turpis. In condimentum. Donec","2009-05-18","expense","ARS",64533904,"64533904",3,4),
  (135,"sem. Nulla interdum. Curabitur dictum.","2009-05-01","income","ARS",67516116,"67516116",2,4),
  (136,"ante bibendum ullamcorper. Duis cursus, diam at","2009-10-06","income","ARS",90301900,"90301900",2,6),
  (137,"aliquam eu, accumsan sed, facilisis vitae, orci.","2011-09-21","income","ARS",62173888,"62173888",4,2),
  (138,"convallis erat, eget tincidunt dui augue eu","2004-09-11","income","ARS",92992102,"92992102",3,12),
  (139,"id risus quis diam luctus lobortis. Class","2019-07-04","income","ARS",12080589,"12080589",4,7),
  (140,"convallis convallis dolor. Quisque tincidunt pede","2005-06-03","expense","ARS",47660211,"47660211",3,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (141,"interdum feugiat. Sed nec metus","2017-06-18","expense","ARS",53634348,"53634348",2,10),
  (142,"tincidunt adipiscing. Mauris molestie pharetra nibh. Aliquam ornare, libero at","2016-04-08","expense","ARS",3001577,"3001577",3,8),
  (143,"Donec vitae erat vel pede blandit congue. In scelerisque scelerisque","2017-09-13","income","ARS",39140193,"39140193",2,11),
  (144,"urna, nec luctus felis purus ac tellus. Suspendisse","2021-02-14","expense","ARS",80880115,"80880115",3,1),
  (145,"Sed malesuada augue ut lacus. Nulla tincidunt,","2019-02-15","expense","ARS",51510747,"51510747",4,5),
  (146,"Donec luctus aliquet odio. Etiam","2009-01-25","expense","ARS",12179480,"12179480",2,10),
  (147,"Curabitur egestas nunc sed libero.","2012-01-13","income","ARS",42651304,"42651304",2,10),
  (148,"mi fringilla mi lacinia mattis. Integer eu lacus. Quisque","2013-02-28","expense","ARS",37619422,"37619422",2,11),
  (149,"risus. In mi pede, nonummy ut,","2022-03-15","income","ARS",35786308,"35786308",4,11),
  (150,"dolor, nonummy ac, feugiat non,","2012-04-27","expense","ARS",87497672,"87497672",4,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (151,"elit fermentum risus, at fringilla purus mauris a","2009-01-04","expense","ARS",70037579,"70037579",1,10),
  (152,"parturient montes, nascetur ridiculus mus. Proin vel","2012-07-24","income","ARS",53117139,"53117139",4,10),
  (153,"molestie orci tincidunt adipiscing. Mauris molestie pharetra","2009-04-26","income","ARS",69387060,"69387060",2,13),
  (154,"lectus quis massa. Mauris vestibulum,","2010-08-08","income","ARS",99410222,"99410222",4,4),
  (155,"interdum. Curabitur dictum. Phasellus in felis. Nulla tempor augue ac","2020-02-19","expense","ARS",76128396,"76128396",1,8),
  (156,"dolor, nonummy ac, feugiat non, lobortis quis, pede. Suspendisse dui.","2011-11-01","income","ARS",95114204,"95114204",2,7),
  (157,"pede. Praesent eu dui. Cum sociis natoque","2005-01-03","expense","ARS",96123198,"96123198",3,10),
  (158,"sed, est. Nunc laoreet lectus","2012-01-17","income","ARS",61384755,"61384755",4,8),
  (159,"gravida. Praesent eu nulla at sem molestie","2020-07-13","income","ARS",4461387,"4461387",4,5),
  (160,"eget metus. In nec orci. Donec nibh. Quisque nonummy","2007-12-03","income","ARS",31744874,"31744874",4,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (161,"ligula elit, pretium et, rutrum non, hendrerit id, ante.","2010-02-24","expense","ARS",14221133,"14221133",3,12),
  (162,"magna, malesuada vel, convallis in, cursus et, eros. Proin ultrices.","2012-05-05","expense","ARS",67941024,"67941024",3,4),
  (163,"est, vitae sodales nisi magna sed dui. Fusce","2019-10-12","expense","ARS",76929495,"76929495",5,8),
  (164,"natoque penatibus et magnis dis","2010-04-28","expense","ARS",98978765,"98978765",4,7),
  (165,"justo nec ante. Maecenas mi felis,","2019-08-11","income","ARS",30491153,"30491153",2,2),
  (166,"fringilla purus mauris a nunc. In at","2008-03-04","income","ARS",90431274,"90431274",4,12),
  (167,"ante ipsum primis in faucibus orci luctus et","2014-12-22","income","ARS",47340027,"47340027",4,12),
  (168,"malesuada vel, venenatis vel, faucibus id, libero. Donec consectetuer","2020-12-16","expense","ARS",78271999,"78271999",4,1),
  (169,"Curabitur vel lectus. Cum sociis natoque penatibus et magnis","2014-08-13","income","ARS",7739918,"7739918",3,10),
  (170,"tincidunt, neque vitae semper egestas, urna justo faucibus lectus,","2014-05-06","expense","ARS",45302475,"45302475",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (171,"lorem, sit amet ultricies sem magna nec","2022-04-15","income","ARS",65119102,"65119102",5,11),
  (172,"amet ante. Vivamus non lorem vitae","2020-09-07","expense","ARS",8488726,"8488726",1,10),
  (173,"magna. Ut tincidunt orci quis lectus.","2021-10-13","expense","ARS",88310836,"88310836",3,11),
  (174,"in, dolor. Fusce feugiat.","2016-08-12","income","ARS",57804625,"57804625",3,11),
  (175,"tempus non, lacinia at, iaculis quis, pede.","2004-10-29","expense","ARS",51289337,"51289337",4,6),
  (176,"vitae, orci. Phasellus dapibus quam quis","2015-12-24","expense","ARS",7069638,"7069638",4,9),
  (177,"consectetuer adipiscing elit. Etiam","2021-11-19","income","ARS",28021037,"28021037",3,7),
  (178,"venenatis a, magna. Lorem ipsum dolor","2021-01-17","expense","ARS",29139981,"29139981",2,11),
  (179,"nulla at sem molestie sodales. Mauris blandit","2017-10-19","expense","ARS",83572847,"83572847",3,13),
  (180,"orci luctus et ultrices posuere cubilia Curae Phasellus","2008-07-17","income","ARS",76427789,"76427789",1,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (181,"suscipit nonummy. Fusce fermentum fermentum arcu. Vestibulum ante","2008-03-29","income","ARS",13161611,"13161611",4,2),
  (182,"lacus. Quisque purus sapien, gravida non, sollicitudin a,","2012-03-22","income","ARS",61727192,"61727192",4,12),
  (183,"sapien. Aenean massa. Integer vitae nibh.","2017-01-09","income","ARS",90516425,"90516425",4,13),
  (184,"tempor lorem, eget mollis lectus pede et risus. Quisque","2005-04-12","expense","ARS",41653948,"41653948",2,11),
  (185,"Duis dignissim tempor arcu. Vestibulum ut eros non enim","2020-10-29","expense","ARS",91887254,"91887254",1,5),
  (186,"nisl elementum purus, accumsan interdum libero dui nec","2010-11-15","expense","ARS",91634400,"91634400",4,3),
  (187,"magna a tortor. Nunc commodo auctor velit.","2017-02-11","expense","ARS",40918506,"40918506",2,11),
  (188,"dui. Cum sociis natoque penatibus et magnis dis parturient montes,","2008-12-14","expense","ARS",84753984,"84753984",4,1),
  (189,"ipsum nunc id enim.","2018-05-06","expense","ARS",82618522,"82618522",4,13),
  (190,"non massa non ante","2019-09-19","expense","ARS",50163787,"50163787",3,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (191,"nec, cursus a, enim. Suspendisse aliquet, sem ut cursus luctus,","2010-06-26","expense","ARS",73992239,"73992239",2,9),
  (192,"rhoncus. Donec est. Nunc ullamcorper, velit","2009-03-03","income","ARS",47506701,"47506701",1,2),
  (193,"semper cursus. Integer mollis. Integer tincidunt aliquam","2017-12-01","income","ARS",51438560,"51438560",2,5),
  (194,"odio. Phasellus at augue id","2016-09-06","income","ARS",52898948,"52898948",1,9),
  (195,"Nunc ut erat. Sed nunc est, mollis non,","2011-04-24","income","ARS",36490902,"36490902",2,8),
  (196,"mattis. Cras eget nisi dictum","2007-01-20","income","ARS",24728423,"24728423",4,4),
  (197,"Donec tempus, lorem fringilla ornare placerat,","2019-08-24","income","ARS",39938931,"39938931",4,2),
  (198,"odio sagittis semper. Nam tempor diam dictum sapien. Aenean","2014-09-19","income","ARS",30024978,"30024978",4,1),
  (199,"non magna. Nam ligula elit, pretium et, rutrum non,","2014-08-21","expense","ARS",68080432,"68080432",3,9),
  (200,"facilisi. Sed neque. Sed eget lacus. Mauris non dui nec","2021-09-29","income","ARS",11241866,"11241866",2,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (201,"luctus et ultrices posuere cubilia Curae","2017-03-12","expense","ARS",85281588,"85281588",4,9),
  (202,"egestas a, dui. Cras pellentesque. Sed dictum.","2016-06-05","expense","ARS",74269259,"74269259",4,10),
  (203,"blandit mattis. Cras eget nisi dictum augue","2008-08-26","expense","ARS",83839045,"83839045",2,10),
  (204,"turpis vitae purus gravida sagittis. Duis gravida. Praesent","2020-10-14","expense","ARS",87202917,"87202917",5,7),
  (205,"vestibulum lorem, sit amet ultricies sem magna nec quam.","2009-01-29","income","ARS",43213681,"43213681",3,1),
  (206,"nascetur ridiculus mus. Donec dignissim magna","2004-11-01","income","ARS",68722609,"68722609",2,2),
  (207,"hymenaeos. Mauris ut quam","2014-08-25","income","ARS",71487785,"71487785",3,12),
  (208,"est. Nunc ullamcorper, velit in aliquet","2021-12-30","income","ARS",83676350,"83676350",4,4),
  (209,"egestas. Aliquam fringilla cursus","2014-09-07","income","ARS",30915032,"30915032",4,7),
  (210,"eu elit. Nulla facilisi. Sed neque. Sed","2014-04-22","income","ARS",15080470,"15080470",2,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (211,"consequat, lectus sit amet luctus vulputate, nisi sem semper erat,","2009-03-06","income","ARS",92764744,"92764744",3,7),
  (212,"auctor, nunc nulla vulputate dui,","2012-05-29","expense","ARS",27692979,"27692979",1,5),
  (213,"est ac facilisis facilisis, magna","2014-05-22","income","ARS",73473703,"73473703",5,4),
  (214,"feugiat nec, diam. Duis","2021-11-28","expense","ARS",24264639,"24264639",5,8),
  (215,"sit amet metus. Aliquam erat volutpat. Nulla facilisis.","2016-01-25","expense","ARS",37362098,"37362098",2,6),
  (216,"metus sit amet ante. Vivamus non lorem","2014-03-25","income","ARS",69072255,"69072255",4,2),
  (217,"metus eu erat semper rutrum. Fusce dolor quam, elementum","2014-05-02","expense","ARS",84817344,"84817344",4,5),
  (218,"pede, ultrices a, auctor non, feugiat nec, diam. Duis","2012-05-13","expense","ARS",40367460,"40367460",5,2),
  (219,"et nunc. Quisque ornare tortor","2015-05-12","income","ARS",10568387,"10568387",4,9),
  (220,"ut, pharetra sed, hendrerit a, arcu. Sed et libero.","2017-07-07","income","ARS",27455237,"27455237",5,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (221,"congue a, aliquet vel, vulputate eu,","2020-04-15","income","ARS",87872710,"87872710",3,10),
  (222,"fermentum arcu. Vestibulum ante ipsum primis in faucibus orci","2021-05-10","income","ARS",78861410,"78861410",1,5),
  (223,"in, hendrerit consectetuer, cursus et, magna. Praesent","2022-01-04","expense","ARS",57788253,"57788253",3,11),
  (224,"non, bibendum sed, est. Nunc laoreet","2016-06-16","income","ARS",70040441,"70040441",5,9),
  (225,"egestas nunc sed libero. Proin sed turpis nec","2015-03-28","expense","ARS",57564949,"57564949",3,1),
  (226,"pharetra, felis eget varius ultrices, mauris ipsum","2020-12-13","income","ARS",74407109,"74407109",2,9),
  (227,"ac, eleifend vitae, erat. Vivamus","2018-08-02","expense","ARS",75937661,"75937661",5,11),
  (228,"sed dui. Fusce aliquam, enim nec tempus scelerisque,","2017-02-10","income","ARS",5532767,"5532767",3,3),
  (229,"aliquet magna a neque. Nullam ut nisi a","2018-09-21","income","ARS",37572863,"37572863",1,10),
  (230,"lobortis risus. In mi pede, nonummy ut, molestie in,","2009-12-01","expense","ARS",62458853,"62458853",5,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (231,"sapien. Aenean massa. Integer vitae nibh.","2012-07-20","expense","ARS",45021215,"45021215",3,2),
  (232,"Nunc sollicitudin commodo ipsum. Suspendisse non leo. Vivamus nibh","2018-04-10","income","ARS",36277517,"36277517",2,9),
  (233,"non, vestibulum nec, euismod in, dolor. Fusce feugiat. Lorem","2015-06-05","income","ARS",20699366,"20699366",2,13),
  (234,"nunc risus varius orci, in consequat","2015-12-14","income","ARS",21439483,"21439483",3,6),
  (235,"quis massa. Mauris vestibulum, neque sed","2005-10-22","income","ARS",72901018,"72901018",5,7),
  (236,"tempus mauris erat eget ipsum. Suspendisse","2014-08-25","income","ARS",34690587,"34690587",2,1),
  (237,"netus et malesuada fames ac turpis egestas.","2012-05-10","income","ARS",6758144,"6758144",1,5),
  (238,"tellus sem mollis dui, in sodales","2018-10-19","income","ARS",17398574,"17398574",4,4),
  (239,"Cras vulputate velit eu sem. Pellentesque ut","2005-01-20","income","ARS",65779555,"65779555",1,9),
  (240,"mauris a nunc. In at","2017-10-03","income","ARS",70425087,"70425087",4,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (241,"in felis. Nulla tempor augue ac ipsum.","2016-02-16","income","ARS",42090406,"42090406",3,7),
  (242,"mi, ac mattis velit justo","2019-09-26","income","ARS",36549551,"36549551",5,11),
  (243,"lobortis, nisi nibh lacinia orci, consectetuer euismod est arcu ac","2010-10-09","expense","ARS",18014828,"18014828",3,6),
  (244,"placerat, augue. Sed molestie. Sed id risus quis","2016-10-30","income","ARS",28171254,"28171254",4,6),
  (245,"senectus et netus et","2005-09-28","income","ARS",95915814,"95915814",4,3),
  (246,"dictum augue malesuada malesuada. Integer id","2005-04-03","expense","ARS",66350481,"66350481",4,3),
  (247,"faucibus orci luctus et ultrices posuere cubilia Curae Donec tincidunt.","2008-03-12","expense","ARS",29173506,"29173506",5,6),
  (248,"pellentesque, tellus sem mollis dui, in sodales elit erat vitae","2008-11-26","income","ARS",79994043,"79994043",2,11),
  (249,"vulputate ullamcorper magna. Sed eu eros. Nam consequat","2014-04-30","expense","ARS",58846244,"58846244",3,11),
  (250,"ut erat. Sed nunc est, mollis","2008-02-12","income","ARS",96192246,"96192246",5,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (251,"nec, diam. Duis mi enim, condimentum eget, volutpat ornare,","2007-01-18","income","ARS",12896412,"12896412",4,13),
  (252,"vitae nibh. Donec est mauris,","2013-01-23","income","ARS",8138055,"8138055",4,2),
  (253,"ac arcu. Nunc mauris. Morbi non sapien molestie orci","2014-05-20","income","ARS",62978057,"62978057",1,6),
  (254,"metus. Aenean sed pede nec ante blandit","2005-12-28","expense","ARS",5842873,"5842873",4,8),
  (255,"arcu. Curabitur ut odio vel est tempor bibendum. Donec","2016-07-13","expense","ARS",61049447,"61049447",5,9),
  (256,"ipsum nunc id enim. Curabitur","2018-08-11","income","ARS",97306019,"97306019",4,9),
  (257,"sit amet ante. Vivamus non lorem vitae odio sagittis","2011-05-09","income","ARS",38345665,"38345665",2,9),
  (258,"diam eu dolor egestas rhoncus. Proin nisl sem, consequat nec,","2009-01-12","expense","ARS",1764006,"1764006",4,4),
  (259,"mauris id sapien. Cras dolor dolor, tempus non, lacinia","2006-07-14","income","ARS",9088412,"9088412",4,6),
  (260,"egestas blandit. Nam nulla magna, malesuada vel, convallis","2018-08-21","income","ARS",43281540,"43281540",1,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (261,"primis in faucibus orci luctus et","2006-01-21","income","ARS",89565176,"89565176",3,10),
  (262,"Nunc sed orci lobortis augue scelerisque mollis. Phasellus libero","2019-04-11","expense","ARS",15481484,"15481484",3,1),
  (263,"lacus. Quisque imperdiet, erat","2021-08-09","expense","ARS",68748926,"68748926",3,12),
  (264,"est. Nunc ullamcorper, velit","2016-09-13","expense","ARS",39053388,"39053388",3,2),
  (265,"In tincidunt congue turpis. In","2015-07-14","expense","ARS",37874831,"37874831",3,4),
  (266,"placerat, augue. Sed molestie. Sed id risus quis diam","2014-12-08","expense","ARS",27236040,"27236040",4,2),
  (267,"vitae diam. Proin dolor. Nulla semper tellus id nunc","2015-02-28","expense","ARS",69197844,"69197844",5,10),
  (268,"lectus sit amet luctus vulputate, nisi sem","2015-02-19","expense","ARS",16418058,"16418058",5,7),
  (269,"mi fringilla mi lacinia mattis.","2016-01-07","expense","ARS",16945916,"16945916",2,2),
  (270,"lobortis. Class aptent taciti sociosqu ad litora","2013-09-27","expense","ARS",92444722,"92444722",2,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (271,"fermentum convallis ligula. Donec luctus aliquet odio. Etiam ligula tortor,","2013-03-22","income","ARS",10176324,"10176324",1,8),
  (272,"non, sollicitudin a, malesuada id, erat. Etiam vestibulum massa","2006-09-03","income","ARS",535065,"535065",5,4),
  (273,"amet, consectetuer adipiscing elit. Aliquam","2007-12-06","income","ARS",38225605,"38225605",4,11),
  (274,"amet, risus. Donec nibh enim, gravida sit","2020-08-24","income","ARS",85286632,"85286632",2,6),
  (275,"egestas, urna justo faucibus lectus, a","2012-07-28","expense","ARS",49680902,"49680902",5,9),
  (276,"pharetra. Quisque ac libero nec ligula","2011-07-10","income","ARS",88119203,"88119203",4,7),
  (277,"eu, eleifend nec, malesuada","2013-03-16","expense","ARS",12282220,"12282220",2,6),
  (278,"dictum placerat, augue. Sed molestie. Sed","2006-12-01","income","ARS",39110216,"39110216",2,2),
  (279,"dolor. Nulla semper tellus id","2021-08-03","expense","ARS",28476121,"28476121",2,4),
  (280,"Donec dignissim magna a tortor. Nunc commodo auctor velit.","2017-10-04","expense","ARS",22042528,"22042528",1,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (281,"a nunc. In at pede. Cras vulputate velit eu sem.","2009-01-02","expense","ARS",91680166,"91680166",4,11),
  (282,"quis, tristique ac, eleifend vitae, erat. Vivamus nisi. Mauris","2013-04-22","income","ARS",90266633,"90266633",4,3),
  (283,"libero lacus, varius et, euismod et,","2011-07-31","expense","ARS",56403161,"56403161",3,1),
  (284,"a tortor. Nunc commodo auctor","2006-10-26","income","ARS",60067069,"60067069",1,3),
  (285,"ac, fermentum vel, mauris. Integer sem elit,","2014-11-29","income","ARS",19067612,"19067612",3,5),
  (286,"erat volutpat. Nulla dignissim. Maecenas ornare","2005-12-06","expense","ARS",29739763,"29739763",2,5),
  (287,"euismod in, dolor. Fusce feugiat. Lorem ipsum dolor","2008-12-06","income","ARS",52063629,"52063629",3,5),
  (288,"consectetuer rhoncus. Nullam velit dui, semper","2022-01-02","expense","ARS",91982786,"91982786",2,6),
  (289,"vulputate mauris sagittis placerat. Cras dictum","2013-06-14","income","ARS",43387172,"43387172",1,4),
  (290,"est ac mattis semper, dui lectus rutrum urna, nec","2020-10-12","expense","ARS",4423051,"4423051",5,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (291,"eu augue porttitor interdum. Sed","2019-07-29","income","ARS",39885945,"39885945",2,8),
  (292,"vel, faucibus id, libero. Donec consectetuer mauris","2010-12-07","income","ARS",4603359,"4603359",3,5),
  (293,"consequat auctor, nunc nulla","2008-11-01","income","ARS",76856499,"76856499",4,10),
  (294,"orci. Ut sagittis lobortis mauris. Suspendisse aliquet molestie","2015-04-12","expense","ARS",94558674,"94558674",1,11),
  (295,"commodo auctor velit. Aliquam nisl. Nulla eu neque","2021-09-06","income","ARS",35214775,"35214775",5,4),
  (296,"lectus. Nullam suscipit, est ac facilisis facilisis, magna tellus","2006-08-15","expense","ARS",35567741,"35567741",2,8),
  (297,"luctus sit amet, faucibus ut, nulla. Cras eu tellus","2016-02-16","income","ARS",91827688,"91827688",3,10),
  (298,"Lorem ipsum dolor sit amet, consectetuer","2010-05-09","income","ARS",37082840,"37082840",1,11),
  (299,"malesuada. Integer id magna et ipsum cursus","2007-06-06","income","ARS",70661749,"70661749",3,6),
  (300,"orci, adipiscing non, luctus sit amet, faucibus ut, nulla.","2011-10-03","income","ARS",72045573,"72045573",3,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (301,"cursus et, magna. Praesent interdum ligula eu enim. Etiam","2006-07-18","income","ARS",52658090,"52658090",4,6),
  (302,"auctor velit. Aliquam nisl. Nulla eu neque pellentesque","2016-01-05","income","ARS",62141191,"62141191",2,10),
  (303,"viverra. Donec tempus, lorem fringilla","2017-07-16","income","ARS",73999456,"73999456",4,7),
  (304,"nunc, ullamcorper eu, euismod ac, fermentum vel,","2017-08-06","expense","ARS",56482385,"56482385",5,9),
  (305,"dictum mi, ac mattis velit justo nec","2012-10-24","expense","ARS",156546,"156546",3,11),
  (306,"rutrum eu, ultrices sit amet, risus.","2014-08-26","expense","ARS",3029578,"3029578",2,12),
  (307,"dolor, nonummy ac, feugiat non,","2012-03-08","expense","ARS",99724924,"99724924",4,2),
  (308,"convallis in, cursus et, eros.","2014-11-16","expense","ARS",376251,"376251",1,6),
  (309,"ac mattis ornare, lectus ante dictum mi, ac mattis","2016-03-30","expense","ARS",50347787,"50347787",2,9),
  (310,"aliquet vel, vulputate eu, odio. Phasellus at","2004-12-25","expense","ARS",95384912,"95384912",4,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (311,"vel, convallis in, cursus et, eros. Proin ultrices.","2017-12-25","income","ARS",38323673,"38323673",3,5),
  (312,"dignissim magna a tortor. Nunc commodo auctor","2011-03-17","income","ARS",22142291,"22142291",3,9),
  (313,"et magnis dis parturient","2016-04-21","expense","ARS",13398516,"13398516",2,1),
  (314,"orci luctus et ultrices posuere","2017-08-27","expense","ARS",38922128,"38922128",4,6),
  (315,"a, scelerisque sed, sapien. Nunc pulvinar","2021-03-20","expense","ARS",57913780,"57913780",4,6),
  (316,"cursus purus. Nullam scelerisque neque sed sem egestas","2007-02-06","expense","ARS",46070455,"46070455",3,11),
  (317,"eu enim. Etiam imperdiet dictum magna. Ut","2011-12-20","income","ARS",11266516,"11266516",1,6),
  (318,"orci quis lectus. Nullam suscipit, est ac facilisis facilisis, magna","2012-11-06","expense","ARS",14617632,"14617632",1,8),
  (319,"a purus. Duis elementum, dui quis accumsan convallis,","2018-07-14","income","ARS",41176334,"41176334",3,3),
  (320,"et, rutrum non, hendrerit id, ante. Nunc","2018-05-06","expense","ARS",46561445,"46561445",3,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (321,"amet, faucibus ut, nulla. Cras eu tellus eu","2017-02-11","income","ARS",48029144,"48029144",2,5),
  (322,"fringilla. Donec feugiat metus sit amet","2011-06-09","income","ARS",61601209,"61601209",3,10),
  (323,"lacus. Etiam bibendum fermentum metus. Aenean","2008-08-13","income","ARS",3193063,"3193063",4,8),
  (324,"lectus pede, ultrices a,","2016-04-01","expense","ARS",54916596,"54916596",4,2),
  (325,"luctus vulputate, nisi sem semper erat, in consectetuer ipsum nunc","2007-05-30","expense","ARS",32267887,"32267887",2,5),
  (326,"rutrum. Fusce dolor quam, elementum at, egestas a, scelerisque","2006-02-04","income","ARS",91856571,"91856571",2,5),
  (327,"egestas. Sed pharetra, felis eget varius ultrices, mauris ipsum porta","2008-07-27","expense","ARS",81114198,"81114198",4,5),
  (328,"Nulla eget metus eu erat semper rutrum. Fusce dolor quam,","2016-02-18","expense","ARS",48674597,"48674597",5,5),
  (329,"amet metus. Aliquam erat volutpat. Nulla facilisis. Suspendisse commodo","2019-10-23","income","ARS",69324793,"69324793",3,12),
  (330,"augue porttitor interdum. Sed auctor odio a purus. Duis elementum,","2012-05-29","expense","ARS",18905027,"18905027",5,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (331,"scelerisque, lorem ipsum sodales purus, in molestie tortor nibh","2021-09-05","income","ARS",58736323,"58736323",5,11),
  (332,"placerat velit. Quisque varius. Nam","2018-08-11","income","ARS",18635309,"18635309",5,5),
  (333,"Vivamus euismod urna. Nullam lobortis quam a felis ullamcorper viverra.","2020-07-20","expense","ARS",65343092,"65343092",2,12),
  (334,"Aenean eget metus. In nec orci.","2012-06-12","income","ARS",24562169,"24562169",3,2),
  (335,"vitae mauris sit amet lorem semper","2012-10-22","expense","ARS",92842873,"92842873",1,8),
  (336,"neque tellus, imperdiet non, vestibulum nec, euismod in, dolor.","2014-11-09","income","ARS",33736852,"33736852",1,12),
  (337,"semper cursus. Integer mollis. Integer","2015-12-09","expense","ARS",41469031,"41469031",2,3),
  (338,"lectus pede et risus. Quisque libero","2018-04-03","income","ARS",97629090,"97629090",1,10),
  (339,"lacus vestibulum lorem, sit amet ultricies sem magna","2022-04-27","expense","ARS",72279378,"72279378",5,7),
  (340,"eget magna. Suspendisse tristique neque venenatis lacus. Etiam bibendum","2017-07-29","expense","ARS",21358927,"21358927",4,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (341,"Curae Phasellus ornare. Fusce mollis. Duis sit amet diam eu","2010-02-20","income","ARS",17409232,"17409232",3,11),
  (342,"tellus sem mollis dui, in sodales elit erat vitae","2011-05-16","income","ARS",39380076,"39380076",5,2),
  (343,"at pede. Cras vulputate","2006-10-13","expense","ARS",53493024,"53493024",3,10),
  (344,"nec mauris blandit mattis. Cras eget nisi dictum augue malesuada","2011-07-09","income","ARS",55835995,"55835995",4,5),
  (345,"lobortis, nisi nibh lacinia orci, consectetuer","2005-06-23","income","ARS",59839253,"59839253",2,8),
  (346,"dictum mi, ac mattis velit","2006-02-25","expense","ARS",9075943,"9075943",4,12),
  (347,"Nam interdum enim non nisi. Aenean eget","2008-01-03","income","ARS",88962992,"88962992",4,12),
  (348,"molestie dapibus ligula. Aliquam erat volutpat. Nulla dignissim.","2016-01-11","expense","ARS",42423664,"42423664",1,7),
  (349,"ornare. In faucibus. Morbi vehicula. Pellentesque","2012-12-11","expense","ARS",40193986,"40193986",4,2),
  (350,"litora torquent per conubia nostra, per","2010-09-27","expense","ARS",84857460,"84857460",2,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (351,"nec orci. Donec nibh. Quisque nonummy","2021-07-14","expense","ARS",47638825,"47638825",2,6),
  (352,"suscipit, est ac facilisis","2010-10-21","expense","ARS",79441308,"79441308",3,7),
  (353,"neque pellentesque massa lobortis ultrices.","2011-03-02","income","ARS",97508435,"97508435",3,10),
  (354,"odio, auctor vitae, aliquet nec, imperdiet nec, leo. Morbi","2016-02-11","income","ARS",19176166,"19176166",2,13),
  (355,"turpis. Nulla aliquet. Proin velit.","2011-11-21","income","ARS",63629499,"63629499",1,5),
  (356,"ac sem ut dolor dapibus gravida. Aliquam tincidunt, nunc","2020-05-23","income","ARS",52330410,"52330410",3,9),
  (357,"nunc nulla vulputate dui, nec tempus mauris erat","2009-02-27","expense","ARS",85519394,"85519394",4,3),
  (358,"purus ac tellus. Suspendisse sed dolor.","2008-12-21","expense","ARS",26325196,"26325196",5,9),
  (359,"justo eu arcu. Morbi sit amet massa. Quisque porttitor eros","2020-02-27","expense","ARS",39542126,"39542126",3,3),
  (360,"quis turpis vitae purus gravida sagittis.","2017-05-22","income","ARS",75883435,"75883435",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (361,"penatibus et magnis dis parturient montes, nascetur","2018-12-16","income","ARS",55953232,"55953232",1,4),
  (362,"lacinia mattis. Integer eu lacus. Quisque imperdiet, erat nonummy","2010-07-06","income","ARS",77879263,"77879263",5,12),
  (363,"orci, in consequat enim","2013-05-22","income","ARS",63666632,"63666632",4,11),
  (364,"commodo ipsum. Suspendisse non leo. Vivamus","2005-12-12","income","ARS",90717373,"90717373",2,8),
  (365,"nec tellus. Nunc lectus pede, ultrices","2017-01-28","expense","ARS",72903881,"72903881",3,9),
  (366,"Proin vel nisl. Quisque fringilla euismod enim.","2021-09-21","expense","ARS",75124013,"75124013",2,8),
  (367,"magnis dis parturient montes, nascetur ridiculus mus.","2020-11-17","expense","ARS",87703861,"87703861",4,10),
  (368,"adipiscing. Mauris molestie pharetra nibh. Aliquam ornare, libero at auctor","2010-06-25","income","ARS",47205410,"47205410",3,3),
  (369,"purus. Maecenas libero est,","2012-03-12","income","ARS",70345083,"70345083",3,4),
  (370,"et netus et malesuada fames ac","2021-01-15","expense","ARS",25029538,"25029538",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (371,"est. Mauris eu turpis. Nulla aliquet.","2011-02-27","expense","ARS",67670892,"67670892",1,2),
  (372,"primis in faucibus orci luctus","2016-03-26","income","ARS",88933767,"88933767",2,13),
  (373,"condimentum. Donec at arcu. Vestibulum ante ipsum primis in","2014-11-09","income","ARS",19340903,"19340903",5,1),
  (374,"Etiam imperdiet dictum magna. Ut","2005-07-05","expense","ARS",83339384,"83339384",5,11),
  (375,"Suspendisse sagittis. Nullam vitae diam. Proin dolor. Nulla semper","2004-10-23","income","ARS",405373,"405373",3,7),
  (376,"Curabitur ut odio vel est tempor bibendum. Donec","2018-08-06","income","ARS",75553674,"75553674",5,13),
  (377,"pede et risus. Quisque libero","2013-08-10","expense","ARS",3921032,"3921032",3,6),
  (378,"volutpat ornare, facilisis eget, ipsum. Donec sollicitudin adipiscing ligula.","2020-11-30","income","ARS",30757123,"30757123",2,13),
  (379,"scelerisque dui. Suspendisse ac metus vitae velit egestas lacinia.","2006-01-15","income","ARS",27681471,"27681471",3,6),
  (380,"scelerisque mollis. Phasellus libero mauris, aliquam eu,","2008-01-31","income","ARS",47299155,"47299155",2,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (381,"Donec felis orci, adipiscing non, luctus sit amet, faucibus ut,","2018-04-17","income","ARS",21685766,"21685766",3,1),
  (382,"Aliquam tincidunt, nunc ac","2014-04-24","expense","ARS",41472871,"41472871",2,11),
  (383,"dis parturient montes, nascetur ridiculus","2020-04-01","income","ARS",54395111,"54395111",5,8),
  (384,"Sed et libero. Proin mi. Aliquam gravida","2014-07-25","income","ARS",84725949,"84725949",4,10),
  (385,"Etiam ligula tortor, dictum eu,","2018-06-16","income","ARS",55476678,"55476678",2,7),
  (386,"aliquet. Proin velit. Sed malesuada augue ut lacus.","2014-04-22","income","ARS",75628328,"75628328",2,10),
  (387,"eleifend, nunc risus varius orci, in consequat enim","2012-09-15","expense","ARS",72288349,"72288349",5,8),
  (388,"Duis at lacus. Quisque purus sapien, gravida non, sollicitudin a,","2018-10-13","expense","ARS",39484213,"39484213",2,3),
  (389,"Nullam feugiat placerat velit. Quisque varius.","2012-04-17","expense","ARS",3795573,"3795573",5,9),
  (390,"molestie arcu. Sed eu nibh vulputate mauris","2007-04-28","income","ARS",17202842,"17202842",1,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (391,"sit amet, dapibus id, blandit at, nisi. Cum","2009-06-30","income","ARS",5973752,"5973752",4,2),
  (392,"vulputate ullamcorper magna. Sed eu eros. Nam consequat dolor vitae","2007-09-16","income","ARS",19382037,"19382037",2,10),
  (393,"libero. Proin mi. Aliquam gravida mauris ut mi.","2020-04-21","expense","ARS",33626359,"33626359",1,6),
  (394,"Nulla tempor augue ac ipsum. Phasellus vitae","2020-05-31","income","ARS",78459220,"78459220",3,5),
  (395,"Suspendisse dui. Fusce diam","2009-11-21","expense","ARS",11643411,"11643411",4,8),
  (396,"Aliquam nec enim. Nunc ut erat. Sed nunc","2005-04-28","income","ARS",53574069,"53574069",1,8),
  (397,"arcu. Vivamus sit amet risus. Donec egestas. Aliquam nec enim.","2019-03-09","expense","ARS",97679833,"97679833",3,3),
  (398,"Morbi neque tellus, imperdiet","2017-01-15","expense","ARS",12663321,"12663321",5,3),
  (399,"enim nec tempus scelerisque, lorem ipsum sodales purus, in","2017-12-16","expense","ARS",73198218,"73198218",4,5),
  (400,"eget lacus. Mauris non dui nec","2012-11-27","income","ARS",25955657,"25955657",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (401,"Etiam imperdiet dictum magna. Ut tincidunt orci quis","2010-07-26","expense","ARS",39640858,"39640858",4,2),
  (402,"iaculis, lacus pede sagittis augue, eu","2009-02-28","income","ARS",73103762,"73103762",3,7),
  (403,"sagittis augue, eu tempor erat neque non quam. Pellentesque","2013-10-29","income","ARS",41107507,"41107507",2,3),
  (404,"leo, in lobortis tellus justo","2013-01-04","income","ARS",63038395,"63038395",3,2),
  (405,"rutrum, justo. Praesent luctus. Curabitur egestas nunc","2018-03-30","income","ARS",79611244,"79611244",4,8),
  (406,"libero lacus, varius et, euismod et, commodo at, libero.","2022-04-09","income","ARS",21148489,"21148489",2,12),
  (407,"Cras eu tellus eu","2017-02-17","expense","ARS",75328669,"75328669",5,8),
  (408,"tincidunt vehicula risus. Nulla eget metus eu erat semper rutrum.","2005-08-06","income","ARS",30712753,"30712753",2,1),
  (409,"faucibus id, libero. Donec consectetuer mauris id sapien. Cras dolor","2015-05-31","income","ARS",65761151,"65761151",4,2),
  (410,"molestie tortor nibh sit","2016-10-20","income","ARS",86925275,"86925275",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (411,"Fusce mi lorem, vehicula et, rutrum eu,","2020-09-01","income","ARS",58397342,"58397342",4,3),
  (412,"sapien imperdiet ornare. In faucibus.","2013-01-17","expense","ARS",90429436,"90429436",4,10),
  (413,"purus. Nullam scelerisque neque sed sem egestas blandit. Nam","2011-03-02","expense","ARS",88773474,"88773474",4,6),
  (414,"non arcu. Vivamus sit amet risus. Donec egestas. Aliquam","2010-12-31","expense","ARS",91376904,"91376904",2,9),
  (415,"Nullam lobortis quam a felis ullamcorper viverra. Maecenas","2007-05-10","expense","ARS",44202403,"44202403",1,8),
  (416,"nisl arcu iaculis enim, sit amet ornare lectus justo","2014-04-22","expense","ARS",65004893,"65004893",3,3),
  (417,"a, dui. Cras pellentesque. Sed dictum. Proin eget odio.","2015-10-02","expense","ARS",83841097,"83841097",3,2),
  (418,"Ut nec urna et arcu imperdiet","2010-08-30","expense","ARS",81615371,"81615371",2,2),
  (419,"adipiscing elit. Aliquam auctor, velit eget laoreet","2012-03-08","expense","ARS",36532356,"36532356",2,9),
  (420,"Nullam suscipit, est ac facilisis facilisis, magna tellus","2016-09-17","expense","ARS",29810541,"29810541",2,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (421,"odio vel est tempor bibendum. Donec felis","2018-07-03","income","ARS",22366542,"22366542",5,8),
  (422,"nec luctus felis purus ac","2021-08-20","income","ARS",51021504,"51021504",1,8),
  (423,"Aliquam tincidunt, nunc ac mattis ornare, lectus ante dictum","2021-05-28","income","ARS",19448118,"19448118",1,1),
  (424,"commodo ipsum. Suspendisse non leo. Vivamus nibh","2007-02-22","expense","ARS",16712623,"16712623",3,13),
  (425,"auctor, nunc nulla vulputate dui, nec tempus mauris erat eget","2011-05-05","expense","ARS",34479975,"34479975",5,6),
  (426,"quam dignissim pharetra. Nam ac nulla. In tincidunt","2012-02-18","income","ARS",22830462,"22830462",3,2),
  (427,"non ante bibendum ullamcorper. Duis cursus, diam at pretium","2016-03-22","income","ARS",92138219,"92138219",4,3),
  (428,"ipsum. Curabitur consequat, lectus sit amet luctus vulputate, nisi sem","2005-05-29","expense","ARS",44202390,"44202390",1,10),
  (429,"Phasellus dolor elit, pellentesque a, facilisis","2018-08-29","income","ARS",28208241,"28208241",3,11),
  (430,"lectus justo eu arcu. Morbi sit amet massa.","2009-10-11","income","ARS",41906013,"41906013",5,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (431,"dolor elit, pellentesque a, facilisis non, bibendum sed, est.","2004-09-11","income","ARS",96285108,"96285108",4,12),
  (432,"Donec egestas. Aliquam nec enim.","2009-11-10","income","ARS",22746395,"22746395",3,3),
  (433,"euismod enim. Etiam gravida molestie","2007-11-19","expense","ARS",90011881,"90011881",2,9),
  (434,"non, lobortis quis, pede. Suspendisse dui. Fusce","2017-11-03","income","ARS",71406938,"71406938",2,1),
  (435,"scelerisque neque sed sem egestas blandit. Nam nulla","2022-05-01","income","ARS",87517893,"87517893",4,2),
  (436,"purus sapien, gravida non, sollicitudin a,","2011-08-01","income","ARS",20529713,"20529713",4,9),
  (437,"scelerisque neque. Nullam nisl. Maecenas malesuada","2011-04-30","income","ARS",98341083,"98341083",2,7),
  (438,"amet, consectetuer adipiscing elit. Curabitur","2007-09-27","expense","ARS",34363619,"34363619",2,12),
  (439,"non, egestas a, dui. Cras pellentesque.","2009-02-05","income","ARS",13677975,"13677975",3,6),
  (440,"In ornare sagittis felis. Donec tempor, est","2020-10-07","expense","ARS",64910247,"64910247",5,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (441,"commodo tincidunt nibh. Phasellus nulla. Integer vulputate,","2018-05-11","expense","ARS",66648294,"66648294",2,1),
  (442,"molestie dapibus ligula. Aliquam erat volutpat. Nulla dignissim.","2020-03-14","income","ARS",29222722,"29222722",4,10),
  (443,"nec, euismod in, dolor. Fusce feugiat. Lorem ipsum dolor","2011-03-03","expense","ARS",40038261,"40038261",3,7),
  (444,"Duis volutpat nunc sit","2005-05-12","expense","ARS",91050418,"91050418",3,3),
  (445,"euismod et, commodo at, libero.","2009-07-31","income","ARS",9177507,"9177507",2,5),
  (446,"diam eu dolor egestas","2014-08-12","income","ARS",7505557,"7505557",3,10),
  (447,"egestas. Duis ac arcu. Nunc mauris.","2013-05-25","income","ARS",50752050,"50752050",5,1),
  (448,"sed, sapien. Nunc pulvinar arcu et","2019-02-21","expense","ARS",13952914,"13952914",3,4),
  (449,"semper pretium neque. Morbi quis urna.","2020-02-18","expense","ARS",18744844,"18744844",4,11),
  (450,"nec tellus. Nunc lectus","2021-02-15","expense","ARS",43477559,"43477559",4,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (451,"aptent taciti sociosqu ad litora torquent per conubia","2011-04-22","expense","ARS",3125366,"3125366",5,11),
  (452,"fringilla mi lacinia mattis. Integer eu","2011-09-25","expense","ARS",58090374,"58090374",4,7),
  (453,"sed orci lobortis augue scelerisque mollis. Phasellus","2013-09-26","income","ARS",45390237,"45390237",3,13),
  (454,"dictum mi, ac mattis velit justo","2015-02-18","income","ARS",10808193,"10808193",3,11),
  (455,"id nunc interdum feugiat. Sed nec metus facilisis","2005-03-29","expense","ARS",40228738,"40228738",5,7),
  (456,"risus, at fringilla purus mauris a nunc.","2011-02-04","income","ARS",33737735,"33737735",2,4),
  (457,"odio sagittis semper. Nam tempor diam dictum sapien. Aenean","2021-07-12","expense","ARS",3443655,"3443655",3,2),
  (458,"et pede. Nunc sed orci lobortis augue scelerisque mollis.","2008-03-24","income","ARS",91664020,"91664020",3,2),
  (459,"mollis vitae, posuere at, velit. Cras lorem lorem,","2005-04-01","income","ARS",68499160,"68499160",2,6),
  (460,"ac risus. Morbi metus. Vivamus euismod urna.","2020-09-18","expense","ARS",5085293,"5085293",2,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (461,"tincidunt. Donec vitae erat vel pede blandit congue.","2011-05-23","expense","ARS",57065592,"57065592",4,2),
  (462,"Proin sed turpis nec mauris blandit","2012-08-04","income","ARS",89485789,"89485789",1,12),
  (463,"feugiat metus sit amet ante. Vivamus non lorem","2013-02-14","expense","ARS",26295073,"26295073",1,10),
  (464,"consequat auctor, nunc nulla vulputate dui, nec tempus mauris","2018-05-02","expense","ARS",5590903,"5590903",1,11),
  (465,"neque. Morbi quis urna. Nunc quis arcu","2008-03-26","expense","ARS",43194001,"43194001",4,6),
  (466,"dictum. Proin eget odio. Aliquam vulputate ullamcorper magna. Sed eu","2021-02-03","income","ARS",84942407,"84942407",4,9),
  (467,"felis. Donec tempor, est ac","2009-04-20","income","ARS",84423232,"84423232",5,11),
  (468,"nunc. In at pede. Cras vulputate velit eu sem. Pellentesque","2007-02-20","expense","ARS",71735063,"71735063",2,6),
  (469,"sit amet ante. Vivamus","2008-10-27","expense","ARS",22072131,"22072131",5,6),
  (470,"quis diam luctus lobortis. Class aptent taciti sociosqu ad","2016-10-19","income","ARS",42569049,"42569049",4,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (471,"egestas. Fusce aliquet magna a neque.","2021-03-27","expense","ARS",92451323,"92451323",2,12),
  (472,"imperdiet dictum magna. Ut","2018-07-14","income","ARS",94056640,"94056640",4,7),
  (473,"arcu. Curabitur ut odio vel est tempor","2006-08-02","expense","ARS",47189124,"47189124",2,9),
  (474,"Morbi metus. Vivamus euismod urna.","2019-05-18","income","ARS",30314653,"30314653",4,3),
  (475,"mauris ipsum porta elit, a","2018-12-29","expense","ARS",51804090,"51804090",5,11),
  (476,"nec, imperdiet nec, leo. Morbi neque","2009-03-08","expense","ARS",56363473,"56363473",3,7),
  (477,"tincidunt orci quis lectus.","2021-08-04","expense","ARS",54331890,"54331890",2,3),
  (478,"lorem ac risus. Morbi metus. Vivamus euismod urna. Nullam","2018-01-27","expense","ARS",58430736,"58430736",2,6),
  (479,"ac mattis ornare, lectus","2012-04-06","income","ARS",30209393,"30209393",5,13),
  (480,"nostra, per inceptos hymenaeos. Mauris","2017-05-13","expense","ARS",57722015,"57722015",4,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (481,"elit. Aliquam auctor, velit eget laoreet posuere, enim nisl","2019-04-21","income","ARS",1890657,"1890657",4,10),
  (482,"nisi. Cum sociis natoque penatibus et magnis dis","2019-10-28","income","ARS",93986129,"93986129",3,12),
  (483,"ut, pellentesque eget, dictum placerat, augue. Sed molestie. Sed","2012-08-26","expense","ARS",14719840,"14719840",4,10),
  (484,"imperdiet nec, leo. Morbi neque tellus, imperdiet non,","2021-06-25","expense","ARS",18068600,"18068600",1,7),
  (485,"ultrices posuere cubilia Curae Phasellus ornare. Fusce mollis.","2018-08-08","expense","ARS",422120,"422120",4,6),
  (486,"taciti sociosqu ad litora torquent per conubia","2007-08-16","income","ARS",17426515,"17426515",4,4),
  (487,"eget lacus. Mauris non dui nec urna suscipit nonummy.","2018-07-01","income","ARS",44317565,"44317565",2,6),
  (488,"erat vitae risus. Duis a mi fringilla mi lacinia mattis.","2019-02-03","expense","ARS",12141782,"12141782",4,2),
  (489,"nunc est, mollis non, cursus non, egestas","2007-12-26","income","ARS",80739483,"80739483",5,6),
  (490,"at, velit. Cras lorem lorem, luctus ut, pellentesque eget, dictum","2017-06-28","income","ARS",59283386,"59283386",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (491,"aliquam eu, accumsan sed, facilisis vitae, orci. Phasellus","2011-08-10","income","ARS",89607073,"89607073",5,2),
  (492,"parturient montes, nascetur ridiculus mus. Aenean eget magna.","2015-08-29","expense","ARS",30671768,"30671768",4,7),
  (493,"eget magna. Suspendisse tristique neque","2014-02-03","income","ARS",37455788,"37455788",4,5),
  (494,"non, cursus non, egestas a, dui. Cras pellentesque. Sed","2021-05-10","expense","ARS",59197094,"59197094",2,3),
  (495,"In at pede. Cras vulputate velit","2014-01-19","income","ARS",26995511,"26995511",3,5),
  (496,"Maecenas malesuada fringilla est. Mauris eu turpis. Nulla aliquet.","2008-02-04","expense","ARS",1920718,"1920718",1,5),
  (497,"eu elit. Nulla facilisi. Sed neque. Sed","2007-11-09","expense","ARS",45780501,"45780501",3,3),
  (498,"risus varius orci, in consequat enim diam vel arcu.","2014-02-25","income","ARS",78733892,"78733892",4,4),
  (499,"amet massa. Quisque porttitor","2005-01-09","expense","ARS",96001949,"96001949",4,10),
  (500,"adipiscing elit. Etiam laoreet, libero et tristique pellentesque, tellus","2009-12-31","income","ARS",50846027,"50846027",1,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (501,"sit amet metus. Aliquam erat volutpat. Nulla","2019-01-13","expense","ARS",51112621,"51112621",1,4),
  (502,"hendrerit neque. In ornare sagittis","2009-04-10","expense","ARS",53623514,"53623514",4,4),
  (503,"consectetuer euismod est arcu ac orci. Ut semper pretium","2010-04-24","expense","ARS",99065040,"99065040",3,10),
  (504,"nec mauris blandit mattis. Cras eget nisi dictum augue","2016-05-17","expense","ARS",35109637,"35109637",4,11),
  (505,"Fusce mollis. Duis sit amet diam eu dolor egestas","2005-02-04","income","ARS",9978462,"9978462",2,4),
  (506,"libero. Integer in magna. Phasellus","2020-01-25","income","ARS",57117500,"57117500",3,12),
  (507,"viverra. Maecenas iaculis aliquet diam. Sed","2021-05-07","expense","ARS",85143923,"85143923",2,6),
  (508,"nunc, ullamcorper eu, euismod","2011-02-10","income","ARS",24006477,"24006477",2,12),
  (509,"ut cursus luctus, ipsum leo elementum sem, vitae","2007-08-16","expense","ARS",9915599,"9915599",2,2),
  (510,"amet, consectetuer adipiscing elit. Curabitur sed","2013-12-23","expense","ARS",40220886,"40220886",4,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (511,"enim, condimentum eget, volutpat ornare, facilisis eget,","2013-03-12","expense","ARS",43443782,"43443782",5,6),
  (512,"Proin mi. Aliquam gravida mauris ut mi. Duis","2007-06-11","expense","ARS",1896790,"1896790",4,2),
  (513,"erat vitae risus. Duis a mi fringilla mi","2005-03-19","income","ARS",79168340,"79168340",4,6),
  (514,"Mauris ut quam vel sapien imperdiet ornare. In","2018-01-16","expense","ARS",61981516,"61981516",4,4),
  (515,"erat, eget tincidunt dui augue eu tellus. Phasellus elit","2013-06-18","expense","ARS",3355542,"3355542",1,11),
  (516,"nisi. Aenean eget metus. In nec orci. Donec","2009-05-24","income","ARS",87784336,"87784336",2,5),
  (517,"euismod enim. Etiam gravida molestie","2018-08-04","income","ARS",38304350,"38304350",3,11),
  (518,"tempor, est ac mattis semper, dui lectus","2020-06-16","income","ARS",90216386,"90216386",4,7),
  (519,"velit. Pellentesque ultricies dignissim lacus. Aliquam rutrum","2006-03-17","expense","ARS",7856370,"7856370",5,4),
  (520,"rutrum urna, nec luctus felis purus ac tellus. Suspendisse sed","2020-07-23","income","ARS",92159555,"92159555",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (521,"sit amet, consectetuer adipiscing elit. Etiam","2020-02-07","income","ARS",58499803,"58499803",3,6),
  (522,"nec, leo. Morbi neque tellus, imperdiet non, vestibulum","2010-10-02","income","ARS",25111690,"25111690",5,7),
  (523,"Sed eu nibh vulputate mauris sagittis placerat. Cras dictum ultricies","2007-08-11","income","ARS",22445207,"22445207",2,9),
  (524,"a, arcu. Sed et libero. Proin mi. Aliquam","2010-11-21","expense","ARS",94195893,"94195893",5,4),
  (525,"odio tristique pharetra. Quisque ac","2005-03-24","expense","ARS",74197987,"74197987",3,6),
  (526,"sed dolor. Fusce mi lorem, vehicula et, rutrum eu, ultrices","2022-05-19","expense","ARS",91554477,"91554477",1,11),
  (527,"non nisi. Aenean eget metus.","2018-11-22","expense","ARS",65409772,"65409772",2,2),
  (528,"vestibulum. Mauris magna. Duis","2015-12-17","income","ARS",38947382,"38947382",4,7),
  (529,"ac sem ut dolor dapibus gravida.","2008-08-08","income","ARS",19884954,"19884954",4,13),
  (530,"dictum sapien. Aenean massa. Integer vitae","2009-08-07","income","ARS",49472161,"49472161",2,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (531,"arcu. Nunc mauris. Morbi non sapien molestie orci tincidunt","2021-05-08","expense","ARS",75943290,"75943290",2,3),
  (532,"nisi a odio semper","2021-06-01","expense","ARS",82892953,"82892953",4,10),
  (533,"vel turpis. Aliquam adipiscing lobortis risus. In mi pede, nonummy","2017-09-15","income","ARS",43713887,"43713887",4,11),
  (534,"ut nisi a odio semper cursus. Integer","2007-01-05","expense","ARS",46075545,"46075545",2,4),
  (535,"libero. Integer in magna. Phasellus dolor","2012-07-05","expense","ARS",48401387,"48401387",3,10),
  (536,"nisi sem semper erat, in consectetuer ipsum nunc id enim.","2017-03-09","income","ARS",6550022,"6550022",2,6),
  (537,"eros non enim commodo hendrerit.","2009-08-29","expense","ARS",61836171,"61836171",2,2),
  (538,"Aenean sed pede nec ante blandit viverra.","2015-09-12","expense","ARS",84404057,"84404057",2,12),
  (539,"ante ipsum primis in faucibus orci","2010-01-06","expense","ARS",99637724,"99637724",3,12),
  (540,"lacinia. Sed congue, elit sed consequat auctor, nunc","2013-05-05","expense","ARS",72327041,"72327041",4,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (541,"parturient montes, nascetur ridiculus mus. Proin vel arcu eu odio","2015-06-14","income","ARS",69347076,"69347076",1,8),
  (542,"fringilla euismod enim. Etiam gravida molestie arcu. Sed eu","2015-05-15","expense","ARS",21262106,"21262106",3,9),
  (543,"ultrices. Duis volutpat nunc sit amet metus. Aliquam","2014-03-11","expense","ARS",18205775,"18205775",4,13),
  (544,"purus. Duis elementum, dui quis accumsan convallis,","2013-05-04","income","ARS",75348394,"75348394",5,11),
  (545,"velit dui, semper et, lacinia","2018-08-31","expense","ARS",35258898,"35258898",3,4),
  (546,"eget, dictum placerat, augue. Sed","2017-11-06","expense","ARS",94378868,"94378868",3,5),
  (547,"nulla. Cras eu tellus eu augue porttitor","2015-08-15","income","ARS",58418946,"58418946",3,10),
  (548,"Cras lorem lorem, luctus ut, pellentesque eget,","2017-05-06","income","ARS",96474919,"96474919",4,4),
  (549,"nibh. Quisque nonummy ipsum non arcu.","2004-12-02","expense","ARS",32596119,"32596119",4,6),
  (550,"pharetra. Nam ac nulla. In tincidunt congue turpis.","2020-07-08","expense","ARS",47798289,"47798289",5,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (551,"ullamcorper viverra. Maecenas iaculis aliquet diam. Sed diam lorem,","2014-09-24","income","ARS",63673103,"63673103",4,7),
  (552,"magna. Lorem ipsum dolor sit","2021-11-12","income","ARS",42383236,"42383236",1,3),
  (553,"nascetur ridiculus mus. Proin vel arcu","2008-03-22","income","ARS",12885225,"12885225",2,4),
  (554,"Donec fringilla. Donec feugiat metus sit amet ante. Vivamus","2014-02-14","income","ARS",2225515,"2225515",1,10),
  (555,"aliquet lobortis, nisi nibh lacinia orci, consectetuer euismod est arcu","2010-06-05","expense","ARS",58415686,"58415686",3,13),
  (556,"et, magna. Praesent interdum ligula eu enim.","2014-03-31","expense","ARS",53969469,"53969469",2,9),
  (557,"ante dictum cursus. Nunc mauris elit, dictum eu,","2008-04-21","income","ARS",5958621,"5958621",2,12),
  (558,"sagittis semper. Nam tempor diam dictum sapien. Aenean massa.","2015-04-16","expense","ARS",60732024,"60732024",1,5),
  (559,"blandit viverra. Donec tempus, lorem fringilla ornare placerat,","2014-07-26","expense","ARS",79479844,"79479844",4,8),
  (560,"vel, convallis in, cursus et, eros. Proin ultrices. Duis","2006-09-04","income","ARS",81182256,"81182256",2,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (561,"imperdiet non, vestibulum nec, euismod in, dolor.","2009-04-19","income","ARS",32474871,"32474871",2,12),
  (562,"fermentum arcu. Vestibulum ante ipsum primis in faucibus","2010-05-29","expense","ARS",89866152,"89866152",5,2),
  (563,"eu erat semper rutrum. Fusce dolor","2019-10-24","expense","ARS",89186594,"89186594",3,10),
  (564,"sit amet risus. Donec egestas. Aliquam nec enim. Nunc","2014-11-07","expense","ARS",67219700,"67219700",2,2),
  (565,"nulla. Cras eu tellus eu","2013-10-15","income","ARS",27828571,"27828571",5,9),
  (566,"ornare. Fusce mollis. Duis sit","2015-03-04","income","ARS",48283894,"48283894",1,5),
  (567,"iaculis aliquet diam. Sed diam","2021-06-18","expense","ARS",70440110,"70440110",4,9),
  (568,"eu, euismod ac, fermentum vel, mauris. Integer sem elit,","2019-11-12","income","ARS",77747993,"77747993",1,13),
  (569,"ipsum. Curabitur consequat, lectus sit amet luctus vulputate,","2017-07-18","expense","ARS",13667706,"13667706",3,11),
  (570,"aliquet molestie tellus. Aenean egestas hendrerit","2013-10-21","income","ARS",92360175,"92360175",3,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (571,"mauris blandit mattis. Cras eget nisi dictum augue malesuada","2006-09-15","expense","ARS",11470690,"11470690",1,2),
  (572,"lorem lorem, luctus ut, pellentesque eget, dictum","2018-03-24","expense","ARS",85619326,"85619326",2,3),
  (573,"pede. Suspendisse dui. Fusce diam nunc, ullamcorper","2004-10-12","expense","ARS",56236697,"56236697",4,2),
  (574,"vehicula aliquet libero. Integer in","2012-06-02","income","ARS",21615723,"21615723",2,13),
  (575,"at risus. Nunc ac sem ut dolor dapibus gravida. Aliquam","2018-08-12","expense","ARS",68046511,"68046511",2,13),
  (576,"mi. Duis risus odio, auctor vitae, aliquet nec, imperdiet","2017-12-03","expense","ARS",20246818,"20246818",2,10),
  (577,"enim non nisi. Aenean eget metus. In nec orci.","2020-10-19","expense","ARS",19197783,"19197783",1,11),
  (578,"Fusce mollis. Duis sit amet diam","2015-05-18","expense","ARS",73938623,"73938623",5,13),
  (579,"turpis. Nulla aliquet. Proin velit. Sed malesuada augue ut","2014-01-10","income","ARS",95511602,"95511602",2,9),
  (580,"nec, mollis vitae, posuere at,","2019-07-24","expense","ARS",88280266,"88280266",4,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (581,"erat. Etiam vestibulum massa rutrum magna.","2013-06-06","expense","ARS",62836626,"62836626",2,7),
  (582,"vitae semper egestas, urna justo faucibus","2016-10-06","expense","ARS",44974449,"44974449",4,10),
  (583,"urna. Vivamus molestie dapibus ligula. Aliquam erat","2021-12-14","expense","ARS",37171696,"37171696",3,10),
  (584,"Nam tempor diam dictum sapien. Aenean massa. Integer","2019-05-06","income","ARS",52400175,"52400175",4,12),
  (585,"faucibus orci luctus et ultrices posuere cubilia Curae Donec tincidunt.","2020-09-14","expense","ARS",6936295,"6936295",2,10),
  (586,"tempus eu, ligula. Aenean","2008-10-13","expense","ARS",90008099,"90008099",2,1),
  (587,"et risus. Quisque libero lacus,","2007-01-16","income","ARS",70235639,"70235639",2,5),
  (588,"sollicitudin adipiscing ligula. Aenean gravida nunc sed pede. Cum sociis","2007-12-08","income","ARS",4976368,"4976368",1,7),
  (589,"Nunc mauris elit, dictum eu, eleifend nec, malesuada ut, sem.","2015-07-22","expense","ARS",16393777,"16393777",4,5),
  (590,"eleifend nec, malesuada ut, sem. Nulla interdum.","2021-11-06","income","ARS",56448342,"56448342",2,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (591,"ornare, libero at auctor ullamcorper,","2007-12-31","expense","ARS",42825781,"42825781",3,8),
  (592,"a, dui. Cras pellentesque. Sed dictum. Proin eget odio.","2016-11-06","income","ARS",9390195,"9390195",2,8),
  (593,"Sed nec metus facilisis lorem tristique aliquet. Phasellus fermentum convallis","2009-06-18","income","ARS",56669514,"56669514",3,10),
  (594,"vulputate ullamcorper magna. Sed eu eros. Nam consequat","2019-02-10","income","ARS",22255572,"22255572",3,13),
  (595,"libero at auctor ullamcorper, nisl arcu iaculis","2005-09-20","expense","ARS",85043400,"85043400",3,4),
  (596,"sagittis placerat. Cras dictum ultricies ligula. Nullam","2004-10-11","income","ARS",58241109,"58241109",2,8),
  (597,"consequat nec, mollis vitae, posuere at, velit.","2021-01-20","expense","ARS",27344853,"27344853",5,10),
  (598,"lorem lorem, luctus ut, pellentesque eget, dictum placerat,","2009-01-12","expense","ARS",99982433,"99982433",1,9),
  (599,"consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing","2015-06-15","expense","ARS",94550936,"94550936",1,5),
  (600,"turpis. Nulla aliquet. Proin velit. Sed","2017-08-11","expense","ARS",36419520,"36419520",3,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (601,"ipsum primis in faucibus orci luctus et ultrices posuere cubilia","2020-12-21","income","ARS",20381821,"20381821",4,9),
  (602,"dolor, tempus non, lacinia at, iaculis","2014-02-23","expense","ARS",66446816,"66446816",3,10),
  (603,"malesuada fames ac turpis egestas.","2012-03-27","income","ARS",65380602,"65380602",2,6),
  (604,"mollis. Duis sit amet diam eu dolor egestas rhoncus.","2008-07-21","expense","ARS",91217318,"91217318",5,13),
  (605,"erat volutpat. Nulla facilisis. Suspendisse commodo tincidunt nibh.","2019-04-21","expense","ARS",98751532,"98751532",3,10),
  (606,"montes, nascetur ridiculus mus. Aenean","2015-02-07","income","ARS",63788214,"63788214",3,13),
  (607,"elit. Etiam laoreet, libero et tristique pellentesque, tellus sem","2021-05-13","expense","ARS",7650973,"7650973",3,10),
  (608,"lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit elit fermentum","2010-05-06","income","ARS",8023177,"8023177",2,3),
  (609,"est tempor bibendum. Donec felis orci, adipiscing non, luctus","2013-01-17","expense","ARS",89323897,"89323897",4,12),
  (610,"vehicula risus. Nulla eget metus eu erat semper rutrum.","2007-11-28","expense","ARS",60050836,"60050836",3,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (611,"ornare placerat, orci lacus","2013-06-12","income","ARS",40440957,"40440957",3,2),
  (612,"nisl. Nulla eu neque pellentesque massa","2020-06-24","expense","ARS",36814183,"36814183",1,7),
  (613,"lacinia mattis. Integer eu lacus. Quisque imperdiet, erat nonummy","2004-10-06","income","ARS",12599449,"12599449",4,11),
  (614,"Curabitur massa. Vestibulum accumsan neque et nunc. Quisque ornare","2010-06-25","expense","ARS",76749138,"76749138",3,12),
  (615,"ac mattis semper, dui lectus rutrum urna, nec luctus","2021-04-16","income","ARS",3623242,"3623242",5,3),
  (616,"ac metus vitae velit egestas lacinia. Sed congue,","2010-02-21","expense","ARS",54076785,"54076785",3,3),
  (617,"Nulla tempor augue ac ipsum. Phasellus vitae mauris","2022-04-06","income","ARS",71810544,"71810544",4,11),
  (618,"Donec feugiat metus sit amet ante.","2005-06-22","expense","ARS",55626263,"55626263",2,5),
  (619,"lorem ipsum sodales purus, in molestie tortor nibh sit amet","2016-01-21","expense","ARS",17172766,"17172766",2,5),
  (620,"inceptos hymenaeos. Mauris ut quam vel sapien imperdiet ornare. In","2007-11-30","income","ARS",11023244,"11023244",2,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (621,"Curae Donec tincidunt. Donec vitae erat vel","2010-06-29","expense","ARS",87343303,"87343303",5,9),
  (622,"Quisque imperdiet, erat nonummy ultricies ornare, elit elit","2009-06-06","expense","ARS",80518603,"80518603",3,6),
  (623,"tristique aliquet. Phasellus fermentum","2006-12-01","expense","ARS",68185482,"68185482",3,3),
  (624,"ornare tortor at risus.","2018-04-28","expense","ARS",4935336,"4935336",3,4),
  (625,"pharetra. Quisque ac libero nec ligula consectetuer rhoncus. Nullam velit","2019-08-30","income","ARS",95562207,"95562207",3,10),
  (626,"venenatis vel, faucibus id, libero. Donec","2009-04-29","income","ARS",55656905,"55656905",5,8),
  (627,"odio. Etiam ligula tortor,","2018-08-20","expense","ARS",51882987,"51882987",4,11),
  (628,"dui. Cum sociis natoque penatibus et magnis dis parturient montes,","2015-03-02","expense","ARS",70032383,"70032383",2,2),
  (629,"sem, consequat nec, mollis vitae, posuere at,","2017-11-22","expense","ARS",57075104,"57075104",2,3),
  (630,"velit. Cras lorem lorem, luctus ut, pellentesque eget,","2010-02-22","income","ARS",7834093,"7834093",5,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (631,"dolor vitae dolor. Donec fringilla. Donec feugiat metus","2009-10-31","income","ARS",29599199,"29599199",4,13),
  (632,"Fusce fermentum fermentum arcu. Vestibulum ante ipsum primis in faucibus","2018-07-25","expense","ARS",51990892,"51990892",3,11),
  (633,"egestas lacinia. Sed congue,","2017-01-14","income","ARS",27979747,"27979747",1,11),
  (634,"elit erat vitae risus. Duis","2011-07-09","expense","ARS",84172540,"84172540",2,12),
  (635,"tincidunt aliquam arcu. Aliquam ultrices iaculis odio. Nam interdum enim","2012-11-10","expense","ARS",48070590,"48070590",3,12),
  (636,"elit, a feugiat tellus lorem eu","2012-02-09","expense","ARS",1336325,"1336325",3,12),
  (637,"Etiam ligula tortor, dictum eu, placerat eget, venenatis a, magna.","2011-04-28","income","ARS",41288126,"41288126",2,5),
  (638,"Aliquam erat volutpat. Nulla facilisis. Suspendisse commodo tincidunt","2011-10-15","expense","ARS",79148485,"79148485",4,8),
  (639,"non enim. Mauris quis turpis vitae purus gravida sagittis.","2006-07-10","expense","ARS",77929883,"77929883",2,6),
  (640,"sapien. Aenean massa. Integer","2005-03-14","income","ARS",60018142,"60018142",3,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (641,"sapien, gravida non, sollicitudin a, malesuada id,","2005-01-15","expense","ARS",42888032,"42888032",4,12),
  (642,"nec, malesuada ut, sem. Nulla","2006-06-26","income","ARS",14652450,"14652450",2,13),
  (643,"Nulla tincidunt, neque vitae semper egestas, urna","2010-04-07","expense","ARS",37064553,"37064553",4,10),
  (644,"fermentum arcu. Vestibulum ante ipsum","2006-11-15","expense","ARS",86648144,"86648144",1,13),
  (645,"justo eu arcu. Morbi sit amet","2017-10-05","income","ARS",48405513,"48405513",4,6),
  (646,"quam quis diam. Pellentesque habitant morbi tristique senectus et","2011-11-12","income","ARS",44900570,"44900570",5,6),
  (647,"mattis semper, dui lectus rutrum","2008-06-12","expense","ARS",52954855,"52954855",3,9),
  (648,"ligula. Donec luctus aliquet odio. Etiam ligula","2007-03-09","expense","ARS",64947865,"64947865",3,9),
  (649,"sed orci lobortis augue scelerisque","2018-05-28","expense","ARS",71918374,"71918374",3,8),
  (650,"sed sem egestas blandit. Nam nulla","2012-11-20","expense","ARS",1313028,"1313028",2,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (651,"tempor bibendum. Donec felis","2013-03-07","income","ARS",48876234,"48876234",2,5),
  (652,"ullamcorper magna. Sed eu eros. Nam","2009-05-25","income","ARS",75825103,"75825103",3,5),
  (653,"enim diam vel arcu. Curabitur ut odio vel est","2006-04-12","income","ARS",25180783,"25180783",4,12),
  (654,"sociis natoque penatibus et magnis dis","2010-07-01","income","ARS",17899990,"17899990",3,2),
  (655,"mauris ipsum porta elit, a feugiat tellus","2015-10-06","expense","ARS",6881543,"6881543",4,3),
  (656,"nulla. In tincidunt congue turpis.","2015-10-29","income","ARS",85787688,"85787688",2,7),
  (657,"leo, in lobortis tellus justo sit","2016-05-04","expense","ARS",62846143,"62846143",3,10),
  (658,"enim consequat purus. Maecenas","2013-02-06","expense","ARS",36304241,"36304241",1,11),
  (659,"a felis ullamcorper viverra. Maecenas iaculis aliquet diam.","2014-11-19","income","ARS",24618201,"24618201",2,8),
  (660,"lacinia at, iaculis quis, pede. Praesent eu","2016-01-15","income","ARS",38006505,"38006505",1,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (661,"egestas a, dui. Cras pellentesque. Sed dictum. Proin eget odio.","2004-12-09","expense","ARS",30362952,"30362952",4,2),
  (662,"augue porttitor interdum. Sed auctor odio a purus.","2018-05-14","income","ARS",67333402,"67333402",3,8),
  (663,"eget, volutpat ornare, facilisis eget,","2009-08-02","expense","ARS",73760213,"73760213",2,4),
  (664,"lorem lorem, luctus ut, pellentesque eget, dictum placerat, augue.","2005-05-06","income","ARS",21894068,"21894068",4,12),
  (665,"mus. Donec dignissim magna a tortor.","2019-04-16","income","ARS",31403015,"31403015",2,2),
  (666,"sollicitudin orci sem eget massa. Suspendisse","2012-08-30","expense","ARS",3998354,"3998354",1,3),
  (667,"amet, faucibus ut, nulla. Cras eu","2011-05-05","income","ARS",22482707,"22482707",5,13),
  (668,"eu eros. Nam consequat dolor vitae dolor. Donec","2018-11-09","income","ARS",82226988,"82226988",2,9),
  (669,"nec orci. Donec nibh. Quisque nonummy","2008-03-10","income","ARS",1829791,"1829791",2,10),
  (670,"lorem ipsum sodales purus, in","2004-09-07","income","ARS",84798059,"84798059",5,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (671,"Sed dictum. Proin eget odio. Aliquam vulputate ullamcorper magna. Sed","2012-07-06","expense","ARS",11279139,"11279139",4,10),
  (672,"at pede. Cras vulputate velit","2011-04-20","expense","ARS",14090118,"14090118",2,9),
  (673,"diam nunc, ullamcorper eu, euismod ac,","2010-08-27","income","ARS",21291320,"21291320",5,9),
  (674,"augue malesuada malesuada. Integer id magna et ipsum cursus vestibulum.","2017-10-08","expense","ARS",58916056,"58916056",5,9),
  (675,"lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit elit","2009-10-13","income","ARS",33129656,"33129656",2,4),
  (676,"Praesent luctus. Curabitur egestas nunc sed libero. Proin sed turpis","2012-02-14","expense","ARS",62605726,"62605726",5,4),
  (677,"Sed eu eros. Nam consequat dolor vitae","2012-10-15","expense","ARS",49665866,"49665866",4,4),
  (678,"consequat nec, mollis vitae, posuere at, velit.","2017-11-13","expense","ARS",31710260,"31710260",3,7),
  (679,"Nullam lobortis quam a felis ullamcorper viverra. Maecenas","2009-06-16","expense","ARS",85049991,"85049991",2,13),
  (680,"ridiculus mus. Proin vel","2021-01-29","income","ARS",66139607,"66139607",1,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (681,"eu augue porttitor interdum. Sed auctor odio a purus.","2021-11-15","income","ARS",64121201,"64121201",3,10),
  (682,"feugiat. Sed nec metus facilisis lorem tristique aliquet. Phasellus fermentum","2020-06-09","income","ARS",87614950,"87614950",1,9),
  (683,"nec quam. Curabitur vel lectus. Cum sociis natoque","2020-03-05","expense","ARS",73873209,"73873209",4,4),
  (684,"auctor, nunc nulla vulputate dui, nec tempus mauris erat eget","2020-05-08","expense","ARS",10255401,"10255401",2,12),
  (685,"a feugiat tellus lorem eu metus. In lorem. Donec elementum,","2017-04-05","expense","ARS",80022449,"80022449",3,12),
  (686,"odio semper cursus. Integer mollis. Integer tincidunt aliquam","2009-04-29","expense","ARS",35934348,"35934348",4,7),
  (687,"posuere vulputate, lacus. Cras interdum. Nunc sollicitudin commodo","2020-10-06","expense","ARS",54979660,"54979660",2,12),
  (688,"mollis vitae, posuere at, velit. Cras lorem lorem, luctus","2007-08-01","income","ARS",52873079,"52873079",4,6),
  (689,"vestibulum, neque sed dictum eleifend, nunc","2021-06-14","expense","ARS",58355584,"58355584",3,11),
  (690,"ligula elit, pretium et, rutrum non,","2014-06-20","income","ARS",53011486,"53011486",5,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (691,"aliquet vel, vulputate eu, odio. Phasellus at","2022-02-24","income","ARS",61609426,"61609426",2,4),
  (692,"enim. Curabitur massa. Vestibulum accumsan","2007-08-24","income","ARS",88591766,"88591766",2,8),
  (693,"est. Nunc ullamcorper, velit in aliquet lobortis, nisi nibh","2020-08-05","income","ARS",42379696,"42379696",4,2),
  (694,"justo nec ante. Maecenas mi felis, adipiscing fringilla,","2011-01-17","income","ARS",14215893,"14215893",2,3),
  (695,"Mauris vel turpis. Aliquam adipiscing lobortis risus. In mi","2011-11-21","income","ARS",60928942,"60928942",1,3),
  (696,"sem egestas blandit. Nam nulla","2019-03-20","expense","ARS",61616713,"61616713",4,2),
  (697,"congue turpis. In condimentum. Donec at arcu. Vestibulum ante ipsum","2019-04-07","income","ARS",14117727,"14117727",4,8),
  (698,"Praesent luctus. Curabitur egestas nunc sed libero. Proin","2016-11-16","expense","ARS",3208955,"3208955",4,10),
  (699,"ultrices. Vivamus rhoncus. Donec est. Nunc ullamcorper, velit in aliquet","2012-09-26","expense","ARS",65958153,"65958153",2,4),
  (700,"Morbi quis urna. Nunc quis arcu vel quam","2011-11-02","income","ARS",29645555,"29645555",5,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (701,"erat eget ipsum. Suspendisse sagittis. Nullam vitae diam.","2013-10-29","expense","ARS",63935625,"63935625",2,11),
  (702,"Donec tempus, lorem fringilla ornare placerat,","2013-12-11","expense","ARS",96973844,"96973844",1,10),
  (703,"dui. Cum sociis natoque","2015-04-26","expense","ARS",84000109,"84000109",3,5),
  (704,"Sed diam lorem, auctor quis, tristique ac, eleifend vitae,","2008-12-17","income","ARS",28126201,"28126201",1,5),
  (705,"molestie sodales. Mauris blandit enim consequat purus.","2019-03-01","expense","ARS",10466841,"10466841",2,7),
  (706,"aliquam eu, accumsan sed, facilisis vitae, orci. Phasellus dapibus","2006-11-17","expense","ARS",94881784,"94881784",3,3),
  (707,"metus sit amet ante. Vivamus non lorem","2018-10-21","expense","ARS",18619014,"18619014",3,7),
  (708,"enim. Curabitur massa. Vestibulum accumsan neque et","2018-01-16","expense","ARS",7819027,"7819027",4,7),
  (709,"rutrum eu, ultrices sit amet, risus. Donec nibh","2018-12-14","income","ARS",82897783,"82897783",3,8),
  (710,"et ultrices posuere cubilia Curae Donec tincidunt.","2018-04-01","expense","ARS",82458820,"82458820",1,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (711,"In nec orci. Donec nibh. Quisque nonummy ipsum non arcu.","2012-10-09","expense","ARS",5576201,"5576201",2,13),
  (712,"vel turpis. Aliquam adipiscing lobortis risus.","2021-02-12","expense","ARS",17957123,"17957123",3,10),
  (713,"eget varius ultrices, mauris","2014-10-17","income","ARS",77128994,"77128994",5,12),
  (714,"magna. Duis dignissim tempor","2019-07-14","expense","ARS",879100,"879100",2,4),
  (715,"nascetur ridiculus mus. Proin vel arcu","2013-09-06","income","ARS",45414223,"45414223",5,8),
  (716,"Cras vehicula aliquet libero. Integer in","2009-01-13","income","ARS",34732148,"34732148",4,4),
  (717,"ac metus vitae velit egestas lacinia. Sed","2016-05-27","expense","ARS",13877838,"13877838",2,10),
  (718,"eu enim. Etiam imperdiet dictum","2007-03-29","expense","ARS",21337868,"21337868",4,8),
  (719,"ac urna. Ut tincidunt vehicula risus.","2006-06-26","expense","ARS",6781986,"6781986",5,7),
  (720,"Vivamus non lorem vitae","2008-02-11","expense","ARS",35215295,"35215295",3,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (721,"consectetuer mauris id sapien. Cras dolor dolor, tempus","2016-03-02","income","ARS",51590508,"51590508",2,12),
  (722,"Morbi sit amet massa. Quisque","2022-05-31","income","ARS",1553112,"1553112",2,3),
  (723,"id enim. Curabitur massa. Vestibulum","2011-03-07","expense","ARS",66696015,"66696015",1,2),
  (724,"Pellentesque ut ipsum ac mi eleifend egestas. Sed","2013-05-14","expense","ARS",78976560,"78976560",5,4),
  (725,"vitae risus. Duis a mi fringilla mi lacinia mattis.","2017-01-12","income","ARS",57963129,"57963129",3,1),
  (726,"malesuada vel, venenatis vel, faucibus id, libero. Donec consectetuer","2010-06-13","expense","ARS",27814854,"27814854",3,11),
  (727,"sodales nisi magna sed dui. Fusce aliquam,","2006-09-18","income","ARS",77947822,"77947822",4,1),
  (728,"auctor. Mauris vel turpis. Aliquam adipiscing","2008-09-05","income","ARS",43394933,"43394933",4,9),
  (729,"mauris blandit mattis. Cras eget nisi dictum augue malesuada malesuada.","2005-10-12","expense","ARS",21922266,"21922266",2,2),
  (730,"Proin ultrices. Duis volutpat","2019-10-10","expense","ARS",87011571,"87011571",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (731,"odio. Etiam ligula tortor,","2012-10-19","income","ARS",54930956,"54930956",4,2),
  (732,"Proin dolor. Nulla semper tellus id nunc interdum feugiat.","2011-06-18","expense","ARS",44514156,"44514156",2,2),
  (733,"risus a ultricies adipiscing, enim mi tempor","2021-12-05","expense","ARS",90431482,"90431482",3,4),
  (734,"lectus. Cum sociis natoque penatibus et magnis","2010-05-18","expense","ARS",41338742,"41338742",4,1),
  (735,"non, sollicitudin a, malesuada id, erat. Etiam vestibulum massa rutrum","2008-06-01","income","ARS",5954827,"5954827",2,12),
  (736,"lorem, eget mollis lectus","2016-04-27","income","ARS",47496682,"47496682",3,4),
  (737,"ut, pellentesque eget, dictum placerat, augue. Sed","2012-09-09","expense","ARS",19626361,"19626361",5,7),
  (738,"non, vestibulum nec, euismod in,","2020-11-17","expense","ARS",38370810,"38370810",5,9),
  (739,"ornare, facilisis eget, ipsum. Donec","2009-10-08","income","ARS",10476585,"10476585",2,8),
  (740,"ante. Maecenas mi felis,","2005-03-21","income","ARS",53874385,"53874385",3,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (741,"lorem lorem, luctus ut, pellentesque","2019-04-07","income","ARS",39123241,"39123241",2,8),
  (742,"diam at pretium aliquet, metus urna convallis erat, eget","2012-06-19","income","ARS",49688420,"49688420",4,5),
  (743,"urna. Vivamus molestie dapibus ligula. Aliquam erat volutpat.","2006-02-04","expense","ARS",81929289,"81929289",2,12),
  (744,"purus sapien, gravida non, sollicitudin a, malesuada id,","2005-08-10","expense","ARS",52627741,"52627741",3,4),
  (745,"Sed pharetra, felis eget varius ultrices, mauris","2006-05-10","income","ARS",36707831,"36707831",2,12),
  (746,"nec ligula consectetuer rhoncus. Nullam","2006-03-08","income","ARS",5484954,"5484954",4,8),
  (747,"tempus non, lacinia at, iaculis quis,","2008-12-17","expense","ARS",41646306,"41646306",2,2),
  (748,"massa. Mauris vestibulum, neque sed dictum eleifend, nunc","2010-04-23","income","ARS",42840433,"42840433",5,8),
  (749,"et, magna. Praesent interdum ligula eu enim.","2021-05-06","income","ARS",1260800,"1260800",4,13),
  (750,"vitae odio sagittis semper. Nam tempor","2008-03-26","expense","ARS",16992607,"16992607",5,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (751,"urna, nec luctus felis","2009-09-19","income","ARS",33230578,"33230578",2,7),
  (752,"dolor elit, pellentesque a, facilisis","2022-02-26","income","ARS",10594027,"10594027",2,5),
  (753,"consequat dolor vitae dolor. Donec fringilla. Donec","2012-01-22","income","ARS",52724970,"52724970",2,11),
  (754,"ut odio vel est tempor bibendum.","2014-04-13","expense","ARS",63331665,"63331665",3,7),
  (755,"faucibus. Morbi vehicula. Pellentesque tincidunt tempus risus.","2021-03-13","income","ARS",99456067,"99456067",1,8),
  (756,"amet ante. Vivamus non lorem vitae odio","2010-10-18","income","ARS",98827099,"98827099",2,1),
  (757,"orci luctus et ultrices posuere cubilia Curae","2019-02-16","expense","ARS",5423906,"5423906",5,12),
  (758,"pharetra, felis eget varius ultrices, mauris ipsum porta elit,","2020-10-01","expense","ARS",40113654,"40113654",3,9),
  (759,"quam a felis ullamcorper viverra.","2021-11-12","expense","ARS",68752459,"68752459",2,4),
  (760,"feugiat. Lorem ipsum dolor sit amet, consectetuer","2018-07-21","expense","ARS",60307405,"60307405",2,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (761,"ac tellus. Suspendisse sed dolor. Fusce mi lorem,","2010-05-19","expense","ARS",63305188,"63305188",3,8),
  (762,"id, libero. Donec consectetuer mauris id","2011-02-28","expense","ARS",17826489,"17826489",1,4),
  (763,"lacinia. Sed congue, elit sed consequat auctor,","2022-05-21","expense","ARS",95232262,"95232262",4,8),
  (764,"est. Mauris eu turpis.","2013-06-15","income","ARS",76736713,"76736713",2,10),
  (765,"auctor, nunc nulla vulputate dui,","2011-10-15","income","ARS",13497331,"13497331",3,6),
  (766,"Praesent luctus. Curabitur egestas nunc sed libero. Proin","2019-05-06","income","ARS",28819770,"28819770",3,6),
  (767,"Vestibulum ante ipsum primis in faucibus orci luctus","2015-03-01","expense","ARS",14607380,"14607380",3,2),
  (768,"lectus ante dictum mi, ac mattis velit","2019-09-22","income","ARS",10908871,"10908871",5,9),
  (769,"ante dictum cursus. Nunc mauris elit, dictum","2005-12-21","expense","ARS",57430698,"57430698",3,3),
  (770,"Cras lorem lorem, luctus","2012-06-03","expense","ARS",50355774,"50355774",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (771,"sagittis augue, eu tempor erat neque non","2015-05-15","income","ARS",83424017,"83424017",4,11),
  (772,"enim nec tempus scelerisque, lorem ipsum sodales","2022-02-16","income","ARS",82267436,"82267436",5,4),
  (773,"egestas. Fusce aliquet magna a neque. Nullam","2020-12-17","expense","ARS",75296747,"75296747",2,2),
  (774,"posuere cubilia Curae Donec tincidunt. Donec vitae erat vel","2013-06-28","expense","ARS",24529095,"24529095",5,7),
  (775,"Sed pharetra, felis eget varius ultrices, mauris","2008-03-10","income","ARS",65119014,"65119014",2,10),
  (776,"vehicula et, rutrum eu, ultrices sit amet, risus. Donec nibh","2015-05-07","expense","ARS",34207562,"34207562",1,10),
  (777,"eu enim. Etiam imperdiet dictum magna. Ut tincidunt orci","2018-04-13","income","ARS",19527098,"19527098",1,9),
  (778,"Lorem ipsum dolor sit amet, consectetuer","2006-09-20","expense","ARS",17317298,"17317298",2,3),
  (779,"metus facilisis lorem tristique aliquet.","2013-10-05","income","ARS",591117,"591117",2,1),
  (780,"dolor. Quisque tincidunt pede ac urna.","2016-08-18","expense","ARS",81392185,"81392185",3,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (781,"dolor. Donec fringilla. Donec feugiat metus sit amet","2007-05-15","income","ARS",92298514,"92298514",1,5),
  (782,"arcu vel quam dignissim pharetra.","2016-09-21","income","ARS",55209223,"55209223",5,6),
  (783,"ultricies ligula. Nullam enim. Sed","2015-03-26","expense","ARS",49917583,"49917583",4,8),
  (784,"congue, elit sed consequat","2014-03-31","income","ARS",30342812,"30342812",2,11),
  (785,"vel nisl. Quisque fringilla euismod enim. Etiam gravida molestie arcu.","2011-12-22","income","ARS",63387078,"63387078",1,11),
  (786,"quis lectus. Nullam suscipit, est ac facilisis facilisis,","2021-09-30","income","ARS",40699370,"40699370",1,11),
  (787,"a, malesuada id, erat. Etiam vestibulum massa rutrum magna.","2015-02-05","income","ARS",92359808,"92359808",1,10),
  (788,"tincidunt orci quis lectus. Nullam suscipit, est ac","2012-09-26","expense","ARS",4972245,"4972245",3,9),
  (789,"quis, tristique ac, eleifend","2015-03-28","income","ARS",59975700,"59975700",4,1),
  (790,"Nullam enim. Sed nulla","2022-01-29","income","ARS",31077865,"31077865",1,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (791,"nunc interdum feugiat. Sed","2010-05-22","expense","ARS",27286170,"27286170",2,10),
  (792,"quis urna. Nunc quis arcu vel quam dignissim pharetra.","2008-12-16","expense","ARS",33045832,"33045832",4,1),
  (793,"commodo auctor velit. Aliquam nisl. Nulla","2020-05-10","expense","ARS",2000835,"2000835",5,11),
  (794,"ante dictum mi, ac mattis velit justo nec","2022-03-25","income","ARS",15701911,"15701911",3,3),
  (795,"sed dictum eleifend, nunc","2011-12-14","expense","ARS",35893533,"35893533",4,5),
  (796,"congue, elit sed consequat","2006-02-11","income","ARS",37133791,"37133791",4,5),
  (797,"sed dui. Fusce aliquam, enim nec tempus scelerisque, lorem","2013-01-06","income","ARS",59297812,"59297812",4,9),
  (798,"Donec tincidunt. Donec vitae erat vel pede blandit","2006-04-25","expense","ARS",58467004,"58467004",4,1),
  (799,"Nulla aliquet. Proin velit. Sed malesuada augue ut lacus.","2015-10-29","income","ARS",24751992,"24751992",4,11),
  (800,"et, magna. Praesent interdum ligula eu enim. Etiam","2018-07-15","income","ARS",68974982,"68974982",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (801,"semper. Nam tempor diam dictum sapien. Aenean","2021-12-16","income","ARS",46071348,"46071348",2,8),
  (802,"dictum cursus. Nunc mauris elit, dictum eu, eleifend nec,","2008-02-17","expense","ARS",35536849,"35536849",3,4),
  (803,"risus. Donec nibh enim, gravida sit amet, dapibus id,","2010-07-31","expense","ARS",42157061,"42157061",4,5),
  (804,"nonummy ultricies ornare, elit elit fermentum risus, at fringilla purus","2009-08-21","income","ARS",21641735,"21641735",1,13),
  (805,"eu metus. In lorem. Donec elementum,","2012-10-23","expense","ARS",77001969,"77001969",3,6),
  (806,"orci. Donec nibh. Quisque nonummy ipsum non arcu. Vivamus sit","2021-06-11","expense","ARS",34051336,"34051336",5,5),
  (807,"ipsum cursus vestibulum. Mauris magna. Duis dignissim tempor arcu. Vestibulum","2011-10-04","income","ARS",83733231,"83733231",4,4),
  (808,"gravida sagittis. Duis gravida. Praesent eu nulla at sem","2017-11-24","income","ARS",6224452,"6224452",3,6),
  (809,"ut, pellentesque eget, dictum placerat,","2006-12-17","income","ARS",70860302,"70860302",3,10),
  (810,"Curabitur massa. Vestibulum accumsan neque et","2007-05-10","expense","ARS",4471879,"4471879",4,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (811,"et netus et malesuada fames","2018-09-11","expense","ARS",50327687,"50327687",5,8),
  (812,"quis turpis vitae purus gravida sagittis.","2020-07-15","expense","ARS",20806301,"20806301",4,5),
  (813,"pede. Praesent eu dui.","2019-11-11","expense","ARS",83716708,"83716708",4,9),
  (814,"eleifend vitae, erat. Vivamus nisi.","2006-05-08","income","ARS",10936889,"10936889",5,7),
  (815,"Quisque varius. Nam porttitor scelerisque neque. Nullam","2018-12-25","income","ARS",52061373,"52061373",3,5),
  (816,"Nam tempor diam dictum sapien. Aenean","2019-02-14","income","ARS",50906827,"50906827",2,13),
  (817,"ligula. Donec luctus aliquet odio. Etiam ligula","2007-06-21","expense","ARS",89607900,"89607900",2,2),
  (818,"nunc. Quisque ornare tortor at risus. Nunc ac sem ut","2008-03-26","income","ARS",60675698,"60675698",5,5),
  (819,"nec ante blandit viverra. Donec tempus, lorem fringilla","2008-11-22","income","ARS",15603216,"15603216",1,3),
  (820,"nunc sit amet metus. Aliquam erat volutpat.","2021-09-08","income","ARS",7735282,"7735282",3,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (821,"feugiat non, lobortis quis, pede. Suspendisse dui.","2011-02-22","income","ARS",67894995,"67894995",3,10),
  (822,"scelerisque neque. Nullam nisl. Maecenas","2015-06-06","income","ARS",25156529,"25156529",4,11),
  (823,"cursus non, egestas a, dui. Cras","2017-03-13","expense","ARS",74504751,"74504751",2,8),
  (824,"nisl. Nulla eu neque pellentesque massa lobortis ultrices. Vivamus rhoncus.","2008-06-08","expense","ARS",40197428,"40197428",5,6),
  (825,"In lorem. Donec elementum, lorem","2007-08-04","expense","ARS",7443078,"7443078",1,12),
  (826,"egestas. Duis ac arcu. Nunc","2005-12-03","income","ARS",78154938,"78154938",5,10),
  (827,"semper cursus. Integer mollis. Integer","2011-05-11","income","ARS",34765455,"34765455",3,6),
  (828,"scelerisque scelerisque dui. Suspendisse ac metus vitae velit egestas","2007-05-10","income","ARS",44529193,"44529193",2,9),
  (829,"elit, dictum eu, eleifend nec, malesuada ut, sem.","2022-03-15","income","ARS",51377017,"51377017",3,13),
  (830,"In faucibus. Morbi vehicula. Pellentesque","2007-04-09","expense","ARS",65752124,"65752124",2,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (831,"leo. Cras vehicula aliquet libero. Integer in magna. Phasellus","2005-02-05","income","ARS",7977591,"7977591",5,6),
  (832,"Integer mollis. Integer tincidunt aliquam arcu. Aliquam ultrices","2011-04-14","expense","ARS",62017822,"62017822",3,2),
  (833,"penatibus et magnis dis","2011-12-14","income","ARS",57469431,"57469431",3,5),
  (834,"mauris, rhoncus id, mollis nec,","2007-06-18","expense","ARS",97699716,"97699716",2,11),
  (835,"dolor. Fusce feugiat. Lorem ipsum dolor sit","2011-03-23","expense","ARS",20276965,"20276965",2,10),
  (836,"sociosqu ad litora torquent per conubia nostra, per inceptos","2014-04-01","expense","ARS",28987824,"28987824",1,9),
  (837,"posuere, enim nisl elementum","2020-12-06","expense","ARS",93530442,"93530442",3,3),
  (838,"mollis vitae, posuere at, velit. Cras","2008-09-04","expense","ARS",27944909,"27944909",4,1),
  (839,"auctor ullamcorper, nisl arcu iaculis enim, sit amet","2005-08-05","income","ARS",8002320,"8002320",4,2),
  (840,"aliquam arcu. Aliquam ultrices iaculis odio.","2011-12-30","income","ARS",34901064,"34901064",3,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (841,"aliquam, enim nec tempus scelerisque,","2012-10-06","income","ARS",90927815,"90927815",4,2),
  (842,"diam luctus lobortis. Class aptent taciti sociosqu ad","2007-03-24","income","ARS",34589120,"34589120",3,3),
  (843,"mauris erat eget ipsum. Suspendisse sagittis. Nullam","2012-02-05","expense","ARS",54948413,"54948413",3,3),
  (844,"tincidunt tempus risus. Donec egestas. Duis ac arcu. Nunc","2010-11-28","income","ARS",1262279,"1262279",1,11),
  (845,"turpis. In condimentum. Donec at","2007-12-26","expense","ARS",70601091,"70601091",2,1),
  (846,"Integer vitae nibh. Donec est","2021-06-20","expense","ARS",41538435,"41538435",1,3),
  (847,"imperdiet dictum magna. Ut tincidunt orci quis lectus. Nullam suscipit,","2009-11-20","expense","ARS",9483643,"9483643",2,11),
  (848,"Sed nulla ante, iaculis nec,","2007-01-07","expense","ARS",21307116,"21307116",1,12),
  (849,"non massa non ante bibendum ullamcorper. Duis cursus,","2019-10-24","income","ARS",80348827,"80348827",4,6),
  (850,"ut quam vel sapien imperdiet ornare. In","2013-07-17","income","ARS",17681537,"17681537",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (851,"Morbi vehicula. Pellentesque tincidunt tempus risus.","2008-10-25","expense","ARS",95106773,"95106773",2,6),
  (852,"non massa non ante bibendum","2019-11-19","expense","ARS",65835646,"65835646",4,10),
  (853,"lorem fringilla ornare placerat,","2013-03-25","expense","ARS",53336142,"53336142",5,11),
  (854,"sit amet ornare lectus justo eu arcu. Morbi sit amet","2017-03-04","expense","ARS",11435675,"11435675",5,4),
  (855,"laoreet posuere, enim nisl elementum purus, accumsan","2006-07-01","expense","ARS",23733076,"23733076",4,7),
  (856,"Nullam vitae diam. Proin dolor. Nulla semper tellus","2017-08-30","expense","ARS",17325864,"17325864",4,3),
  (857,"dictum eu, placerat eget, venenatis","2005-12-22","income","ARS",453133,"453133",1,6),
  (858,"nec ante blandit viverra. Donec","2016-02-08","income","ARS",7568796,"7568796",3,5),
  (859,"ligula eu enim. Etiam","2009-09-21","expense","ARS",62311894,"62311894",5,5),
  (860,"adipiscing fringilla, porttitor vulputate, posuere","2018-07-24","income","ARS",46998544,"46998544",3,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (861,"lacus vestibulum lorem, sit amet","2018-05-01","expense","ARS",62559224,"62559224",2,7),
  (862,"et ultrices posuere cubilia Curae Phasellus ornare.","2005-11-30","income","ARS",93761923,"93761923",1,8),
  (863,"laoreet posuere, enim nisl elementum purus, accumsan interdum libero dui","2012-10-07","income","ARS",61293412,"61293412",3,11),
  (864,"est, vitae sodales nisi magna sed dui. Fusce","2017-02-05","expense","ARS",74721017,"74721017",5,13),
  (865,"ante dictum cursus. Nunc mauris elit,","2020-09-26","expense","ARS",31040029,"31040029",4,3),
  (866,"Sed malesuada augue ut lacus. Nulla tincidunt, neque vitae","2013-06-24","expense","ARS",84594585,"84594585",5,5),
  (867,"posuere cubilia Curae Donec tincidunt. Donec vitae","2011-10-10","income","ARS",39661502,"39661502",5,5),
  (868,"Nulla eu neque pellentesque massa lobortis ultrices. Vivamus rhoncus. Donec","2014-10-11","expense","ARS",74951335,"74951335",2,2),
  (869,"Nunc sed orci lobortis augue scelerisque mollis.","2015-08-11","expense","ARS",97310382,"97310382",5,4),
  (870,"Cras convallis convallis dolor. Quisque tincidunt pede","2013-12-01","income","ARS",9948770,"9948770",3,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (871,"a nunc. In at pede.","2009-09-03","expense","ARS",11194992,"11194992",1,3),
  (872,"porta elit, a feugiat tellus","2015-10-24","expense","ARS",17751747,"17751747",3,8),
  (873,"eu neque pellentesque massa lobortis ultrices. Vivamus rhoncus.","2021-11-07","income","ARS",60503402,"60503402",5,4),
  (874,"erat volutpat. Nulla facilisis. Suspendisse commodo tincidunt nibh.","2013-05-05","expense","ARS",34745639,"34745639",2,6),
  (875,"orci lobortis augue scelerisque mollis. Phasellus","2020-06-27","income","ARS",36557294,"36557294",1,9),
  (876,"Nunc ullamcorper, velit in aliquet lobortis, nisi","2012-01-11","income","ARS",18922454,"18922454",5,1),
  (877,"ultricies adipiscing, enim mi tempor lorem, eget","2021-10-22","expense","ARS",88980454,"88980454",2,12),
  (878,"ac risus. Morbi metus. Vivamus euismod urna.","2020-09-07","expense","ARS",27222022,"27222022",5,3),
  (879,"placerat eget, venenatis a, magna. Lorem ipsum dolor sit","2016-05-13","expense","ARS",60779388,"60779388",4,9),
  (880,"Phasellus nulla. Integer vulputate, risus","2021-07-22","income","ARS",41542712,"41542712",5,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (881,"interdum. Sed auctor odio a","2021-06-14","income","ARS",91087013,"91087013",3,8),
  (882,"Morbi accumsan laoreet ipsum. Curabitur consequat, lectus sit amet luctus","2004-12-23","income","ARS",22420014,"22420014",4,2),
  (883,"eu, odio. Phasellus at augue","2007-10-15","expense","ARS",74464519,"74464519",5,13),
  (884,"molestie orci tincidunt adipiscing. Mauris molestie pharetra nibh. Aliquam ornare,","2018-05-11","expense","ARS",37928222,"37928222",3,10),
  (885,"Ut sagittis lobortis mauris. Suspendisse aliquet molestie tellus. Aenean egestas","2017-05-17","income","ARS",53477113,"53477113",5,12),
  (886,"Mauris vestibulum, neque sed dictum eleifend, nunc","2012-01-05","income","ARS",99978921,"99978921",3,3),
  (887,"arcu iaculis enim, sit amet ornare lectus justo eu","2021-01-14","expense","ARS",29807483,"29807483",4,5),
  (888,"lobortis mauris. Suspendisse aliquet molestie tellus.","2022-04-16","expense","ARS",84817794,"84817794",4,4),
  (889,"enim nec tempus scelerisque, lorem ipsum sodales purus, in","2008-07-02","expense","ARS",80983751,"80983751",3,2),
  (890,"laoreet, libero et tristique pellentesque, tellus sem","2012-04-13","expense","ARS",40867311,"40867311",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (891,"vestibulum, neque sed dictum eleifend, nunc risus varius orci,","2021-11-04","expense","ARS",99264145,"99264145",4,2),
  (892,"Aenean eget magna. Suspendisse tristique neque venenatis lacus. Etiam","2010-09-10","expense","ARS",79585298,"79585298",4,6),
  (893,"Sed congue, elit sed consequat auctor, nunc nulla vulputate","2019-10-07","expense","ARS",12367890,"12367890",3,3),
  (894,"aliquet, metus urna convallis erat, eget tincidunt dui augue eu","2021-04-13","income","ARS",12203751,"12203751",2,2),
  (895,"vel, mauris. Integer sem elit, pharetra ut,","2015-02-17","income","ARS",14851446,"14851446",1,9),
  (896,"sociis natoque penatibus et","2011-09-23","income","ARS",9379576,"9379576",1,6),
  (897,"ut cursus luctus, ipsum leo elementum sem,","2008-02-03","expense","ARS",19484593,"19484593",4,7),
  (898,"malesuada fames ac turpis egestas.","2009-01-14","expense","ARS",82782196,"82782196",1,13),
  (899,"ante. Vivamus non lorem vitae odio sagittis semper.","2006-10-10","expense","ARS",91701316,"91701316",4,6),
  (900,"sagittis semper. Nam tempor diam dictum sapien. Aenean massa.","2018-02-15","income","ARS",72089668,"72089668",4,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (901,"vitae, posuere at, velit. Cras lorem","2007-09-23","income","ARS",46377885,"46377885",2,6),
  (902,"ligula tortor, dictum eu, placerat eget, venenatis a, magna.","2007-02-15","income","ARS",77192554,"77192554",1,8),
  (903,"Suspendisse tristique neque venenatis lacus. Etiam","2022-05-10","expense","ARS",4845841,"4845841",1,7),
  (904,"venenatis lacus. Etiam bibendum fermentum metus. Aenean","2006-10-14","expense","ARS",85323606,"85323606",4,10),
  (905,"est mauris, rhoncus id, mollis nec,","2008-05-31","expense","ARS",1828332,"1828332",4,4),
  (906,"Duis a mi fringilla mi lacinia mattis. Integer eu","2004-12-19","expense","ARS",4626670,"4626670",3,6),
  (907,"dignissim lacus. Aliquam rutrum","2017-12-26","expense","ARS",3021019,"3021019",3,7),
  (908,"ipsum. Suspendisse non leo. Vivamus nibh","2010-09-14","expense","ARS",96732309,"96732309",3,3),
  (909,"parturient montes, nascetur ridiculus mus. Donec dignissim magna a","2006-12-10","expense","ARS",8076551,"8076551",2,7),
  (910,"posuere cubilia Curae Phasellus ornare. Fusce mollis. Duis","2005-11-30","income","ARS",93739962,"93739962",2,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (911,"malesuada vel, venenatis vel, faucibus id, libero.","2005-10-28","income","ARS",86673572,"86673572",4,3),
  (912,"tempor augue ac ipsum. Phasellus vitae mauris sit amet","2020-03-30","expense","ARS",67714296,"67714296",1,7),
  (913,"ante dictum cursus. Nunc mauris elit, dictum","2012-07-01","income","ARS",44088399,"44088399",3,10),
  (914,"placerat eget, venenatis a, magna.","2012-06-28","income","ARS",63838652,"63838652",4,8),
  (915,"nibh. Quisque nonummy ipsum","2014-05-14","income","ARS",35850907,"35850907",3,1),
  (916,"augue malesuada malesuada. Integer id magna et ipsum","2010-02-28","expense","ARS",59839180,"59839180",5,8),
  (917,"sit amet orci. Ut sagittis","2015-04-25","expense","ARS",2801147,"2801147",4,6),
  (918,"Fusce fermentum fermentum arcu. Vestibulum ante ipsum","2021-01-16","expense","ARS",29253319,"29253319",1,9),
  (919,"ipsum. Suspendisse non leo. Vivamus nibh dolor, nonummy ac,","2011-07-31","expense","ARS",2941699,"2941699",4,12),
  (920,"malesuada ut, sem. Nulla interdum.","2020-06-05","income","ARS",95911825,"95911825",4,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (921,"eu lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit","2016-04-01","expense","ARS",68033405,"68033405",4,9),
  (922,"dui, nec tempus mauris erat","2019-02-03","income","ARS",75596415,"75596415",5,4),
  (923,"scelerisque scelerisque dui. Suspendisse ac metus vitae velit egestas lacinia.","2012-11-10","income","ARS",24165635,"24165635",3,7),
  (924,"congue turpis. In condimentum. Donec at arcu. Vestibulum ante","2009-10-24","income","ARS",73673276,"73673276",3,3),
  (925,"neque. Nullam nisl. Maecenas malesuada fringilla","2007-09-11","income","ARS",24216344,"24216344",2,1),
  (926,"leo elementum sem, vitae","2012-12-29","income","ARS",93893714,"93893714",2,12),
  (927,"nonummy ac, feugiat non, lobortis quis, pede. Suspendisse","2017-05-18","income","ARS",50768306,"50768306",3,6),
  (928,"at pretium aliquet, metus urna convallis","2009-12-29","income","ARS",85721103,"85721103",4,7),
  (929,"id risus quis diam","2010-05-20","income","ARS",37746617,"37746617",2,8),
  (930,"eu odio tristique pharetra. Quisque ac libero nec","2008-08-14","expense","ARS",75802486,"75802486",3,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (931,"arcu iaculis enim, sit","2012-04-14","expense","ARS",29144376,"29144376",3,12),
  (932,"eget odio. Aliquam vulputate ullamcorper magna. Sed eu eros. Nam","2019-08-19","income","ARS",66419130,"66419130",5,6),
  (933,"Etiam imperdiet dictum magna. Ut tincidunt","2012-11-07","income","ARS",75894605,"75894605",4,12),
  (934,"purus gravida sagittis. Duis gravida. Praesent eu nulla","2005-09-17","income","ARS",58411976,"58411976",3,6),
  (935,"nunc sed pede. Cum sociis natoque penatibus et magnis dis","2006-03-11","income","ARS",36065328,"36065328",1,12),
  (936,"Class aptent taciti sociosqu ad litora torquent","2016-04-15","expense","ARS",53989943,"53989943",4,3),
  (937,"pharetra nibh. Aliquam ornare, libero at auctor ullamcorper,","2012-06-08","expense","ARS",13080859,"13080859",2,11),
  (938,"egestas blandit. Nam nulla magna, malesuada vel, convallis","2014-04-10","expense","ARS",97337823,"97337823",4,5),
  (939,"sodales. Mauris blandit enim consequat purus. Maecenas libero","2012-11-19","income","ARS",12112098,"12112098",3,6),
  (940,"lobortis. Class aptent taciti sociosqu ad litora","2019-08-01","expense","ARS",95195430,"95195430",4,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (941,"Aliquam vulputate ullamcorper magna. Sed eu eros. Nam","2007-10-20","income","ARS",33995098,"33995098",5,6),
  (942,"purus mauris a nunc. In at","2020-03-12","expense","ARS",6331049,"6331049",4,2),
  (943,"malesuada augue ut lacus. Nulla tincidunt,","2005-04-21","expense","ARS",1196262,"1196262",4,11),
  (944,"Nulla eget metus eu erat semper rutrum. Fusce dolor quam,","2016-02-05","income","ARS",15804209,"15804209",2,8),
  (945,"Suspendisse tristique neque venenatis lacus. Etiam","2019-10-22","income","ARS",11138518,"11138518",1,2),
  (946,"adipiscing. Mauris molestie pharetra","2020-04-10","expense","ARS",37817036,"37817036",4,9),
  (947,"semper egestas, urna justo faucibus lectus, a sollicitudin","2013-11-05","income","ARS",5429667,"5429667",3,4),
  (948,"libero lacus, varius et, euismod et,","2017-10-03","income","ARS",76083055,"76083055",3,2),
  (949,"aliquet nec, imperdiet nec, leo. Morbi neque tellus, imperdiet non,","2010-02-17","income","ARS",42083710,"42083710",2,5),
  (950,"sit amet massa. Quisque porttitor eros nec","2021-04-20","expense","ARS",64448016,"64448016",4,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (951,"erat vitae risus. Duis a mi fringilla","2014-08-19","income","ARS",12917759,"12917759",1,5),
  (952,"mauris elit, dictum eu, eleifend","2016-11-12","income","ARS",14120213,"14120213",4,7),
  (953,"sit amet, dapibus id, blandit at, nisi. Cum sociis","2009-01-03","income","ARS",89362060,"89362060",1,5),
  (954,"imperdiet dictum magna. Ut tincidunt orci quis","2011-12-04","expense","ARS",34616374,"34616374",4,3),
  (955,"Aliquam erat volutpat. Nulla dignissim. Maecenas ornare egestas","2011-12-22","expense","ARS",61015383,"61015383",3,10),
  (956,"penatibus et magnis dis parturient montes, nascetur ridiculus mus.","2018-02-17","income","ARS",83452523,"83452523",4,7),
  (957,"fringilla cursus purus. Nullam scelerisque neque sed","2008-12-29","income","ARS",14591067,"14591067",4,11),
  (958,"sagittis lobortis mauris. Suspendisse aliquet molestie tellus. Aenean","2015-08-18","income","ARS",93792480,"93792480",4,7),
  (959,"tempus eu, ligula. Aenean euismod mauris eu","2015-08-07","income","ARS",67099256,"67099256",1,4),
  (960,"nec tempus scelerisque, lorem","2008-01-12","income","ARS",22510758,"22510758",5,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (961,"primis in faucibus orci luctus et ultrices posuere cubilia","2016-03-12","expense","ARS",90200070,"90200070",1,4),
  (962,"tempor erat neque non quam.","2017-05-12","income","ARS",22587023,"22587023",4,2),
  (963,"tellus non magna. Nam","2021-05-03","income","ARS",60123121,"60123121",1,5),
  (964,"mollis vitae, posuere at, velit.","2013-11-26","expense","ARS",5214272,"5214272",3,4),
  (965,"quis diam. Pellentesque habitant morbi tristique senectus","2005-04-18","expense","ARS",94934299,"94934299",3,10),
  (966,"Nunc quis arcu vel quam dignissim","2014-05-28","expense","ARS",72157717,"72157717",3,11),
  (967,"Nunc ullamcorper, velit in aliquet lobortis, nisi nibh lacinia","2014-12-12","expense","ARS",91848767,"91848767",5,5),
  (968,"lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit","2017-07-29","income","ARS",25685747,"25685747",3,3),
  (969,"penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin","2006-07-26","expense","ARS",42526348,"42526348",4,5),
  (970,"eget massa. Suspendisse eleifend. Cras sed leo. Cras vehicula","2008-06-20","income","ARS",74029504,"74029504",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (971,"mauris elit, dictum eu,","2012-06-12","expense","ARS",2159542,"2159542",2,5),
  (972,"faucibus leo, in lobortis tellus","2013-10-05","expense","ARS",13826642,"13826642",4,12),
  (973,"dui, nec tempus mauris erat eget ipsum. Suspendisse sagittis.","2017-05-18","income","ARS",90717525,"90717525",3,6),
  (974,"Cras dictum ultricies ligula. Nullam enim.","2018-08-31","expense","ARS",14477754,"14477754",3,10),
  (975,"ut cursus luctus, ipsum leo elementum sem, vitae","2010-08-07","income","ARS",81072416,"81072416",3,11),
  (976,"placerat velit. Quisque varius. Nam porttitor scelerisque neque.","2013-10-31","income","ARS",44212502,"44212502",5,8),
  (977,"amet, consectetuer adipiscing elit. Curabitur","2009-09-23","expense","ARS",98508901,"98508901",5,12),
  (978,"tortor nibh sit amet orci.","2019-06-01","income","ARS",69674967,"69674967",5,10),
  (979,"Donec est. Nunc ullamcorper, velit in aliquet lobortis, nisi","2005-06-10","income","ARS",99329002,"99329002",3,5),
  (980,"a, enim. Suspendisse aliquet,","2014-05-06","expense","ARS",56949731,"56949731",2,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (981,"Integer vitae nibh. Donec est mauris, rhoncus id,","2006-08-14","expense","ARS",65696887,"65696887",5,8),
  (982,"vel arcu eu odio tristique","2007-03-14","income","ARS",3087630,"3087630",3,3),
  (983,"dictum. Phasellus in felis. Nulla tempor augue ac ipsum.","2020-06-27","expense","ARS",24817300,"24817300",4,9),
  (984,"elementum, dui quis accumsan convallis, ante","2017-03-22","income","ARS",55349181,"55349181",4,9),
  (985,"metus. In lorem. Donec","2011-02-05","expense","ARS",47197536,"47197536",3,9),
  (986,"est ac mattis semper, dui lectus","2008-10-04","expense","ARS",31374015,"31374015",3,5),
  (987,"Curabitur consequat, lectus sit amet luctus vulputate,","2016-02-29","expense","ARS",98843839,"98843839",3,4),
  (988,"Sed molestie. Sed id risus quis diam luctus","2005-12-17","expense","ARS",73750044,"73750044",3,2),
  (989,"placerat velit. Quisque varius. Nam porttitor scelerisque neque. Nullam","2011-11-26","income","ARS",42957022,"42957022",1,7),
  (990,"Cras interdum. Nunc sollicitudin commodo ipsum. Suspendisse","2007-11-07","expense","ARS",75553076,"75553076",2,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (991,"dolor elit, pellentesque a, facilisis non,","2020-02-05","income","ARS",90436918,"90436918",5,3),
  (992,"semper auctor. Mauris vel turpis. Aliquam adipiscing lobortis","2008-04-15","expense","ARS",32968304,"32968304",4,11),
  (993,"vestibulum, neque sed dictum eleifend,","2011-07-14","expense","ARS",14669223,"14669223",4,12),
  (994,"auctor velit. Aliquam nisl. Nulla eu neque","2007-05-09","income","ARS",69361986,"69361986",5,2),
  (995,"sapien. Nunc pulvinar arcu et pede. Nunc sed orci lobortis","2014-08-18","income","ARS",94591145,"94591145",3,7),
  (996,"nec, diam. Duis mi enim,","2016-02-17","income","ARS",61931909,"61931909",1,11),
  (997,"ornare tortor at risus. Nunc ac sem ut","2020-08-12","income","ARS",83094753,"83094753",5,13),
  (998,"Aliquam tincidunt, nunc ac","2010-06-24","income","ARS",90352598,"90352598",4,10),
  (999,"nunc. In at pede. Cras vulputate velit eu sem.","2021-02-21","expense","ARS",96306831,"96306831",2,8),
  (1000,"mus. Proin vel arcu eu odio tristique pharetra. Quisque ac","2016-03-30","expense","ARS",43958888,"43958888",5,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1001,"Aenean sed pede nec ante blandit viverra. Donec","2005-06-11","income","ARS",56817364,"56817364",4,6),
  (1002,"sociis natoque penatibus et magnis dis parturient","2020-06-25","income","ARS",58433269,"58433269",3,8),
  (1003,"leo. Cras vehicula aliquet libero. Integer in magna.","2021-08-06","income","ARS",74313891,"74313891",2,8),
  (1004,"senectus et netus et","2017-05-13","income","ARS",74890457,"74890457",4,4),
  (1005,"ac turpis egestas. Aliquam fringilla cursus purus.","2016-09-13","income","ARS",88621867,"88621867",1,11),
  (1006,"ipsum porta elit, a feugiat tellus lorem eu","2009-07-05","income","ARS",81621993,"81621993",2,12),
  (1007,"mattis velit justo nec ante. Maecenas mi felis, adipiscing fringilla,","2011-02-08","income","ARS",81205464,"81205464",2,2),
  (1008,"mus. Proin vel arcu eu odio","2016-06-10","expense","ARS",59003333,"59003333",4,13),
  (1009,"aliquet. Proin velit. Sed malesuada augue ut lacus.","2011-12-31","income","ARS",34412875,"34412875",3,11),
  (1010,"purus gravida sagittis. Duis gravida. Praesent","2013-11-02","expense","ARS",81753323,"81753323",4,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1011,"facilisi. Sed neque. Sed eget lacus. Mauris non","2021-12-14","income","ARS",42616911,"42616911",2,12),
  (1012,"eros turpis non enim. Mauris quis turpis vitae","2017-02-28","expense","ARS",26297727,"26297727",3,8),
  (1013,"In tincidunt congue turpis. In","2004-10-12","income","ARS",21060596,"21060596",2,12),
  (1014,"risus odio, auctor vitae, aliquet nec, imperdiet nec, leo.","2015-01-02","expense","ARS",83804062,"83804062",1,10),
  (1015,"Aliquam erat volutpat. Nulla facilisis.","2004-12-19","income","ARS",48485581,"48485581",3,12),
  (1016,"amet, risus. Donec nibh enim, gravida sit","2008-08-20","expense","ARS",48706879,"48706879",4,2),
  (1017,"ipsum cursus vestibulum. Mauris magna. Duis dignissim tempor","2017-07-09","income","ARS",51737397,"51737397",3,3),
  (1018,"consectetuer ipsum nunc id enim. Curabitur","2011-03-05","income","ARS",43865423,"43865423",2,3),
  (1019,"neque vitae semper egestas,","2018-11-05","income","ARS",60348132,"60348132",2,10),
  (1020,"interdum ligula eu enim. Etiam imperdiet dictum magna. Ut","2015-02-12","income","ARS",76171765,"76171765",4,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1021,"Nunc sed orci lobortis augue scelerisque","2009-11-09","expense","ARS",35348773,"35348773",2,11),
  (1022,"orci, in consequat enim diam","2012-01-25","income","ARS",59897820,"59897820",3,3),
  (1023,"felis orci, adipiscing non, luctus sit amet, faucibus ut,","2017-09-01","expense","ARS",11272086,"11272086",2,9),
  (1024,"cursus vestibulum. Mauris magna. Duis dignissim","2019-07-12","expense","ARS",21930221,"21930221",2,2),
  (1025,"mollis nec, cursus a, enim. Suspendisse aliquet, sem ut","2017-04-21","expense","ARS",23678886,"23678886",1,10),
  (1026,"sem semper erat, in consectetuer","2014-12-28","expense","ARS",29862318,"29862318",2,10),
  (1027,"elit. Aliquam auctor, velit eget","2007-01-05","expense","ARS",66997534,"66997534",5,13),
  (1028,"Cras eu tellus eu augue porttitor interdum.","2011-07-23","income","ARS",56446621,"56446621",4,2),
  (1029,"In at pede. Cras vulputate","2017-05-07","expense","ARS",51257919,"51257919",2,5),
  (1030,"et magnis dis parturient montes, nascetur","2013-11-16","income","ARS",9528289,"9528289",3,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1031,"imperdiet nec, leo. Morbi neque tellus, imperdiet","2006-11-13","expense","ARS",66545301,"66545301",2,11),
  (1032,"mi tempor lorem, eget mollis lectus pede et risus.","2012-02-15","expense","ARS",68334461,"68334461",4,8),
  (1033,"sit amet risus. Donec egestas. Aliquam","2016-02-13","expense","ARS",59905978,"59905978",2,7),
  (1034,"vulputate ullamcorper magna. Sed eu eros. Nam","2007-09-25","income","ARS",2483895,"2483895",5,5),
  (1035,"a sollicitudin orci sem eget massa. Suspendisse eleifend. Cras","2016-03-28","expense","ARS",34503981,"34503981",3,8),
  (1036,"hendrerit consectetuer, cursus et, magna. Praesent interdum ligula","2012-06-22","income","ARS",45239194,"45239194",2,2),
  (1037,"posuere cubilia Curae Phasellus ornare. Fusce mollis.","2019-02-12","income","ARS",1275278,"1275278",4,5),
  (1038,"primis in faucibus orci luctus et ultrices","2011-06-15","income","ARS",79465069,"79465069",3,10),
  (1039,"magnis dis parturient montes, nascetur ridiculus mus. Aenean eget magna.","2021-03-11","expense","ARS",60617094,"60617094",2,8),
  (1040,"a mi fringilla mi lacinia","2014-02-09","expense","ARS",9100045,"9100045",1,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1041,"Nullam nisl. Maecenas malesuada fringilla est. Mauris eu","2010-01-19","income","ARS",99281839,"99281839",3,7),
  (1042,"nibh sit amet orci. Ut sagittis lobortis mauris.","2021-06-16","income","ARS",57060245,"57060245",1,10),
  (1043,"In ornare sagittis felis. Donec tempor, est ac mattis","2020-04-11","income","ARS",47400171,"47400171",2,8),
  (1044,"tempus non, lacinia at, iaculis quis, pede. Praesent","2008-01-10","income","ARS",85412186,"85412186",4,10),
  (1045,"sit amet, dapibus id, blandit","2005-10-05","income","ARS",61514735,"61514735",1,11),
  (1046,"urna suscipit nonummy. Fusce fermentum","2019-11-18","income","ARS",88984133,"88984133",1,11),
  (1047,"sit amet massa. Quisque porttitor","2015-01-05","expense","ARS",73378790,"73378790",2,2),
  (1048,"lacus, varius et, euismod et, commodo at, libero. Morbi accumsan","2016-11-01","income","ARS",27842888,"27842888",2,3),
  (1049,"ultrices sit amet, risus. Donec nibh enim, gravida","2018-12-28","expense","ARS",2466139,"2466139",4,10),
  (1050,"euismod ac, fermentum vel, mauris. Integer sem elit, pharetra","2012-02-29","income","ARS",47588247,"47588247",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1051,"at pede. Cras vulputate velit eu sem. Pellentesque ut ipsum","2025-08-04","expense","ARS",43395666,"43395666",2,3),
  (1052,"turpis nec mauris blandit","2026-05-21","expense","ARS",78237369,"78237369",4,2),
  (1053,"quam. Curabitur vel lectus. Cum sociis","2025-01-24","expense","ARS",80228778,"80228778",1,3),
  (1054,"id, blandit at, nisi. Cum","2025-08-19","income","ARS",97959364,"97959364",4,1),
  (1055,"non leo. Vivamus nibh dolor, nonummy","2025-06-20","expense","ARS",1657128,"1657128",4,8),
  (1056,"magna et ipsum cursus vestibulum.","2024-12-21","income","ARS",72238496,"72238496",2,4),
  (1057,"non massa non ante bibendum ullamcorper. Duis cursus,","2026-05-23","expense","ARS",22578769,"22578769",3,2),
  (1058,"Proin non massa non","2025-02-28","income","ARS",51712795,"51712795",4,12),
  (1059,"amet, faucibus ut, nulla. Cras eu tellus eu augue","2026-05-16","expense","ARS",3094116,"3094116",4,1),
  (1060,"non, luctus sit amet, faucibus ut, nulla. Cras eu tellus","2025-08-26","income","ARS",82735971,"82735971",3,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1061,"imperdiet dictum magna. Ut tincidunt","2025-10-29","income","ARS",98965209,"98965209",4,2),
  (1062,"Morbi vehicula. Pellentesque tincidunt tempus risus. Donec egestas. Duis","2025-03-18","expense","ARS",64872245,"64872245",2,4),
  (1063,"at pede. Cras vulputate velit","2025-12-19","income","ARS",76950599,"76950599",5,2),
  (1064,"cursus purus. Nullam scelerisque neque sed sem","2025-09-21","expense","ARS",48995785,"48995785",2,2),
  (1065,"diam. Proin dolor. Nulla semper tellus id nunc interdum","2024-12-26","income","ARS",90055370,"90055370",5,6),
  (1066,"risus, at fringilla purus mauris","2025-03-19","income","ARS",41219840,"41219840",2,12),
  (1067,"Donec egestas. Aliquam nec enim.","2025-10-17","expense","ARS",90353720,"90353720",5,9),
  (1068,"ornare sagittis felis. Donec","2026-03-01","income","ARS",98729884,"98729884",3,4),
  (1069,"ut, sem. Nulla interdum. Curabitur dictum.","2025-08-11","expense","ARS",77712173,"77712173",1,1),
  (1070,"enim commodo hendrerit. Donec porttitor tellus","2025-07-16","expense","ARS",18517507,"18517507",4,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1071,"Cum sociis natoque penatibus","2025-01-16","expense","ARS",66157173,"66157173",2,11),
  (1072,"arcu iaculis enim, sit amet ornare lectus justo eu arcu.","2025-11-17","expense","ARS",77803363,"77803363",3,1),
  (1073,"varius et, euismod et, commodo at, libero. Morbi accumsan","2026-01-21","income","ARS",60694639,"60694639",2,6),
  (1074,"elit. Nulla facilisi. Sed neque. Sed eget","2025-02-15","expense","ARS",80787119,"80787119",2,3),
  (1075,"consequat dolor vitae dolor. Donec fringilla. Donec feugiat metus","2025-05-31","income","ARS",56665683,"56665683",4,4),
  (1076,"Suspendisse ac metus vitae velit egestas lacinia. Sed","2026-01-26","income","ARS",8531371,"8531371",3,3),
  (1077,"nisi sem semper erat, in consectetuer ipsum","2026-01-16","income","ARS",81110590,"81110590",4,9),
  (1078,"ac, eleifend vitae, erat.","2025-04-18","expense","ARS",87485397,"87485397",2,3),
  (1079,"et netus et malesuada fames","2026-04-29","expense","ARS",85288074,"85288074",1,3),
  (1080,"et, eros. Proin ultrices. Duis volutpat nunc sit amet","2026-04-22","income","ARS",4232755,"4232755",5,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1081,"in consectetuer ipsum nunc id enim. Curabitur massa. Vestibulum","2025-12-04","income","ARS",84390007,"84390007",2,8),
  (1082,"gravida. Aliquam tincidunt, nunc ac mattis ornare, lectus","2025-03-10","income","ARS",8024243,"8024243",3,2),
  (1083,"arcu. Curabitur ut odio","2025-01-27","expense","ARS",66714466,"66714466",3,9),
  (1084,"nisl elementum purus, accumsan interdum libero dui nec","2026-02-27","expense","ARS",64336283,"64336283",3,3),
  (1085,"vitae velit egestas lacinia. Sed congue,","2025-11-09","expense","ARS",78850699,"78850699",1,8),
  (1086,"nonummy. Fusce fermentum fermentum arcu. Vestibulum ante ipsum","2025-10-11","income","ARS",73724847,"73724847",2,5),
  (1087,"vitae, aliquet nec, imperdiet nec,","2025-08-05","expense","ARS",87927048,"87927048",3,12),
  (1088,"arcu eu odio tristique pharetra. Quisque ac libero","2025-05-11","income","ARS",89821735,"89821735",1,4),
  (1089,"enim. Nunc ut erat. Sed nunc est,","2025-08-03","expense","ARS",94364928,"94364928",1,13),
  (1090,"sodales. Mauris blandit enim consequat purus. Maecenas libero est,","2025-01-11","expense","ARS",53862734,"53862734",2,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1091,"lorem ac risus. Morbi metus. Vivamus euismod urna. Nullam","2025-05-19","income","ARS",95478178,"95478178",4,12),
  (1092,"Suspendisse aliquet molestie tellus. Aenean egestas hendrerit","2025-01-24","income","ARS",36226268,"36226268",1,4),
  (1093,"in, tempus eu, ligula. Aenean euismod mauris eu","2025-03-26","income","ARS",77996006,"77996006",3,12),
  (1094,"consequat, lectus sit amet luctus vulputate, nisi","2024-12-19","income","ARS",6455606,"6455606",3,5),
  (1095,"magnis dis parturient montes, nascetur ridiculus mus. Proin vel","2025-03-09","income","ARS",6273622,"6273622",2,9),
  (1096,"lacinia vitae, sodales at, velit. Pellentesque","2025-11-11","expense","ARS",2631712,"2631712",4,2),
  (1097,"neque non quam. Pellentesque habitant morbi tristique senectus et","2025-05-30","income","ARS",77878248,"77878248",2,12),
  (1098,"pede. Cum sociis natoque penatibus","2025-07-08","expense","ARS",99984600,"99984600",4,10),
  (1099,"Nullam vitae diam. Proin dolor. Nulla semper tellus id nunc","2025-06-04","expense","ARS",50924246,"50924246",4,7),
  (1100,"ante bibendum ullamcorper. Duis cursus,","2025-05-10","income","ARS",97422459,"97422459",3,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1101,"blandit viverra. Donec tempus, lorem","2026-04-15","income","ARS",34071912,"34071912",3,10),
  (1102,"velit. Pellentesque ultricies dignissim lacus. Aliquam rutrum lorem","2026-01-06","income","ARS",24605427,"24605427",3,6),
  (1103,"ante lectus convallis est, vitae sodales nisi magna sed dui.","2026-01-08","expense","ARS",31977625,"31977625",4,7),
  (1104,"pede sagittis augue, eu tempor erat neque","2025-09-29","expense","ARS",14835604,"14835604",2,7),
  (1105,"erat semper rutrum. Fusce dolor quam, elementum at, egestas a,","2025-12-15","expense","ARS",87826152,"87826152",3,3),
  (1106,"neque. Nullam nisl. Maecenas malesuada fringilla est.","2026-01-29","income","ARS",91022206,"91022206",5,4),
  (1107,"ipsum sodales purus, in molestie tortor nibh sit","2025-02-12","income","ARS",17505348,"17505348",1,3),
  (1108,"Aliquam erat volutpat. Nulla facilisis. Suspendisse commodo","2025-01-23","expense","ARS",99436976,"99436976",5,7),
  (1109,"nunc sit amet metus. Aliquam erat volutpat.","2024-12-25","income","ARS",65106189,"65106189",5,11),
  (1110,"volutpat. Nulla dignissim. Maecenas ornare egestas","2025-07-28","income","ARS",62694826,"62694826",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1111,"erat, eget tincidunt dui augue eu tellus.","2025-08-29","income","ARS",62224301,"62224301",2,9),
  (1112,"sem elit, pharetra ut, pharetra","2026-01-29","expense","ARS",81877153,"81877153",2,2),
  (1113,"Etiam bibendum fermentum metus. Aenean sed pede nec ante","2025-04-24","expense","ARS",1841613,"1841613",3,3),
  (1114,"inceptos hymenaeos. Mauris ut quam","2025-11-08","income","ARS",33976417,"33976417",3,12),
  (1115,"magna. Praesent interdum ligula eu","2025-07-29","expense","ARS",78526778,"78526778",2,13),
  (1116,"nulla magna, malesuada vel, convallis in, cursus et, eros.","2026-01-12","income","ARS",51333271,"51333271",1,8),
  (1117,"Donec elementum, lorem ut aliquam iaculis, lacus pede sagittis","2025-07-10","income","ARS",55373505,"55373505",2,9),
  (1118,"ornare egestas ligula. Nullam feugiat placerat velit. Quisque varius.","2025-11-27","income","ARS",14851853,"14851853",3,10),
  (1119,"pede blandit congue. In scelerisque","2026-05-31","income","ARS",22911003,"22911003",4,6),
  (1120,"mollis vitae, posuere at, velit. Cras lorem","2025-11-30","income","ARS",17500880,"17500880",5,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1121,"a, facilisis non, bibendum sed, est. Nunc laoreet","2025-05-29","income","ARS",59908621,"59908621",4,8),
  (1122,"Sed malesuada augue ut lacus. Nulla tincidunt, neque","2025-03-27","expense","ARS",50394607,"50394607",2,11),
  (1123,"Nunc lectus pede, ultrices a,","2026-04-22","expense","ARS",99494854,"99494854",5,3),
  (1124,"leo, in lobortis tellus","2025-12-17","income","ARS",75058374,"75058374",3,4),
  (1125,"Sed malesuada augue ut lacus. Nulla tincidunt, neque","2025-08-26","income","ARS",55763097,"55763097",4,10),
  (1126,"augue eu tellus. Phasellus elit pede,","2026-01-31","expense","ARS",73335876,"73335876",4,1),
  (1127,"leo. Morbi neque tellus, imperdiet non,","2026-01-07","expense","ARS",22572998,"22572998",4,5),
  (1128,"Suspendisse dui. Fusce diam","2025-04-27","expense","ARS",81463001,"81463001",2,12),
  (1129,"quam quis diam. Pellentesque habitant morbi tristique senectus","2026-03-25","expense","ARS",555676,"555676",5,11),
  (1130,"dictum mi, ac mattis velit justo nec ante. Maecenas","2025-06-29","income","ARS",70926228,"70926228",5,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1131,"elit sed consequat auctor, nunc","2025-06-12","expense","ARS",24948880,"24948880",2,12),
  (1132,"eu eros. Nam consequat dolor vitae","2026-01-13","income","ARS",69896148,"69896148",5,9),
  (1133,"ipsum ac mi eleifend egestas. Sed pharetra,","2025-03-01","income","ARS",33469762,"33469762",3,1),
  (1134,"bibendum. Donec felis orci, adipiscing non, luctus","2025-01-11","expense","ARS",1236112,"1236112",2,12),
  (1135,"in, tempus eu, ligula. Aenean euismod","2025-02-07","income","ARS",414229,"414229",2,5),
  (1136,"vitae, erat. Vivamus nisi. Mauris nulla. Integer urna. Vivamus molestie","2025-01-09","expense","ARS",41767746,"41767746",2,6),
  (1137,"ac, feugiat non, lobortis quis, pede. Suspendisse dui. Fusce diam","2026-05-10","income","ARS",16868786,"16868786",1,8),
  (1138,"senectus et netus et malesuada fames ac","2026-05-09","income","ARS",81471724,"81471724",1,1),
  (1139,"imperdiet, erat nonummy ultricies ornare, elit elit fermentum","2025-08-18","expense","ARS",13055212,"13055212",2,3),
  (1140,"ullamcorper magna. Sed eu eros. Nam","2025-09-07","income","ARS",58372368,"58372368",1,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1141,"adipiscing ligula. Aenean gravida nunc sed pede.","2026-05-14","expense","ARS",71816046,"71816046",4,11),
  (1142,"volutpat. Nulla facilisis. Suspendisse commodo tincidunt","2025-10-14","income","ARS",11815069,"11815069",4,8),
  (1143,"id nunc interdum feugiat. Sed nec metus facilisis","2025-02-25","income","ARS",84559345,"84559345",5,5),
  (1144,"Nulla tempor augue ac ipsum. Phasellus vitae","2025-07-02","expense","ARS",95855671,"95855671",4,5),
  (1145,"bibendum sed, est. Nunc laoreet","2026-04-21","expense","ARS",94908583,"94908583",2,10),
  (1146,"rutrum urna, nec luctus felis purus ac tellus.","2024-12-31","income","ARS",62644776,"62644776",3,8),
  (1147,"Aliquam tincidunt, nunc ac mattis ornare,","2025-03-30","income","ARS",59222215,"59222215",3,12),
  (1148,"ultrices iaculis odio. Nam interdum enim non nisi. Aenean","2025-09-23","expense","ARS",53779166,"53779166",4,12),
  (1149,"faucibus ut, nulla. Cras eu tellus eu augue porttitor","2025-09-06","income","ARS",9783725,"9783725",3,10),
  (1150,"luctus aliquet odio. Etiam ligula tortor,","2025-06-03","income","ARS",47448028,"47448028",3,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1151,"ac turpis egestas. Fusce aliquet magna a neque. Nullam","2025-01-23","income","ARS",58932564,"58932564",2,11),
  (1152,"sed, facilisis vitae, orci. Phasellus dapibus quam","2025-06-14","expense","ARS",59955888,"59955888",5,8),
  (1153,"molestie sodales. Mauris blandit enim consequat purus. Maecenas","2025-06-09","expense","ARS",19571470,"19571470",4,9),
  (1154,"mollis. Integer tincidunt aliquam arcu. Aliquam","2025-06-03","income","ARS",73922333,"73922333",2,2),
  (1155,"eget massa. Suspendisse eleifend. Cras sed leo. Cras vehicula aliquet","2025-09-09","income","ARS",7907674,"7907674",2,12),
  (1156,"tincidunt adipiscing. Mauris molestie pharetra nibh. Aliquam ornare, libero at","2026-04-22","expense","ARS",30863382,"30863382",1,5),
  (1157,"quis, pede. Suspendisse dui. Fusce diam nunc,","2024-12-29","income","ARS",78834591,"78834591",2,3),
  (1158,"Mauris eu turpis. Nulla aliquet. Proin velit. Sed","2025-06-23","expense","ARS",55547879,"55547879",4,5),
  (1159,"lectus convallis est, vitae sodales nisi magna sed dui. Fusce","2025-09-25","income","ARS",35343093,"35343093",3,8),
  (1160,"arcu. Sed eu nibh","2025-01-30","expense","ARS",75612933,"75612933",2,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1161,"molestie tortor nibh sit amet orci. Ut","2026-01-30","expense","ARS",50396055,"50396055",5,9),
  (1162,"tincidunt congue turpis. In condimentum. Donec at arcu.","2025-06-26","expense","ARS",90283561,"90283561",5,12),
  (1163,"quis arcu vel quam dignissim pharetra.","2025-07-13","expense","ARS",12434123,"12434123",2,13),
  (1164,"aliquet magna a neque. Nullam","2025-09-04","expense","ARS",23101291,"23101291",4,4),
  (1165,"massa lobortis ultrices. Vivamus rhoncus. Donec est.","2024-12-19","income","ARS",30511888,"30511888",4,9),
  (1166,"diam. Duis mi enim,","2025-04-25","expense","ARS",96808923,"96808923",1,11),
  (1167,"at risus. Nunc ac sem ut dolor dapibus gravida. Aliquam","2025-02-12","expense","ARS",90884108,"90884108",1,2),
  (1168,"molestie tellus. Aenean egestas hendrerit neque. In ornare sagittis felis.","2025-03-23","income","ARS",4465152,"4465152",4,11),
  (1169,"Suspendisse non leo. Vivamus nibh","2026-01-11","expense","ARS",59895192,"59895192",2,6),
  (1170,"luctus et ultrices posuere cubilia Curae Donec tincidunt. Donec vitae","2026-03-18","income","ARS",1715520,"1715520",4,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1171,"felis. Donec tempor, est ac mattis semper,","2025-09-17","expense","ARS",97406186,"97406186",3,12),
  (1172,"orci, adipiscing non, luctus sit","2026-05-24","expense","ARS",7724053,"7724053",5,1),
  (1173,"tincidunt. Donec vitae erat vel pede blandit congue. In scelerisque","2025-10-30","income","ARS",45323024,"45323024",4,1),
  (1174,"Aliquam erat volutpat. Nulla dignissim. Maecenas ornare","2025-03-11","expense","ARS",75574391,"75574391",5,4),
  (1175,"at sem molestie sodales. Mauris blandit enim","2025-08-11","income","ARS",97163028,"97163028",2,8),
  (1176,"enim. Etiam imperdiet dictum magna. Ut","2025-06-20","expense","ARS",74987182,"74987182",1,11),
  (1177,"aliquet libero. Integer in magna. Phasellus dolor","2025-03-22","income","ARS",93512368,"93512368",2,8),
  (1178,"sit amet risus. Donec egestas. Aliquam","2026-05-02","income","ARS",51629324,"51629324",2,7),
  (1179,"vitae dolor. Donec fringilla. Donec feugiat metus","2025-07-04","expense","ARS",36098206,"36098206",2,9),
  (1180,"dolor. Donec fringilla. Donec","2025-03-09","income","ARS",49528333,"49528333",5,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1181,"lacus. Nulla tincidunt, neque vitae","2025-04-26","expense","ARS",61098994,"61098994",2,4),
  (1182,"cursus vestibulum. Mauris magna. Duis dignissim tempor arcu. Vestibulum","2025-08-08","income","ARS",92992739,"92992739",2,2),
  (1183,"eros nec tellus. Nunc lectus pede,","2026-02-10","income","ARS",54133749,"54133749",3,2),
  (1184,"vel, vulputate eu, odio. Phasellus","2025-01-30","expense","ARS",86275498,"86275498",3,9),
  (1185,"eros turpis non enim. Mauris quis","2026-03-19","expense","ARS",17131124,"17131124",3,4),
  (1186,"pretium et, rutrum non, hendrerit","2025-07-12","expense","ARS",3010707,"3010707",4,5),
  (1187,"at auctor ullamcorper, nisl arcu iaculis enim, sit amet ornare","2026-06-05","expense","ARS",1557560,"1557560",5,7),
  (1188,"enim commodo hendrerit. Donec porttitor","2026-02-26","income","ARS",9480349,"9480349",4,4),
  (1189,"ornare, lectus ante dictum mi, ac mattis velit","2025-12-07","income","ARS",88497697,"88497697",2,11),
  (1190,"elit pede, malesuada vel, venenatis vel, faucibus","2025-03-28","income","ARS",58300974,"58300974",2,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1191,"Nulla facilisi. Sed neque. Sed eget lacus. Mauris","2025-10-21","expense","ARS",94188472,"94188472",3,2),
  (1192,"ultricies dignissim lacus. Aliquam rutrum lorem","2025-03-24","expense","ARS",64935471,"64935471",2,11),
  (1193,"Cum sociis natoque penatibus et magnis dis parturient montes,","2026-01-30","expense","ARS",21063161,"21063161",2,2),
  (1194,"mauris, rhoncus id, mollis nec, cursus","2025-02-03","income","ARS",48917791,"48917791",1,4),
  (1195,"varius ultrices, mauris ipsum porta elit, a feugiat tellus","2025-05-18","expense","ARS",29366872,"29366872",4,3),
  (1196,"ridiculus mus. Proin vel arcu eu","2025-01-22","income","ARS",63327803,"63327803",4,12),
  (1197,"a, facilisis non, bibendum sed,","2025-07-15","expense","ARS",65621259,"65621259",5,9),
  (1198,"Aliquam rutrum lorem ac risus. Morbi","2025-03-09","income","ARS",92825789,"92825789",3,8),
  (1199,"a odio semper cursus. Integer","2025-01-01","expense","ARS",77316693,"77316693",5,11),
  (1200,"Sed congue, elit sed consequat auctor, nunc nulla vulputate","2025-12-11","expense","ARS",4203977,"4203977",3,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1201,"Curabitur vel lectus. Cum sociis natoque","2025-03-15","expense","ARS",15752983,"15752983",3,11),
  (1202,"cursus non, egestas a, dui. Cras","2025-07-28","expense","ARS",42670819,"42670819",4,6),
  (1203,"nec, euismod in, dolor. Fusce","2024-12-30","income","ARS",11477537,"11477537",3,11),
  (1204,"varius ultrices, mauris ipsum porta elit, a feugiat","2026-02-16","expense","ARS",45839246,"45839246",3,12),
  (1205,"Aliquam gravida mauris ut mi.","2024-12-26","expense","ARS",59191332,"59191332",2,7),
  (1206,"eget varius ultrices, mauris ipsum","2025-05-19","expense","ARS",8893375,"8893375",2,10),
  (1207,"Class aptent taciti sociosqu ad litora torquent","2025-09-13","expense","ARS",3290436,"3290436",2,5),
  (1208,"tincidunt aliquam arcu. Aliquam ultrices","2025-07-09","expense","ARS",20077932,"20077932",4,8),
  (1209,"sit amet luctus vulputate, nisi sem semper","2025-10-12","expense","ARS",3457973,"3457973",4,5),
  (1210,"faucibus orci luctus et ultrices posuere cubilia Curae","2026-05-12","income","ARS",84912028,"84912028",5,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1211,"a, aliquet vel, vulputate eu, odio. Phasellus at augue","2025-10-26","expense","ARS",41435205,"41435205",1,3),
  (1212,"aliquet, metus urna convallis erat, eget tincidunt dui augue eu","2025-06-12","expense","ARS",75897999,"75897999",3,6),
  (1213,"eu nibh vulputate mauris sagittis placerat. Cras","2026-01-30","income","ARS",37785455,"37785455",3,6),
  (1214,"neque sed sem egestas blandit. Nam nulla magna, malesuada vel,","2026-05-27","expense","ARS",72474575,"72474575",2,2),
  (1215,"Vivamus non lorem vitae odio sagittis semper. Nam tempor","2025-01-26","income","ARS",20634247,"20634247",3,7),
  (1216,"mus. Proin vel nisl. Quisque fringilla euismod","2026-02-26","income","ARS",7612299,"7612299",1,9),
  (1217,"Pellentesque ut ipsum ac mi","2025-10-02","expense","ARS",98182951,"98182951",2,12),
  (1218,"ipsum sodales purus, in","2025-12-08","expense","ARS",88500005,"88500005",3,12),
  (1219,"orci. Ut sagittis lobortis mauris. Suspendisse aliquet molestie","2025-05-21","income","ARS",85890202,"85890202",3,5),
  (1220,"sed tortor. Integer aliquam adipiscing lacus. Ut nec urna","2026-05-14","expense","ARS",48962084,"48962084",3,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1221,"fames ac turpis egestas. Fusce aliquet magna","2026-02-16","expense","ARS",57772823,"57772823",1,8),
  (1222,"Sed dictum. Proin eget odio. Aliquam vulputate","2025-08-15","expense","ARS",82281624,"82281624",1,6),
  (1223,"vehicula aliquet libero. Integer in magna. Phasellus dolor elit,","2025-02-25","expense","ARS",61539111,"61539111",4,7),
  (1224,"dictum mi, ac mattis velit justo nec","2026-02-17","expense","ARS",5629990,"5629990",2,4),
  (1225,"eros turpis non enim. Mauris quis","2026-06-01","income","ARS",66180875,"66180875",4,6),
  (1226,"ligula. Aenean gravida nunc sed pede. Cum sociis natoque penatibus","2024-12-18","expense","ARS",38452239,"38452239",3,12),
  (1227,"Nunc laoreet lectus quis massa. Mauris vestibulum, neque","2025-10-07","expense","ARS",98470832,"98470832",4,5),
  (1228,"primis in faucibus orci luctus","2025-06-05","expense","ARS",58490629,"58490629",5,9),
  (1229,"nec, euismod in, dolor. Fusce feugiat. Lorem","2026-03-28","income","ARS",53079760,"53079760",4,8),
  (1230,"per conubia nostra, per inceptos hymenaeos. Mauris","2026-04-20","income","ARS",59712090,"59712090",4,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1231,"pharetra sed, hendrerit a, arcu. Sed et libero. Proin mi.","2025-05-05","income","ARS",29067435,"29067435",4,6),
  (1232,"lacinia mattis. Integer eu lacus. Quisque imperdiet, erat nonummy","2025-10-27","expense","ARS",70042056,"70042056",4,11),
  (1233,"urna. Nullam lobortis quam a felis ullamcorper viverra.","2025-11-06","income","ARS",89258729,"89258729",3,8),
  (1234,"facilisis eget, ipsum. Donec sollicitudin adipiscing ligula. Aenean gravida nunc","2025-12-29","income","ARS",52858089,"52858089",3,9),
  (1235,"nisi. Aenean eget metus. In nec orci.","2025-08-25","expense","ARS",91432141,"91432141",4,6),
  (1236,"Nunc laoreet lectus quis massa. Mauris vestibulum, neque sed dictum","2025-10-07","expense","ARS",20391456,"20391456",3,10),
  (1237,"vitae mauris sit amet lorem semper auctor.","2025-07-23","expense","ARS",8544092,"8544092",1,8),
  (1238,"hendrerit a, arcu. Sed et libero. Proin mi.","2025-01-16","income","ARS",78489531,"78489531",5,10),
  (1239,"ac nulla. In tincidunt congue turpis. In","2025-12-22","expense","ARS",28299192,"28299192",1,9),
  (1240,"porttitor scelerisque neque. Nullam nisl. Maecenas","2025-06-22","income","ARS",19416111,"19416111",5,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1241,"at fringilla purus mauris a nunc. In at pede. Cras","2025-10-07","income","ARS",63432537,"63432537",4,8),
  (1242,"Vivamus nibh dolor, nonummy ac, feugiat non, lobortis quis,","2025-06-30","income","ARS",7701992,"7701992",2,2),
  (1243,"ullamcorper. Duis cursus, diam at pretium aliquet, metus","2025-08-18","income","ARS",53072778,"53072778",4,11),
  (1244,"mauris. Suspendisse aliquet molestie tellus. Aenean egestas hendrerit neque. In","2026-05-10","income","ARS",99239430,"99239430",2,10),
  (1245,"nec, cursus a, enim.","2026-04-27","income","ARS",99582453,"99582453",4,4),
  (1246,"tincidunt nibh. Phasellus nulla. Integer vulputate, risus a","2026-01-04","income","ARS",59466427,"59466427",1,10),
  (1247,"Phasellus dolor elit, pellentesque a,","2026-01-03","income","ARS",72390464,"72390464",1,11),
  (1248,"ligula. Donec luctus aliquet odio. Etiam","2025-01-21","income","ARS",10390852,"10390852",5,9),
  (1249,"dapibus id, blandit at, nisi.","2026-03-24","expense","ARS",36440370,"36440370",2,3),
  (1250,"mauris ut mi. Duis risus odio, auctor vitae,","2025-11-09","income","ARS",55380367,"55380367",1,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1251,"enim. Mauris quis turpis vitae purus gravida","2025-06-11","expense","ARS",62565691,"62565691",3,10),
  (1252,"gravida mauris ut mi.","2025-05-14","expense","ARS",66522315,"66522315",5,10),
  (1253,"ultrices a, auctor non,","2025-02-15","expense","ARS",37458861,"37458861",2,10),
  (1254,"sed turpis nec mauris blandit","2025-09-11","income","ARS",78135898,"78135898",5,1),
  (1255,"Ut semper pretium neque. Morbi quis urna. Nunc","2024-12-25","expense","ARS",22019505,"22019505",3,8),
  (1256,"luctus et ultrices posuere cubilia Curae Phasellus ornare. Fusce","2026-02-28","expense","ARS",59308676,"59308676",1,6),
  (1257,"pretium aliquet, metus urna convallis erat, eget tincidunt dui augue","2025-12-11","expense","ARS",49994732,"49994732",4,12),
  (1258,"lobortis tellus justo sit amet nulla. Donec non","2025-03-10","income","ARS",41313013,"41313013",3,1),
  (1259,"volutpat nunc sit amet","2025-02-24","expense","ARS",75943731,"75943731",4,13),
  (1260,"imperdiet, erat nonummy ultricies","2026-03-31","income","ARS",14055252,"14055252",3,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1261,"sapien molestie orci tincidunt adipiscing.","2025-05-01","expense","ARS",4395533,"4395533",2,4),
  (1262,"Duis dignissim tempor arcu. Vestibulum ut eros non enim commodo","2026-02-09","income","ARS",30431246,"30431246",3,8),
  (1263,"cursus in, hendrerit consectetuer, cursus et, magna.","2025-01-04","expense","ARS",48253150,"48253150",4,10),
  (1264,"natoque penatibus et magnis dis parturient montes, nascetur","2025-10-07","income","ARS",43525453,"43525453",4,13),
  (1265,"a feugiat tellus lorem eu","2025-10-24","expense","ARS",71300632,"71300632",2,11),
  (1266,"adipiscing lobortis risus. In mi","2025-07-24","income","ARS",33489122,"33489122",5,4),
  (1267,"magna. Praesent interdum ligula eu enim.","2026-03-03","income","ARS",82536625,"82536625",5,3),
  (1268,"Nullam feugiat placerat velit. Quisque varius.","2025-03-09","expense","ARS",39377066,"39377066",5,8),
  (1269,"torquent per conubia nostra, per inceptos hymenaeos.","2025-05-26","expense","ARS",71413173,"71413173",2,8),
  (1270,"sed consequat auctor, nunc nulla","2024-12-24","expense","ARS",17473863,"17473863",4,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1271,"erat volutpat. Nulla facilisis. Suspendisse commodo tincidunt nibh.","2025-12-20","expense","ARS",74684520,"74684520",2,10),
  (1272,"consectetuer euismod est arcu ac orci. Ut semper","2025-06-26","expense","ARS",65569299,"65569299",5,7),
  (1273,"Donec egestas. Duis ac arcu.","2025-09-23","income","ARS",91307454,"91307454",5,12),
  (1274,"Duis at lacus. Quisque purus sapien, gravida non, sollicitudin","2025-06-01","income","ARS",64204955,"64204955",2,10),
  (1275,"Etiam bibendum fermentum metus. Aenean sed pede nec ante blandit","2025-04-20","expense","ARS",47659552,"47659552",5,3),
  (1276,"mollis. Integer tincidunt aliquam","2025-08-01","income","ARS",83639448,"83639448",2,7),
  (1277,"ac mi eleifend egestas. Sed pharetra, felis","2026-04-21","expense","ARS",45176997,"45176997",3,3),
  (1278,"risus. Morbi metus. Vivamus euismod urna. Nullam","2024-12-22","income","ARS",23016084,"23016084",4,6),
  (1279,"dis parturient montes, nascetur ridiculus mus. Proin","2026-01-15","income","ARS",92209039,"92209039",4,8),
  (1280,"felis eget varius ultrices, mauris","2025-09-16","expense","ARS",13766416,"13766416",4,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1281,"libero mauris, aliquam eu, accumsan sed, facilisis vitae,","2026-05-23","expense","ARS",2908166,"2908166",3,8),
  (1282,"eu, odio. Phasellus at augue id ante dictum cursus.","2026-01-10","expense","ARS",86230455,"86230455",2,9),
  (1283,"Integer aliquam adipiscing lacus. Ut nec urna","2026-06-08","expense","ARS",27028897,"27028897",2,7),
  (1284,"a feugiat tellus lorem eu metus. In lorem.","2026-01-17","expense","ARS",19908839,"19908839",4,11),
  (1285,"Nunc ut erat. Sed","2026-06-09","income","ARS",84770203,"84770203",3,6),
  (1286,"quam, elementum at, egestas a, scelerisque sed, sapien.","2026-02-14","income","ARS",63371977,"63371977",3,6),
  (1287,"pede, malesuada vel, venenatis vel, faucibus id, libero. Donec","2026-02-07","expense","ARS",67933837,"67933837",4,5),
  (1288,"non, sollicitudin a, malesuada id, erat.","2025-04-21","expense","ARS",53538661,"53538661",5,4),
  (1289,"Praesent eu dui. Cum","2024-12-29","income","ARS",26861815,"26861815",3,8),
  (1290,"enim, condimentum eget, volutpat ornare, facilisis eget,","2025-05-17","income","ARS",72068829,"72068829",5,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1291,"faucibus lectus, a sollicitudin orci sem eget massa.","2026-04-13","income","ARS",2008256,"2008256",2,12),
  (1292,"nulla at sem molestie sodales. Mauris blandit enim","2026-04-18","income","ARS",70929115,"70929115",2,9),
  (1293,"nisi. Aenean eget metus. In nec orci.","2025-08-26","expense","ARS",43263986,"43263986",4,2),
  (1294,"placerat, orci lacus vestibulum lorem, sit amet","2025-03-21","expense","ARS",83387834,"83387834",4,6),
  (1295,"sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer","2024-12-28","expense","ARS",77003749,"77003749",2,6),
  (1296,"morbi tristique senectus et netus","2026-04-03","income","ARS",9712962,"9712962",2,9),
  (1297,"euismod urna. Nullam lobortis quam a felis ullamcorper","2025-01-07","expense","ARS",60703876,"60703876",4,3),
  (1298,"faucibus. Morbi vehicula. Pellentesque tincidunt tempus risus. Donec egestas.","2026-05-29","expense","ARS",41891223,"41891223",5,13),
  (1299,"mauris, aliquam eu, accumsan sed, facilisis","2025-08-20","expense","ARS",97266646,"97266646",1,3),
  (1300,"montes, nascetur ridiculus mus. Donec dignissim magna a tortor.","2025-07-21","income","ARS",66224751,"66224751",1,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1301,"non, luctus sit amet, faucibus ut, nulla.","2025-12-24","expense","ARS",45833657,"45833657",2,5),
  (1302,"Curae Phasellus ornare. Fusce mollis. Duis sit amet","2025-07-23","income","ARS",23027927,"23027927",3,6),
  (1303,"Sed nulla ante, iaculis nec, eleifend","2026-06-01","income","ARS",14303283,"14303283",1,11),
  (1304,"dolor. Fusce mi lorem, vehicula et,","2025-09-24","income","ARS",55542541,"55542541",3,8),
  (1305,"nostra, per inceptos hymenaeos. Mauris","2025-08-07","income","ARS",44767538,"44767538",4,5),
  (1306,"arcu. Vestibulum ante ipsum primis","2025-12-19","income","ARS",97342204,"97342204",1,9),
  (1307,"nisi. Mauris nulla. Integer urna. Vivamus molestie dapibus ligula.","2026-03-16","expense","ARS",61600334,"61600334",1,10),
  (1308,"malesuada malesuada. Integer id magna et ipsum","2024-12-21","expense","ARS",46724608,"46724608",5,3),
  (1309,"eros. Proin ultrices. Duis volutpat nunc sit","2025-02-03","income","ARS",74370010,"74370010",2,8),
  (1310,"ultrices posuere cubilia Curae Phasellus ornare. Fusce mollis.","2025-05-01","expense","ARS",34020394,"34020394",3,4);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1311,"dictum eleifend, nunc risus varius orci, in consequat enim diam","2025-11-01","income","ARS",72282646,"72282646",5,11),
  (1312,"ultrices sit amet, risus. Donec nibh enim, gravida sit","2025-09-28","expense","ARS",69637339,"69637339",3,11),
  (1313,"Curabitur consequat, lectus sit amet luctus vulputate,","2025-09-24","income","ARS",36031131,"36031131",4,12),
  (1314,"diam vel arcu. Curabitur ut odio","2026-01-29","income","ARS",23332283,"23332283",3,8),
  (1315,"Cras convallis convallis dolor.","2025-05-19","expense","ARS",70937739,"70937739",2,9),
  (1316,"Praesent eu nulla at sem molestie sodales.","2025-05-04","income","ARS",56307959,"56307959",2,8),
  (1317,"Aliquam ultrices iaculis odio. Nam","2026-01-04","expense","ARS",59278706,"59278706",3,13),
  (1318,"dui, in sodales elit erat vitae risus.","2025-05-30","expense","ARS",87114449,"87114449",2,8),
  (1319,"ligula elit, pretium et, rutrum","2026-02-21","expense","ARS",15274277,"15274277",4,9),
  (1320,"et, magna. Praesent interdum ligula eu","2025-05-01","expense","ARS",5143336,"5143336",1,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1321,"magna. Suspendisse tristique neque venenatis lacus. Etiam bibendum fermentum metus.","2026-02-17","expense","ARS",37540163,"37540163",4,7),
  (1322,"Pellentesque ultricies dignissim lacus. Aliquam","2025-12-17","income","ARS",28456629,"28456629",3,4),
  (1323,"mi, ac mattis velit justo nec","2026-04-01","expense","ARS",88918522,"88918522",3,3),
  (1324,"risus. Morbi metus. Vivamus euismod urna. Nullam lobortis quam a","2025-03-25","income","ARS",41012258,"41012258",3,5),
  (1325,"Aenean sed pede nec ante blandit","2026-04-01","expense","ARS",74777059,"74777059",3,7),
  (1326,"non, bibendum sed, est. Nunc laoreet","2024-12-29","expense","ARS",96916401,"96916401",5,10),
  (1327,"placerat, orci lacus vestibulum lorem, sit amet","2025-12-06","income","ARS",24032099,"24032099",2,8),
  (1328,"velit justo nec ante. Maecenas mi","2025-02-11","income","ARS",68888448,"68888448",2,8),
  (1329,"quis, tristique ac, eleifend vitae,","2025-03-14","income","ARS",7355804,"7355804",3,9),
  (1330,"tortor. Nunc commodo auctor velit. Aliquam nisl. Nulla eu","2025-05-13","expense","ARS",86146238,"86146238",2,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1331,"sit amet lorem semper auctor. Mauris","2025-10-06","income","ARS",18103819,"18103819",1,3),
  (1332,"tincidunt nibh. Phasellus nulla. Integer vulputate, risus a ultricies","2026-05-04","expense","ARS",91132703,"91132703",2,9),
  (1333,"et ultrices posuere cubilia Curae Donec","2026-04-20","expense","ARS",70970331,"70970331",2,6),
  (1334,"velit. Sed malesuada augue ut","2025-10-26","income","ARS",78321214,"78321214",2,4),
  (1335,"dui, in sodales elit erat vitae risus. Duis","2025-04-09","income","ARS",43775888,"43775888",5,13),
  (1336,"vulputate, risus a ultricies adipiscing, enim mi tempor","2026-06-11","expense","ARS",86254862,"86254862",3,7),
  (1337,"sed leo. Cras vehicula aliquet libero.","2026-03-03","expense","ARS",69797675,"69797675",2,13),
  (1338,"pharetra, felis eget varius ultrices, mauris","2026-01-25","expense","ARS",82287781,"82287781",4,13),
  (1339,"mauris. Suspendisse aliquet molestie tellus. Aenean egestas","2025-05-01","expense","ARS",45446954,"45446954",1,11),
  (1340,"malesuada malesuada. Integer id","2026-06-05","income","ARS",40581523,"40581523",5,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1341,"pede, nonummy ut, molestie in,","2025-11-26","expense","ARS",87126120,"87126120",3,7),
  (1342,"rhoncus. Nullam velit dui, semper et,","2025-08-08","expense","ARS",21457201,"21457201",1,6),
  (1343,"Mauris non dui nec urna","2026-04-13","income","ARS",65509973,"65509973",5,12),
  (1344,"vel, vulputate eu, odio. Phasellus at augue id ante dictum","2025-10-05","income","ARS",87227182,"87227182",3,4),
  (1345,"eu lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit","2025-07-12","income","ARS",806850,"806850",4,4),
  (1346,"semper egestas, urna justo faucibus lectus,","2025-12-17","income","ARS",17316267,"17316267",2,12),
  (1347,"libero. Integer in magna. Phasellus dolor elit, pellentesque","2026-05-10","expense","ARS",50806686,"50806686",2,3),
  (1348,"luctus. Curabitur egestas nunc","2025-04-11","expense","ARS",75026929,"75026929",2,6),
  (1349,"lacus. Quisque imperdiet, erat nonummy","2025-07-24","expense","ARS",354438,"354438",4,2),
  (1350,"id ante dictum cursus. Nunc mauris elit, dictum eu, eleifend","2025-11-21","expense","ARS",16455389,"16455389",4,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1351,"urna justo faucibus lectus, a sollicitudin orci sem","2025-02-03","expense","ARS",56927520,"56927520",2,2),
  (1352,"est, vitae sodales nisi magna sed dui. Fusce","2025-09-01","income","ARS",73279500,"73279500",2,8),
  (1353,"sit amet orci. Ut sagittis","2025-02-20","expense","ARS",10894531,"10894531",2,8),
  (1354,"eu lacus. Quisque imperdiet, erat","2025-08-31","expense","ARS",9432378,"9432378",2,13),
  (1355,"mollis. Phasellus libero mauris, aliquam eu, accumsan sed, facilisis","2025-04-07","expense","ARS",45634334,"45634334",3,12),
  (1356,"ligula eu enim. Etiam imperdiet","2025-12-17","income","ARS",57350343,"57350343",2,1),
  (1357,"aliquet, sem ut cursus","2026-03-21","expense","ARS",66401643,"66401643",2,1),
  (1358,"augue ut lacus. Nulla tincidunt, neque vitae","2025-05-24","income","ARS",61557712,"61557712",2,2),
  (1359,"ullamcorper, velit in aliquet lobortis, nisi nibh","2025-01-24","expense","ARS",87927137,"87927137",2,4),
  (1360,"porttitor tellus non magna. Nam ligula elit, pretium et,","2026-03-10","expense","ARS",58712908,"58712908",3,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1361,"natoque penatibus et magnis","2026-05-01","income","ARS",45254790,"45254790",1,13),
  (1362,"tincidunt orci quis lectus. Nullam suscipit, est ac facilisis","2025-11-10","income","ARS",24179557,"24179557",1,12),
  (1363,"sociis natoque penatibus et magnis dis parturient montes, nascetur","2026-04-15","income","ARS",51884935,"51884935",4,7),
  (1364,"urna justo faucibus lectus, a sollicitudin orci sem","2025-06-27","income","ARS",49501009,"49501009",1,12),
  (1365,"vehicula aliquet libero. Integer in","2025-02-03","expense","ARS",30332596,"30332596",4,6),
  (1366,"magna. Suspendisse tristique neque venenatis lacus. Etiam","2025-04-27","expense","ARS",11104286,"11104286",3,8),
  (1367,"eu erat semper rutrum. Fusce dolor quam, elementum at,","2026-03-12","income","ARS",91578294,"91578294",4,2),
  (1368,"consectetuer adipiscing elit. Etiam laoreet, libero et tristique pellentesque,","2025-08-11","income","ARS",36634287,"36634287",3,7),
  (1369,"Vestibulum accumsan neque et","2026-03-13","income","ARS",98094013,"98094013",2,11),
  (1370,"elit fermentum risus, at fringilla purus mauris a nunc.","2025-10-09","expense","ARS",55086159,"55086159",4,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1371,"adipiscing lacus. Ut nec urna et arcu","2025-03-06","income","ARS",70630739,"70630739",3,6),
  (1372,"amet, dapibus id, blandit at, nisi. Cum sociis natoque","2025-06-20","income","ARS",58782999,"58782999",1,12),
  (1373,"massa. Mauris vestibulum, neque sed dictum","2025-10-20","income","ARS",19936065,"19936065",1,2),
  (1374,"molestie tortor nibh sit amet orci. Ut sagittis","2025-11-25","expense","ARS",90091347,"90091347",2,8),
  (1375,"pede. Praesent eu dui. Cum sociis natoque","2026-03-12","income","ARS",91496427,"91496427",4,1),
  (1376,"Donec nibh enim, gravida sit amet, dapibus id,","2025-06-30","income","ARS",91975536,"91975536",1,2),
  (1377,"vitae mauris sit amet lorem semper auctor.","2025-06-18","expense","ARS",43851989,"43851989",3,5),
  (1378,"cursus luctus, ipsum leo elementum sem, vitae aliquam eros turpis","2025-10-10","income","ARS",12217142,"12217142",2,8),
  (1379,"mus. Proin vel nisl. Quisque fringilla euismod enim.","2026-05-31","expense","ARS",43605353,"43605353",3,7),
  (1380,"Curae Phasellus ornare. Fusce mollis. Duis sit","2026-04-06","expense","ARS",45402837,"45402837",3,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1381,"Nullam vitae diam. Proin dolor.","2025-10-05","expense","ARS",50648288,"50648288",2,8),
  (1382,"dapibus rutrum, justo. Praesent luctus. Curabitur egestas nunc sed","2026-01-01","income","ARS",17397881,"17397881",3,10),
  (1383,"Class aptent taciti sociosqu ad","2025-01-23","income","ARS",52181966,"52181966",4,6),
  (1384,"lectus ante dictum mi, ac mattis velit justo nec","2026-01-24","income","ARS",53199611,"53199611",2,6),
  (1385,"purus. Maecenas libero est, congue","2025-04-01","income","ARS",69082398,"69082398",3,7),
  (1386,"orci, adipiscing non, luctus","2025-07-20","income","ARS",62694239,"62694239",3,5),
  (1387,"pharetra. Nam ac nulla. In tincidunt congue","2026-03-31","expense","ARS",62456697,"62456697",4,3),
  (1388,"in felis. Nulla tempor augue ac ipsum. Phasellus vitae mauris","2025-04-09","income","ARS",43598549,"43598549",2,9),
  (1389,"diam lorem, auctor quis, tristique","2026-05-28","income","ARS",42055160,"42055160",1,8),
  (1390,"sed libero. Proin sed turpis nec mauris blandit mattis.","2026-04-24","income","ARS",49632350,"49632350",5,5);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1391,"in sodales elit erat vitae risus. Duis a mi","2025-06-20","expense","ARS",25993757,"25993757",4,4),
  (1392,"sagittis lobortis mauris. Suspendisse aliquet molestie tellus. Aenean","2025-08-02","income","ARS",7408815,"7408815",1,4),
  (1393,"Sed malesuada augue ut lacus.","2026-05-06","expense","ARS",53344081,"53344081",3,10),
  (1394,"consequat dolor vitae dolor. Donec fringilla.","2025-05-25","income","ARS",65006275,"65006275",3,12),
  (1395,"vel, mauris. Integer sem elit,","2026-01-26","expense","ARS",24755528,"24755528",4,13),
  (1396,"libero nec ligula consectetuer rhoncus. Nullam velit","2026-02-22","expense","ARS",20329464,"20329464",3,6),
  (1397,"elementum, dui quis accumsan convallis, ante","2025-06-14","expense","ARS",92544272,"92544272",3,13),
  (1398,"malesuada fringilla est. Mauris eu turpis. Nulla aliquet.","2026-02-07","expense","ARS",67400921,"67400921",3,7),
  (1399,"dictum sapien. Aenean massa. Integer vitae nibh. Donec est","2025-02-06","income","ARS",35727639,"35727639",1,4),
  (1400,"luctus vulputate, nisi sem semper erat, in consectetuer","2025-10-05","income","ARS",99509888,"99509888",5,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1401,"ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur","2026-01-12","expense","ARS",7255613,"7255613",4,12),
  (1402,"Mauris ut quam vel sapien","2025-04-22","income","ARS",43596545,"43596545",4,8),
  (1403,"sem eget massa. Suspendisse eleifend.","2025-12-31","expense","ARS",5702374,"5702374",2,6),
  (1404,"consectetuer ipsum nunc id enim.","2025-11-07","expense","ARS",75518314,"75518314",2,2),
  (1405,"vitae odio sagittis semper. Nam tempor diam dictum","2026-05-18","income","ARS",18405641,"18405641",4,6),
  (1406,"interdum libero dui nec ipsum.","2025-08-09","income","ARS",9691342,"9691342",5,6),
  (1407,"Duis volutpat nunc sit amet metus.","2026-01-02","income","ARS",56990473,"56990473",4,8),
  (1408,"convallis erat, eget tincidunt dui augue eu tellus. Phasellus","2025-01-07","income","ARS",49768564,"49768564",5,6),
  (1409,"auctor vitae, aliquet nec, imperdiet nec,","2026-02-26","income","ARS",15733816,"15733816",3,1),
  (1410,"mauris blandit mattis. Cras eget","2026-02-11","expense","ARS",84045271,"84045271",5,12);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1411,"eleifend nec, malesuada ut, sem. Nulla interdum.","2025-08-15","income","ARS",40826218,"40826218",1,6),
  (1412,"egestas nunc sed libero. Proin","2025-10-28","income","ARS",42557708,"42557708",5,11),
  (1413,"vitae, posuere at, velit. Cras lorem lorem, luctus ut, pellentesque","2025-09-22","income","ARS",65931869,"65931869",4,4),
  (1414,"justo nec ante. Maecenas mi","2025-06-09","expense","ARS",69962667,"69962667",5,2),
  (1415,"eu dui. Cum sociis natoque","2026-03-11","expense","ARS",97216863,"97216863",2,13),
  (1416,"dapibus ligula. Aliquam erat","2026-01-20","income","ARS",99966176,"99966176",4,10),
  (1417,"mi lacinia mattis. Integer","2026-03-11","income","ARS",31053861,"31053861",4,11),
  (1418,"Nunc quis arcu vel quam dignissim pharetra. Nam ac","2025-12-16","expense","ARS",94009278,"94009278",2,12),
  (1419,"consectetuer rhoncus. Nullam velit","2025-09-16","income","ARS",66286189,"66286189",4,2),
  (1420,"dignissim magna a tortor.","2026-03-30","expense","ARS",28533151,"28533151",3,7);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1421,"non, feugiat nec, diam. Duis mi enim,","2025-07-15","expense","ARS",46147281,"46147281",1,1),
  (1422,"Integer mollis. Integer tincidunt","2026-03-31","income","ARS",61015128,"61015128",4,5),
  (1423,"Nunc ullamcorper, velit in aliquet lobortis, nisi nibh lacinia orci,","2025-04-12","income","ARS",81502422,"81502422",2,5),
  (1424,"vestibulum nec, euismod in, dolor. Fusce","2025-04-03","income","ARS",4276822,"4276822",3,9),
  (1425,"luctus vulputate, nisi sem semper erat, in consectetuer ipsum","2026-03-09","expense","ARS",83998423,"83998423",4,11),
  (1426,"dolor dapibus gravida. Aliquam tincidunt, nunc","2025-09-19","expense","ARS",35561711,"35561711",5,12),
  (1427,"Curabitur egestas nunc sed libero. Proin sed turpis","2025-04-04","income","ARS",83980851,"83980851",1,11),
  (1428,"Mauris vel turpis. Aliquam adipiscing lobortis risus. In mi pede,","2025-01-05","income","ARS",56150195,"56150195",2,12),
  (1429,"orci luctus et ultrices posuere cubilia Curae Donec tincidunt. Donec","2024-12-20","expense","ARS",61092854,"61092854",5,2),
  (1430,"pretium aliquet, metus urna convallis erat, eget tincidunt dui augue","2026-05-19","income","ARS",21224729,"21224729",2,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1431,"a nunc. In at pede. Cras","2026-04-23","expense","ARS",23810535,"23810535",5,4),
  (1432,"lorem ipsum sodales purus, in molestie tortor nibh sit amet","2026-01-09","income","ARS",98480219,"98480219",4,7),
  (1433,"libero. Integer in magna. Phasellus dolor elit,","2026-03-01","income","ARS",83452542,"83452542",2,13),
  (1434,"rutrum non, hendrerit id, ante. Nunc mauris sapien,","2025-09-29","income","ARS",43329214,"43329214",2,4),
  (1435,"Etiam ligula tortor, dictum eu, placerat eget, venenatis a,","2025-12-05","income","ARS",87713253,"87713253",4,10),
  (1436,"pellentesque massa lobortis ultrices. Vivamus rhoncus.","2025-02-10","expense","ARS",30487588,"30487588",3,8),
  (1437,"ornare. Fusce mollis. Duis sit amet diam","2026-03-23","income","ARS",3154769,"3154769",2,9),
  (1438,"a sollicitudin orci sem eget massa. Suspendisse eleifend.","2025-08-20","income","ARS",55690283,"55690283",3,12),
  (1439,"id, ante. Nunc mauris sapien,","2025-02-07","income","ARS",96561778,"96561778",3,12),
  (1440,"metus facilisis lorem tristique aliquet. Phasellus fermentum convallis ligula. Donec","2026-02-04","income","ARS",33973290,"33973290",3,1);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1441,"nunc ac mattis ornare, lectus ante dictum","2025-05-12","expense","ARS",67718025,"67718025",2,9),
  (1442,"non massa non ante bibendum ullamcorper. Duis cursus, diam","2026-03-31","income","ARS",43942729,"43942729",5,9),
  (1443,"mi pede, nonummy ut, molestie in, tempus eu,","2025-11-13","income","ARS",17205001,"17205001",2,2),
  (1444,"magna a neque. Nullam ut nisi a odio","2025-09-04","income","ARS",81761281,"81761281",1,3),
  (1445,"Duis dignissim tempor arcu. Vestibulum","2025-08-25","income","ARS",90159202,"90159202",3,9),
  (1446,"sodales nisi magna sed dui.","2025-12-08","income","ARS",38509997,"38509997",4,11),
  (1447,"tempor diam dictum sapien. Aenean massa. Integer vitae","2025-04-15","income","ARS",12599834,"12599834",4,3),
  (1448,"est, mollis non, cursus non,","2026-03-15","expense","ARS",42482801,"42482801",5,8),
  (1449,"sem, consequat nec, mollis vitae, posuere at,","2025-08-29","income","ARS",65978037,"65978037",3,6),
  (1450,"Cras eu tellus eu augue porttitor","2026-02-21","income","ARS",28844434,"28844434",3,2);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1451,"velit. Sed malesuada augue ut lacus. Nulla tincidunt, neque","2025-07-24","expense","ARS",74749759,"74749759",3,2),
  (1452,"lobortis, nisi nibh lacinia orci,","2025-01-27","expense","ARS",33367448,"33367448",4,10),
  (1453,"eu dui. Cum sociis natoque penatibus et magnis","2025-08-13","expense","ARS",30310062,"30310062",3,10),
  (1454,"amet, faucibus ut, nulla. Cras eu tellus","2025-11-17","expense","ARS",32878084,"32878084",1,8),
  (1455,"In faucibus. Morbi vehicula. Pellentesque tincidunt tempus risus. Donec","2026-03-08","income","ARS",89639752,"89639752",2,2),
  (1456,"condimentum. Donec at arcu. Vestibulum ante ipsum","2026-03-25","expense","ARS",89120443,"89120443",5,2),
  (1457,"lacus. Mauris non dui nec urna suscipit nonummy. Fusce","2025-07-08","expense","ARS",65996168,"65996168",4,4),
  (1458,"Morbi vehicula. Pellentesque tincidunt tempus risus. Donec egestas.","2025-04-26","expense","ARS",42889943,"42889943",5,2),
  (1459,"ut erat. Sed nunc est, mollis non, cursus non,","2026-03-25","income","ARS",20739719,"20739719",2,5),
  (1460,"ipsum. Suspendisse non leo. Vivamus","2025-05-02","income","ARS",86555622,"86555622",3,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1461,"et netus et malesuada fames ac turpis","2025-04-12","income","ARS",19979950,"19979950",3,11),
  (1462,"urna et arcu imperdiet ullamcorper. Duis at lacus.","2025-10-01","expense","ARS",33247814,"33247814",2,2),
  (1463,"amet, risus. Donec nibh enim, gravida","2025-03-23","expense","ARS",30084328,"30084328",4,7),
  (1464,"In nec orci. Donec nibh. Quisque","2025-01-07","expense","ARS",91615532,"91615532",5,2),
  (1465,"ante ipsum primis in faucibus orci luctus et","2025-06-25","income","ARS",44819120,"44819120",4,11),
  (1466,"tempus, lorem fringilla ornare placerat,","2025-12-10","income","ARS",39981532,"39981532",2,9),
  (1467,"mauris, rhoncus id, mollis nec,","2025-03-25","income","ARS",58146192,"58146192",4,4),
  (1468,"non nisi. Aenean eget metus. In","2026-03-02","income","ARS",32797409,"32797409",2,6),
  (1469,"Curabitur egestas nunc sed","2026-04-18","income","ARS",43609974,"43609974",2,2),
  (1470,"magna. Suspendisse tristique neque venenatis lacus.","2025-04-18","income","ARS",36568259,"36568259",3,6);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1471,"felis. Donec tempor, est ac mattis semper, dui lectus","2025-06-16","income","ARS",3802488,"3802488",4,10),
  (1472,"sit amet massa. Quisque porttitor eros nec","2025-09-16","expense","ARS",40488289,"40488289",3,10),
  (1473,"cursus et, magna. Praesent interdum ligula eu enim. Etiam","2026-02-22","income","ARS",2144322,"2144322",5,8),
  (1474,"elit. Etiam laoreet, libero et tristique pellentesque, tellus sem mollis","2026-05-19","income","ARS",83241123,"83241123",4,8),
  (1475,"tempus eu, ligula. Aenean euismod mauris eu","2026-01-09","income","ARS",46424392,"46424392",2,13),
  (1476,"nunc sit amet metus. Aliquam erat volutpat.","2026-04-06","income","ARS",58174803,"58174803",3,10),
  (1477,"Quisque imperdiet, erat nonummy ultricies ornare, elit","2025-08-18","expense","ARS",67601799,"67601799",2,4),
  (1478,"vel arcu eu odio tristique pharetra. Quisque ac libero nec","2026-06-04","expense","ARS",32515558,"32515558",2,6),
  (1479,"eleifend, nunc risus varius orci,","2026-03-29","income","ARS",60832815,"60832815",4,7),
  (1480,"In condimentum. Donec at arcu.","2025-11-28","income","ARS",15349326,"15349326",3,9);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1481,"dui. Cum sociis natoque penatibus et","2025-02-05","income","ARS",15384951,"15384951",3,11),
  (1482,"Quisque imperdiet, erat nonummy ultricies ornare, elit elit","2026-03-04","expense","ARS",58734503,"58734503",1,3),
  (1483,"accumsan laoreet ipsum. Curabitur consequat, lectus","2024-12-25","income","ARS",66993561,"66993561",3,9),
  (1484,"cubilia Curae Phasellus ornare. Fusce mollis. Duis sit amet","2026-06-05","expense","ARS",76406927,"76406927",3,13),
  (1485,"In at pede. Cras vulputate velit eu sem. Pellentesque","2026-03-13","expense","ARS",39767917,"39767917",2,4),
  (1486,"neque et nunc. Quisque ornare tortor at risus. Nunc","2025-07-23","expense","ARS",58409592,"58409592",3,2),
  (1487,"auctor velit. Aliquam nisl. Nulla","2025-10-28","expense","ARS",86965030,"86965030",3,12),
  (1488,"eu, ultrices sit amet, risus. Donec nibh","2026-05-04","income","ARS",15013868,"15013868",3,3),
  (1489,"Curabitur dictum. Phasellus in","2025-08-22","expense","ARS",25878583,"25878583",4,7),
  (1490,"mauris erat eget ipsum. Suspendisse sagittis. Nullam","2025-03-03","expense","ARS",66181312,"66181312",3,10);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1491,"dapibus rutrum, justo. Praesent luctus. Curabitur egestas nunc","2026-02-14","income","ARS",15117666,"15117666",4,6),
  (1492,"Aliquam vulputate ullamcorper magna. Sed eu eros. Nam","2026-03-27","expense","ARS",99878120,"99878120",3,5),
  (1493,"vitae sodales nisi magna sed","2025-07-24","income","ARS",402465,"402465",1,10),
  (1494,"lobortis mauris. Suspendisse aliquet molestie tellus. Aenean egestas hendrerit","2026-01-10","income","ARS",77395310,"77395310",4,10),
  (1495,"ut cursus luctus, ipsum leo elementum sem,","2025-06-21","expense","ARS",21595496,"21595496",4,3),
  (1496,"Nullam lobortis quam a felis ullamcorper viverra.","2025-06-15","expense","ARS",23244894,"23244894",1,13),
  (1497,"risus. Donec nibh enim, gravida sit","2026-01-07","expense","ARS",49711599,"49711599",3,10),
  (1498,"Integer sem elit, pharetra","2025-11-25","income","ARS",95366333,"95366333",1,1),
  (1499,"Duis volutpat nunc sit amet metus. Aliquam erat volutpat.","2026-04-16","expense","ARS",21856736,"21856736",5,7),
  (1500,"Aenean eget metus. In nec orci. Donec nibh. Quisque","2026-02-24","income","ARS",27504172,"27504172",1,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1501,"arcu. Vestibulum ante ipsum primis in faucibus","2025-12-27","expense","ARS",42934650,"42934650",3,13),
  (1502,"eget odio. Aliquam vulputate ullamcorper magna. Sed eu","2026-04-11","expense","ARS",61607262,"61607262",1,2),
  (1503,"egestas ligula. Nullam feugiat placerat velit. Quisque","2024-12-22","income","ARS",29537036,"29537036",4,7),
  (1504,"In mi pede, nonummy ut, molestie in, tempus eu,","2025-12-17","expense","ARS",12569203,"12569203",3,6),
  (1505,"dui lectus rutrum urna, nec","2025-07-28","income","ARS",66087731,"66087731",1,7),
  (1506,"facilisis, magna tellus faucibus leo,","2025-11-14","income","ARS",5043958,"5043958",3,5),
  (1507,"dui, nec tempus mauris erat","2026-04-07","expense","ARS",650101,"650101",4,10),
  (1508,"ornare. Fusce mollis. Duis sit amet diam eu","2025-08-24","expense","ARS",23431428,"23431428",5,7),
  (1509,"tellus non magna. Nam ligula elit,","2025-12-14","expense","ARS",843116,"843116",4,6),
  (1510,"adipiscing, enim mi tempor lorem, eget","2025-11-11","expense","ARS",52909019,"52909019",4,3);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1511,"rutrum urna, nec luctus felis purus ac tellus. Suspendisse sed","2026-01-19","income","ARS",28812402,"28812402",1,7),
  (1512,"volutpat nunc sit amet metus. Aliquam erat volutpat.","2026-06-11","expense","ARS",61774012,"61774012",2,11),
  (1513,"vitae erat vel pede blandit","2025-06-09","expense","ARS",29722421,"29722421",2,2),
  (1514,"convallis in, cursus et, eros. Proin ultrices. Duis","2025-09-01","income","ARS",10509316,"10509316",2,10),
  (1515,"quis arcu vel quam dignissim","2025-10-01","expense","ARS",72029411,"72029411",5,10),
  (1516,"blandit congue. In scelerisque scelerisque dui. Suspendisse ac metus","2025-01-20","expense","ARS",36268972,"36268972",3,11),
  (1517,"mi. Aliquam gravida mauris","2025-06-19","expense","ARS",44040460,"44040460",4,11),
  (1518,"egestas. Aliquam nec enim. Nunc ut erat. Sed nunc","2025-11-09","expense","ARS",27495436,"27495436",2,4),
  (1519,"dis parturient montes, nascetur ridiculus mus. Donec dignissim magna a","2025-11-10","expense","ARS",15399717,"15399717",2,11),
  (1520,"montes, nascetur ridiculus mus. Proin","2026-06-09","income","ARS",35100094,"35100094",1,11);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1521,"dignissim pharetra. Nam ac nulla. In","2026-01-27","expense","ARS",54223032,"54223032",1,9),
  (1522,"mus. Proin vel arcu eu odio tristique pharetra.","2025-06-23","income","ARS",74472251,"74472251",4,5),
  (1523,"libero. Morbi accumsan laoreet","2025-08-08","expense","ARS",74188166,"74188166",3,1),
  (1524,"Nam ac nulla. In","2025-01-05","income","ARS",53403434,"53403434",3,10),
  (1525,"porttitor vulputate, posuere vulputate, lacus. Cras interdum. Nunc sollicitudin","2025-11-01","income","ARS",79476713,"79476713",2,11),
  (1526,"sed tortor. Integer aliquam adipiscing lacus. Ut","2026-04-22","expense","ARS",1321537,"1321537",4,4),
  (1527,"interdum feugiat. Sed nec metus facilisis lorem tristique","2025-11-17","income","ARS",8126012,"8126012",4,8),
  (1528,"lacinia orci, consectetuer euismod","2025-08-11","expense","ARS",17450266,"17450266",2,10),
  (1529,"Donec vitae erat vel pede blandit congue. In","2025-07-27","expense","ARS",52035423,"52035423",3,3),
  (1530,"in consectetuer ipsum nunc id enim. Curabitur massa. Vestibulum","2026-04-20","income","ARS",19137556,"19137556",3,13);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1531,"orci, consectetuer euismod est arcu ac orci. Ut semper","2025-12-09","income","ARS",15680200,"15680200",3,11),
  (1532,"nunc sed libero. Proin sed turpis nec mauris","2025-11-09","income","ARS",70148851,"70148851",2,2),
  (1533,"eget, venenatis a, magna. Lorem","2026-05-25","income","ARS",76285617,"76285617",5,4),
  (1534,"euismod in, dolor. Fusce feugiat.","2025-09-30","income","ARS",23351992,"23351992",3,2),
  (1535,"Sed diam lorem, auctor quis, tristique ac, eleifend vitae,","2025-11-07","expense","ARS",20372062,"20372062",3,2),
  (1536,"in lobortis tellus justo sit amet nulla.","2026-04-04","income","ARS",47705902,"47705902",2,11),
  (1537,"tincidunt tempus risus. Donec egestas.","2025-11-10","expense","ARS",74225669,"74225669",3,6),
  (1538,"sit amet, consectetuer adipiscing","2026-03-08","expense","ARS",48694428,"48694428",1,11),
  (1539,"scelerisque scelerisque dui. Suspendisse ac","2025-05-15","expense","ARS",89018738,"89018738",4,1),
  (1540,"scelerisque mollis. Phasellus libero mauris, aliquam","2026-03-09","expense","ARS",65432559,"65432559",5,8);
INSERT INTO `movements` (`id`,`details`,`date`,`mov_type`,`currency`,`original_amount`,`ars_amount`,`account_id`,`category_id`)
VALUES
  (1541,"Cras vulputate velit eu sem. Pellentesque ut ipsum","2026-03-27","income","ARS",53470742,"53470742",1,3),
  (1542,"nec orci. Donec nibh. Quisque nonummy ipsum non arcu.","2025-11-05","expense","ARS",36218885,"36218885",5,13),
  (1543,"Quisque imperdiet, erat nonummy ultricies ornare, elit elit fermentum","2025-01-05","income","ARS",41783179,"41783179",3,2),
  (1544,"lorem, sit amet ultricies sem magna nec quam.","2025-01-04","expense","ARS",6201156,"6201156",3,8),
  (1545,"quis, tristique ac, eleifend vitae, erat. Vivamus","2025-11-26","income","ARS",24938895,"24938895",3,4),
  (1546,"nibh sit amet orci. Ut","2025-05-24","expense","ARS",97674816,"97674816",5,9),
  (1547,"Mauris quis turpis vitae","2025-07-31","expense","ARS",81054150,"81054150",4,12),
  (1548,"at sem molestie sodales. Mauris blandit","2026-05-18","expense","ARS",37440999,"37440999",1,2),
  (1549,"tellus. Suspendisse sed dolor.","2025-03-01","income","ARS",90234708,"90234708",2,2),
  (1550,"dis parturient montes, nascetur ridiculus mus. Aenean eget magna.","2025-10-14","expense","ARS",80693842,"80693842",3,3);




INSERT INTO purchases (id, price, quantity, mov_id, item_id, store_id) VALUES
(1, 8000000, 2, 2, 1, 1),
(2, 12000000, 5, 2, 5, 1),
(3, 15000000, 3, 2, 26, 14),
(4, 10000000, 2, 2, 9, 1),
(5, 6000000, 1, 7, 3, 1),
(6, 8000000, 4, 7, 6, 1),
(7, 9000000, 3, 7, 23, 4),
(8, 14000000, 2, 12, 26, 14),
(9, 10000000, 5, 12, 5, 1),
(10, 12000000, 3, 12, 31, 4),
(11, 8000000, 2, 12, 1, 1),
(12, 6000000, 1, 17, 14, 1),
(13, 20000000, 4, 17, 26, 14),
(14, 15000000, 3, 17, 35, 4),
(15, 10000000, 2, 23, 1, 1),
(16, 12000000, 3, 23, 6, 1),
(17, 14000000, 2, 23, 26, 14),
(18, 8000000, 4, 27, 5, 1),
(19, 10000000, 2, 27, 9, 1),
(20, 12000000, 3, 31, 3, 1),
(21, 16000000, 4, 31, 26, 14),
(22, 14000000, 2, 31, 23, 4),
(23, 8000000, 2, 36, 1, 1),
(24, 18000000, 3, 36, 26, 14),
(25, 12000000, 4, 36, 35, 4),
(26, 10000000, 2, 40, 3, 1),
(27, 14000000, 3, 40, 6, 1),
(28, 16000000, 2, 40, 26, 14),
(29, 8000000, 1, 46, 9, 1),
(30, 18000000, 4, 46, 26, 14),
(31, 12000000, 3, 46, 31, 4),
(32, 8000000, 2, 2, 2, 1),
(33, 6000000, 1, 7, 11, 1),
(34, 10000000, 2, 12, 24, 4),
(35, 14000000, 3, 17, 27, 14),
(36, 9000000, 2, 23, 12, 1),
(37, 11000000, 1, 27, 28, 14),
(38, 7000000, 3, 31, 22, 4),
(39, 13000000, 2, 36, 33, 4),
(40, 15000000, 2, 40, 34, 4),
(41, 9000000, 1, 46, 41, 15),
(42, 10000000, 2, 2, 19, 1),
(43, 8000000, 1, 7, 21, 1),
(44, 12000000, 3, 12, 25, 4),
(45, 14000000, 2, 17, 29, 14),
(46, 10000000, 3, 23, 36, 4),
(47, 11000000, 1, 27, 43, 4),
(48, 13000000, 2, 31, 37, 4),
(49, 15000000, 3, 36, 44, 4),
(50, 9000000, 2, 40, 42, 15),
(51, 11000000, 1, 46, 15, 1),
(52, 7000000, 2, 2, 49, 15),
(53, 9000000, 3, 7, 50, 1),
(54, 10000000, 1, 12, 58, 1),
(55, 12000000, 2, 17, 60, 13),
(56, 8000000, 3, 23, 16, 1),
(57, 14000000, 1, 27, 51, 1),
(58, 10000000, 2, 31, 52, 1),
(59, 11000000, 3, 36, 53, 1),
(60, 13000000, 2, 40, 54, 1);

INSERT INTO groups (id, name, description) VALUES
(1, 'Test group with fake data', 'All grocery purchases for a month'),
(2, 'Transportation Expenses', 'Gas and fuel related expenses'),
(3, 'Entertainment', 'Movies, dining, and leisure'),
(4, 'Healthcare', 'Medical and pharmacy expenses'),
(5, 'Utilities', 'Water, electricity, internet bills');

INSERT INTO movements_groups (id, mov_id, group_id) VALUES
(1, 2, 2),
(2, 7, 2),
(3, 12, 2),
(4, 17, 2),
(5, 23, 2),
(6, 27, 2),
(7, 31, 2),
(8, 36, 2),
(9, 40, 2),
(10, 46, 2),
(11, 3, 2),
(12, 14, 2),
(13, 22, 2),
(14, 32, 2),
(15, 41, 2),
(16, 8, 3),
(17, 10, 3),
(18, 15, 3),
(19, 24, 3),
(20, 29, 3),
(21, 33, 3),
(22, 38, 3),
(23, 42, 3),
(24, 48, 3),
(25, 9, 4),
(26, 25, 4),
(27, 34, 4),
(28, 43, 4),
(29, 5, 5),
(30, 18, 5),
(31, 28, 5),
(32, 37, 5);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (33,1,1),
  (34,2,1),
  (35,3,1),
  (36,4,1),
  (37,5,1),
  (38,6,1),
  (39,7,1),
  (40,8,1),
  (41,9,1),
  (42,10,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (43,11,1),
  (44,12,1),
  (45,13,1),
  (46,14,1),
  (47,15,1),
  (48,16,1),
  (49,17,1),
  (50,18,1),
  (51,19,1),
  (52,20,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (53,21,1),
  (54,22,1),
  (55,23,1),
  (56,24,1),
  (57,25,1),
  (58,26,1),
  (59,27,1),
  (60,28,1),
  (61,29,1),
  (62,30,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (63,31,1),
  (64,32,1),
  (65,33,1),
  (66,34,1),
  (67,35,1),
  (68,36,1),
  (69,37,1),
  (70,38,1),
  (71,39,1),
  (72,40,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (73,41,1),
  (74,42,1),
  (75,43,1),
  (76,44,1),
  (77,45,1),
  (78,46,1),
  (79,47,1),
  (80,48,1),
  (81,49,1),
  (82,50,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (83,51,1),
  (84,52,1),
  (85,53,1),
  (86,54,1),
  (87,55,1),
  (88,56,1),
  (89,57,1),
  (90,58,1),
  (91,59,1),
  (92,60,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (93,61,1),
  (94,62,1),
  (95,63,1),
  (96,64,1),
  (97,65,1),
  (98,66,1),
  (99,67,1),
  (100,68,1),
  (101,69,1),
  (102,70,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (103,71,1),
  (104,72,1),
  (105,73,1),
  (106,74,1),
  (107,75,1),
  (108,76,1),
  (109,77,1),
  (110,78,1),
  (111,79,1),
  (112,80,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (113,81,1),
  (114,82,1),
  (115,83,1),
  (116,84,1),
  (117,85,1),
  (118,86,1),
  (119,87,1),
  (120,88,1),
  (121,89,1),
  (122,90,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (123,91,1),
  (124,92,1),
  (125,93,1),
  (126,94,1),
  (127,95,1),
  (128,96,1),
  (129,97,1),
  (130,98,1),
  (131,99,1),
  (132,100,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (133,101,1),
  (134,102,1),
  (135,103,1),
  (136,104,1),
  (137,105,1),
  (138,106,1),
  (139,107,1),
  (140,108,1),
  (141,109,1),
  (142,110,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (143,111,1),
  (144,112,1),
  (145,113,1),
  (146,114,1),
  (147,115,1),
  (148,116,1),
  (149,117,1),
  (150,118,1),
  (151,119,1),
  (152,120,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (153,121,1),
  (154,122,1),
  (155,123,1),
  (156,124,1),
  (157,125,1),
  (158,126,1),
  (159,127,1),
  (160,128,1),
  (161,129,1),
  (162,130,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (163,131,1),
  (164,132,1),
  (165,133,1),
  (166,134,1),
  (167,135,1),
  (168,136,1),
  (169,137,1),
  (170,138,1),
  (171,139,1),
  (172,140,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (173,141,1),
  (174,142,1),
  (175,143,1),
  (176,144,1),
  (177,145,1),
  (178,146,1),
  (179,147,1),
  (180,148,1),
  (181,149,1),
  (182,150,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (183,151,1),
  (184,152,1),
  (185,153,1),
  (186,154,1),
  (187,155,1),
  (188,156,1),
  (189,157,1),
  (190,158,1),
  (191,159,1),
  (192,160,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (193,161,1),
  (194,162,1),
  (195,163,1),
  (196,164,1),
  (197,165,1),
  (198,166,1),
  (199,167,1),
  (200,168,1),
  (201,169,1),
  (202,170,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (203,171,1),
  (204,172,1),
  (205,173,1),
  (206,174,1),
  (207,175,1),
  (208,176,1),
  (209,177,1),
  (210,178,1),
  (211,179,1),
  (212,180,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (213,181,1),
  (214,182,1),
  (215,183,1),
  (216,184,1),
  (217,185,1),
  (218,186,1),
  (219,187,1),
  (220,188,1),
  (221,189,1),
  (222,190,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (223,191,1),
  (224,192,1),
  (225,193,1),
  (226,194,1),
  (227,195,1),
  (228,196,1),
  (229,197,1),
  (230,198,1),
  (231,199,1),
  (232,200,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (233,201,1),
  (234,202,1),
  (235,203,1),
  (236,204,1),
  (237,205,1),
  (238,206,1),
  (239,207,1),
  (240,208,1),
  (241,209,1),
  (242,210,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (243,211,1),
  (244,212,1),
  (245,213,1),
  (246,214,1),
  (247,215,1),
  (248,216,1),
  (249,217,1),
  (250,218,1),
  (251,219,1),
  (252,220,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (253,221,1),
  (254,222,1),
  (255,223,1),
  (256,224,1),
  (257,225,1),
  (258,226,1),
  (259,227,1),
  (260,228,1),
  (261,229,1),
  (262,230,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (263,231,1),
  (264,232,1),
  (265,233,1),
  (266,234,1),
  (267,235,1),
  (268,236,1),
  (269,237,1),
  (270,238,1),
  (271,239,1),
  (272,240,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (273,241,1),
  (274,242,1),
  (275,243,1),
  (276,244,1),
  (277,245,1),
  (278,246,1),
  (279,247,1),
  (280,248,1),
  (281,249,1),
  (282,250,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (283,251,1),
  (284,252,1),
  (285,253,1),
  (286,254,1),
  (287,255,1),
  (288,256,1),
  (289,257,1),
  (290,258,1),
  (291,259,1),
  (292,260,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (293,261,1),
  (294,262,1),
  (295,263,1),
  (296,264,1),
  (297,265,1),
  (298,266,1),
  (299,267,1),
  (300,268,1),
  (301,269,1),
  (302,270,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (303,271,1),
  (304,272,1),
  (305,273,1),
  (306,274,1),
  (307,275,1),
  (308,276,1),
  (309,277,1),
  (310,278,1),
  (311,279,1),
  (312,280,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (313,281,1),
  (314,282,1),
  (315,283,1),
  (316,284,1),
  (317,285,1),
  (318,286,1),
  (319,287,1),
  (320,288,1),
  (321,289,1),
  (322,290,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (323,291,1),
  (324,292,1),
  (325,293,1),
  (326,294,1),
  (327,295,1),
  (328,296,1),
  (329,297,1),
  (330,298,1),
  (331,299,1),
  (332,300,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (333,301,1),
  (334,302,1),
  (335,303,1),
  (336,304,1),
  (337,305,1),
  (338,306,1),
  (339,307,1),
  (340,308,1),
  (341,309,1),
  (342,310,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (343,311,1),
  (344,312,1),
  (345,313,1),
  (346,314,1),
  (347,315,1),
  (348,316,1),
  (349,317,1),
  (350,318,1),
  (351,319,1),
  (352,320,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (353,321,1),
  (354,322,1),
  (355,323,1),
  (356,324,1),
  (357,325,1),
  (358,326,1),
  (359,327,1),
  (360,328,1),
  (361,329,1),
  (362,330,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (363,331,1),
  (364,332,1),
  (365,333,1),
  (366,334,1),
  (367,335,1),
  (368,336,1),
  (369,337,1),
  (370,338,1),
  (371,339,1),
  (372,340,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (373,341,1),
  (374,342,1),
  (375,343,1),
  (376,344,1),
  (377,345,1),
  (378,346,1),
  (379,347,1),
  (380,348,1),
  (381,349,1),
  (382,350,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (383,351,1),
  (384,352,1),
  (385,353,1),
  (386,354,1),
  (387,355,1),
  (388,356,1),
  (389,357,1),
  (390,358,1),
  (391,359,1),
  (392,360,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (393,361,1),
  (394,362,1),
  (395,363,1),
  (396,364,1),
  (397,365,1),
  (398,366,1),
  (399,367,1),
  (400,368,1),
  (401,369,1),
  (402,370,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (403,371,1),
  (404,372,1),
  (405,373,1),
  (406,374,1),
  (407,375,1),
  (408,376,1),
  (409,377,1),
  (410,378,1),
  (411,379,1),
  (412,380,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (413,381,1),
  (414,382,1),
  (415,383,1),
  (416,384,1),
  (417,385,1),
  (418,386,1),
  (419,387,1),
  (420,388,1),
  (421,389,1),
  (422,390,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (423,391,1),
  (424,392,1),
  (425,393,1),
  (426,394,1),
  (427,395,1),
  (428,396,1),
  (429,397,1),
  (430,398,1),
  (431,399,1),
  (432,400,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (433,401,1),
  (434,402,1),
  (435,403,1),
  (436,404,1),
  (437,405,1),
  (438,406,1),
  (439,407,1),
  (440,408,1),
  (441,409,1),
  (442,410,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (443,411,1),
  (444,412,1),
  (445,413,1),
  (446,414,1),
  (447,415,1),
  (448,416,1),
  (449,417,1),
  (450,418,1),
  (451,419,1),
  (452,420,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (453,421,1),
  (454,422,1),
  (455,423,1),
  (456,424,1),
  (457,425,1),
  (458,426,1),
  (459,427,1),
  (460,428,1),
  (461,429,1),
  (462,430,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (463,431,1),
  (464,432,1),
  (465,433,1),
  (466,434,1),
  (467,435,1),
  (468,436,1),
  (469,437,1),
  (470,438,1),
  (471,439,1),
  (472,440,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (473,441,1),
  (474,442,1),
  (475,443,1),
  (476,444,1),
  (477,445,1),
  (478,446,1),
  (479,447,1),
  (480,448,1),
  (481,449,1),
  (482,450,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (483,451,1),
  (484,452,1),
  (485,453,1),
  (486,454,1),
  (487,455,1),
  (488,456,1),
  (489,457,1),
  (490,458,1),
  (491,459,1),
  (492,460,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (493,461,1),
  (494,462,1),
  (495,463,1),
  (496,464,1),
  (497,465,1),
  (498,466,1),
  (499,467,1),
  (500,468,1),
  (501,469,1),
  (502,470,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (503,471,1),
  (504,472,1),
  (505,473,1),
  (506,474,1),
  (507,475,1),
  (508,476,1),
  (509,477,1),
  (510,478,1),
  (511,479,1),
  (512,480,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (513,481,1),
  (514,482,1),
  (515,483,1),
  (516,484,1),
  (517,485,1),
  (518,486,1),
  (519,487,1),
  (520,488,1),
  (521,489,1),
  (522,490,1);
INSERT INTO `movements_groups` (`id`,`mov_id`,`group_id`)
VALUES
  (523,491,1),
  (524,492,1),
  (525,493,1),
  (526,494,1),
  (527,495,1),
  (528,496,1),
  (529,497,1),
  (530,498,1),
  (531,499,1),
  (532,500,1);
