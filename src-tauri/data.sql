-- =============================================================
--  Orbit — Data Real
--  Generado: 2026-04-24
--  Convenciones:
--    - Todos los montos en centavos (INTEGER)
--    - Todos los movimientos son ARS → exchange_rate y rate_type NULL
--    - Todos los movimientos son ANTERIORES al snapshot
--    - El snapshot refleja el balance actual al 2026-04-24
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
--  ACCOUNTS
-- -------------------------------------------------------------
INSERT INTO accounts (id, name, acc_type, currency, notes, created_at) VALUES
    (1, 'Mercado Pago', 'Billetera virtual', 'ARS', NULL, '2024-07-01 00:00:00'),
    (2, 'Efectivo',     'Efectivo',          'ARS', NULL, '2024-07-01 00:00:00'),
    (3, 'Banco Galicia','Banco',             'ARS', NULL, '2024-07-01 00:00:00');

-- -------------------------------------------------------------
--  BALANCE SNAPSHOTS
--  Fecha: 2026-04-24. Todos los movimientos son anteriores,
--  por lo tanto snapshot = balance actual.
--    Mercado Pago: $8.718,81 → 871881 centavos
--    Efectivo:     $1.800    → 180000 centavos
--    Banco Galicia: $0       → 0 centavos
-- -------------------------------------------------------------
INSERT INTO balance_snapshots (id, account_id, balance, snapshot_date, created_at) VALUES
    (1, 1, 871881, '2026-04-24', '2026-04-24 00:51:00'),
    (2, 2, 180000, '2026-04-24', '2026-04-24 00:51:00'),
    (3, 3,      0, '2026-04-24', '2026-04-24 00:51:00');

-- -------------------------------------------------------------
--  CATEGORIES
-- -------------------------------------------------------------
INSERT INTO categories (id, name, created_at) VALUES
    (1, 'Supermercado', '2024-07-01 00:00:00'),
    (2, 'Cafetería',    '2025-05-11 00:00:00'),
    (3, 'Indumentaria', '2026-04-11 00:00:00');

-- -------------------------------------------------------------
--  STORES
-- -------------------------------------------------------------
INSERT INTO stores (id, name, created_at) VALUES
    (1, 'Cosmos77',              '2024-07-20 18:08:00'),
    (2, 'Super chino Chen Qiong','2024-10-10 17:51:00'),
    (3, 'Dorotea Casa de Café',  '2025-05-11 18:13:00');

-- -------------------------------------------------------------
--  ITEMS
--  brand NULL cuando es genérico o no identificable.
-- -------------------------------------------------------------
INSERT INTO items (id, name, brand, created_at) VALUES
    ( 1, 'Galletitas Traviata x 3 Un x 324 g',                          'Traviata',      '2024-07-20 18:08:00'),
    ( 2, 'Desodorante Rexona',                                           'Rexona',        '2024-07-20 18:08:00'),
    ( 3, 'Tomate triturado Abeto x 950g',                                'Abeto',         '2024-07-20 18:08:00'),
    ( 4, 'Sal Fina Dos Estrellas x 500 g',                               'Dos Estrellas', '2024-07-20 18:08:00'),
    ( 5, 'Generico almacen',                                             NULL,            '2024-07-20 18:08:00'),
    ( 6, 'Hellmanns Doy Pack sabor Ajo x 250 g',                         'Hellmann''s',   '2024-10-10 17:51:00'),
    ( 7, 'Veneziana lacteado 600g',                                      NULL,            '2024-10-10 17:51:00'),
    ( 8, 'Galletitas Milka mousse choco x 16',                           'Milka',         '2024-10-10 17:51:00'),
    ( 9, 'Galletitas La providencia',                                    NULL,            '2024-12-20 19:21:00'),
    (10, 'Leche Entera Clásica La Serenísima Botella x 1 Lt',            'La Serenísima', '2024-12-20 19:21:00'),
    (11, 'Mermelada de Frutilla Dulcor x 454 g',                         'Dulcor',        '2024-12-20 19:21:00'),
    (12, 'Fideos nido Rebora',                                           'Rebora',        '2024-12-20 19:21:00'),
    (13, 'Esponja',                                                      NULL,            '2024-12-20 19:21:00'),
    (14, 'Jabón Liquido para Diluir SKIP 500 ml',                        'Skip',          '2024-12-20 19:21:00'),
    (15, 'Medallones de Carne Vacuna Express x 4 Paty x 276 g',          'Paty',          '2024-12-28 19:53:00'),
    (16, 'Pan',                                                          NULL,            '2025-01-04 20:38:00'),
    (17, 'Café irlandes',                                                NULL,            '2025-05-11 18:13:00'),
    (18, 'Alfajor havanna',                                              'Havanna',       '2025-05-11 18:13:00'),
    (19, 'Galletitas Dulces con Avena y Pasas Cereal Mix x 207 g',       'Cereal Mix',    '2025-05-16 17:27:00'),
    (20, 'Alfajor Chocolate negro Fantoche',                             'Fantoche',      '2026-01-02 18:54:00'),
    (21, 'Papel higienico Felpita 30m x 4',                              'Felpita',       '2026-01-02 18:54:00'),
    (22, 'Yerba Mate Palo Suave Playadito x 500 g',                      'Playadito',     '2026-01-02 18:54:00'),
    (23, 'Detergente Magistral Ultra Limón Botella 300ml',               'Magistral',     '2026-01-02 18:54:00'),
    (24, 'Café lagrima doble',                                           NULL,            '2026-01-20 19:26:00'),
    (25, 'Porción torta',                                                NULL,            '2026-01-20 19:26:00'),
    (26, 'Sueter beige talle L',                                         NULL,            '2026-04-11 11:34:00'),
    (27, 'Medias largas',                                                NULL,            '2026-04-11 12:53:00'),
    (28, 'Campera naranja oscuro talle L',                               NULL,            '2026-04-11 17:20:00'),
    (29, 'Camisa talle M',                                               NULL,            '2026-04-11 18:19:00'),
    (30, 'Pantalon Jean negro talle 40',                                 NULL,            '2026-04-11 18:19:00'),
    (31, 'Galletitas Dulces Harina Integral con Avena y Chips Cachafaz x 225 g', 'Cachafaz', '2026-04-17 16:53:00');

-- -------------------------------------------------------------
--  MOVEMENTS
--  Todos expense, todos ARS.
--  original_amount == ars_amount en todos los casos.
-- -------------------------------------------------------------
INSERT INTO movements (id, details, date, created_at, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id) VALUES
    -- 1: Cosmos77, Mercado Pago, $13.550
    ( 1, 'Compras en lo de Ezequiel',                  '2024-07-20', '2024-07-20 18:08:00', 'expense', 'ARS',  1355000,  1355000, NULL, NULL, 1, 1),
    -- 2: Super chino, Efectivo, $5.600
    ( 2, 'Compra en los chinos',                       '2024-10-10', '2024-10-10 17:51:00', 'expense', 'ARS',   560000,   560000, NULL, NULL, 2, 1),
    -- 3: Super chino, Efectivo, $22.100
    ( 3, 'Compra en los chinos',                       '2024-12-20', '2024-12-20 19:21:00', 'expense', 'ARS',  2210000,  2210000, NULL, NULL, 2, 1),
    -- 4: Super chino, Efectivo, $8.600
    ( 4, 'Compra en los chinos',                       '2024-12-28', '2024-12-28 19:53:00', 'expense', 'ARS',   860000,   860000, NULL, NULL, 2, 1),
    -- 5: Cosmos77, Mercado Pago, $11.850
    ( 5, 'Compras en lo de Ezequiel',                  '2025-01-04', '2025-01-04 20:38:00', 'expense', 'ARS',  1185000,  1185000, NULL, NULL, 1, 1),
    -- 6: Cosmos77, Mercado Pago, $14.710
    ( 6, 'Compra de productos',                        '2025-02-11', '2025-02-11 17:38:00', 'expense', 'ARS',  1471000,  1471000, NULL, NULL, 1, 1),
    -- 7: Dorotea, Mercado Pago, $7.400
    ( 7, 'Café con los pibes',                         '2025-05-11', '2025-05-11 18:13:00', 'expense', 'ARS',   740000,   740000, NULL, NULL, 1, 2),
    -- 8: Super chino, Efectivo, $13.200
    ( 8, 'Compras en los chinos, masitas',             '2025-05-16', '2025-05-16 17:27:00', 'expense', 'ARS',  1320000,  1320000, NULL, NULL, 2, 1),
    -- 9: Super chino, Efectivo, $23.000
    ( 9, 'Compras en los chinos',                      '2026-01-02', '2026-01-02 18:54:00', 'expense', 'ARS',  2300000,  2300000, NULL, NULL, 2, 1),
    -- 10: Dorotea, Mercado Pago, $8.900
    (10, 'Café con los pibes',                         '2026-01-20', '2026-01-20 19:26:00', 'expense', 'ARS',   890000,   890000, NULL, NULL, 1, 2),
    -- 11: Mercado Pago, $30.000
    (11, 'Compra de sueter color beige',               '2026-04-11', '2026-04-11 11:34:00', 'expense', 'ARS',  3000000,  3000000, NULL, NULL, 1, 3),
    -- 12: Mercado Pago, $16.000
    (12, 'Compra de 2 pares de medias largas',         '2026-04-11', '2026-04-11 12:53:00', 'expense', 'ARS',  1600000,  1600000, NULL, NULL, 1, 3),
    -- 13: Efectivo, $25.000
    (13, 'Compra de campera (descuento en efectivo)',   '2026-04-11', '2026-04-11 17:20:00', 'expense', 'ARS',  2500000,  2500000, NULL, NULL, 2, 3),
    -- 14: Mercado Pago, $56.000
    (14, 'Compra de camisa y jean',                    '2026-04-11', '2026-04-11 18:19:00', 'expense', 'ARS',  5600000,  5600000, NULL, NULL, 1, 3),
    -- 15: Super chino, Mercado Pago, $6.200
    (15, 'Compras en los chinos, masitas para merienda','2026-04-17', '2026-04-17 16:53:00', 'expense', 'ARS',   620000,   620000, NULL, NULL, 1, 1),
    -- 16: Super chino, Mercado Pago, $14.800
    (16, 'Compras en los chinos, productos de limpieza','2026-04-19', '2026-04-19 17:38:00', 'expense', 'ARS',  1480000,  1480000, NULL, NULL, 1, 1);

-- -------------------------------------------------------------
--  PURCHASES
--  price en centavos, misma moneda que el movimiento padre (ARS).
--  price = precio por unidad.
-- -------------------------------------------------------------
INSERT INTO purchases (id, price, quantity, mov_id, item_id, store_id) VALUES
    -- mov 1: Cosmos77 (store 1)
    ( 1,  137000, 3,  1,  1, 1),  -- Galletitas Traviata x3 @ $1.370 c/u
    ( 2,  228000, 1,  1,  2, 1),  -- Desodorante Rexona $2.280
    ( 3,  168000, 1,  1,  3, 1),  -- Tomate triturado Abeto $1.680
    ( 4,   58000, 1,  1,  4, 1),  -- Sal Fina Dos Estrellas $580
    ( 5,  490000, 1,  1,  5, 1),  -- Generico almacen $4.900

    -- mov 2: Super chino (store 2)
    ( 6,  150000, 1,  2,  6, 2),  -- Hellmanns Doy Pack $1.500
    ( 7,  230000, 1,  2,  7, 2),  -- Veneziana lacteado $2.300
    ( 8,  180000, 1,  2,  8, 2),  -- Galletitas Milka $1.800

    -- mov 3: Super chino (store 2)
    ( 9,  170000, 1,  3,  9, 2),  -- Galletitas La providencia $1.700
    (10,  190000, 1,  3, 10, 2),  -- Leche Serenísima $1.900
    (11,  250000, 1,  3, 11, 2),  -- Mermelada Dulcor $2.500
    (12,  200000, 2,  3, 12, 2),  -- Fideos nido Rebora x2 @ $2.000 c/u
    (13,  270000, 1,  3, 13, 2),  -- Esponja $2.700
    (14,  750000, 1,  3, 14, 2),  -- Jabón SKIP $7.500
    (15,  180000, 1,  3,  8, 2),  -- Galletitas Milka $1.800

    -- mov 4: Super chino (store 2)
    (16,  340000, 2,  4, 15, 2),  -- Medallones Paty x2 @ $3.400 c/u
    (17,  180000, 1,  4,  8, 2),  -- Galletitas Milka $1.800

    -- mov 5: Cosmos77 (store 1)
    (18,  105000, 2,  5, 16, 1),  -- Pan x2 @ $1.050 c/u
    (19,  315000, 2,  5, 15, 1),  -- Medallones Paty x2 @ $3.150 c/u
    (20,  195000, 1,  5,  5, 1),  -- Generico almacen $1.950
    (21,  150000, 1,  5,  5, 1),  -- Generico almacen $1.500

    -- mov 6: Cosmos77 (store 1)
    (22,  226000, 3,  6,  8, 1),  -- Galletitas Milka x3 @ $2.260 c/u
    (23,  233000, 1,  6, 10, 1),  -- Leche Serenísima $2.330
    (24,  560000, 1,  6,  5, 1),  -- Generico almacen $5.600

    -- mov 7: Dorotea (store 3)
    (25,  360000, 1,  7, 17, 3),  -- Café irlandes $3.600
    (26,  380000, 1,  7, 18, 3),  -- Alfajor Havanna $3.800

    -- mov 8: Super chino (store 2)
    (27,  200000, 2,  8, 10, 2),  -- Leche Serenísima x2 @ $2.000 c/u
    (28,  140000, 2,  8,  1, 2),  -- Galletitas Traviata x2 @ $1.400 c/u
    (29,  250000, 1,  8, 11, 2),  -- Mermelada Dulcor $2.500
    (30,  220000, 1,  8,  8, 2),  -- Galletitas Milka $2.200
    (31,  170000, 1,  8, 19, 2),  -- Galletitas Cereal Mix $1.700

    -- mov 9: Super chino (store 2)
    (32,  100000, 1,  9, 20, 2),  -- Alfajor Fantoche $1.000
    (33,  190000, 2,  9, 10, 2),  -- Leche Serenísima x2 @ $1.900 c/u
    (34,  160000, 1,  9, 21, 2),  -- Papel higienico Felpita $1.600
    (35,  250000, 1,  9, 22, 2),  -- Yerba Playadito $2.500
    (36,  430000, 1,  9, 15, 2),  -- Medallones Paty $4.300
    (37,  750000, 1,  9, 14, 2),  -- Jabón SKIP $7.500
    (38,  230000, 1,  9, 23, 2),  -- Detergente Magistral $2.300

    -- mov 10: Dorotea (store 3)
    (39,  220000, 1, 10, 24, 3),  -- Café lagrima doble $2.200
    (40,  670000, 1, 10, 25, 3),  -- Porción torta $6.700

    -- mov 11: sin tienda
    (41, 3000000, 1, 11, 26, NULL), -- Sueter beige talle L $30.000

    -- mov 12: sin tienda
    (42,  800000, 2, 12, 27, NULL), -- Medias largas x2 @ $8.000 c/u

    -- mov 13: sin tienda
    (43, 2500000, 1, 13, 28, NULL), -- Campera naranja oscuro talle L $25.000

    -- mov 14: sin tienda
    (44, 2600000, 1, 14, 29, NULL), -- Camisa talle M $26.000
    (45, 3000000, 1, 14, 30, NULL), -- Pantalon Jean negro talle 40 $30.000

    -- mov 15: Super chino (store 2)
    (46,  400000, 1, 15, 31, 2),  -- Galletitas Cachafaz $4.000
    (47,  220000, 1, 15, 19, 2),  -- Galletitas Cereal Mix $2.200

    -- mov 16: Super chino (store 2)
    (48, 1100000, 1, 16, 14, 2),  -- Jabón SKIP $11.000
    (49,  200000, 1, 16, 13, 2),  -- Esponja $2.000
    (50,  180000, 1, 16, 21, 2);  -- Papel higienico Felpita $1.800
