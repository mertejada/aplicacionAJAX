-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 04-02-2024 a las 22:08:18
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `Nebula`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `CodCat` int(11) NOT NULL,
  `NomCat` varchar(40) NOT NULL,
  `DescripcionCat` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`CodCat`, `NomCat`, `DescripcionCat`) VALUES
(1, 'Ordenadores', 'Portátiles y sobremesa'),
(2, 'Móviles', 'Dispositivos móviles'),
(3, 'Tablets', 'Tablets pequeñas y medianas'),
(4, 'Auriculares', 'Inalámbricos, con cable, acuáticos, etc.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `CodPedido` int(11) NOT NULL,
  `Enviado` tinyint(1) NOT NULL DEFAULT 0,
  `Recibido` tinyint(1) NOT NULL DEFAULT 0,
  `IdUsuario` varchar(15) NOT NULL,
  `Fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidosproductos`
--

CREATE TABLE `pedidosproductos` (
  `CodPedidoProducto` int(11) NOT NULL,
  `CodProd` int(11) NOT NULL,
  `CodPedido` int(11) NOT NULL,
  `Unidades` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `CodProd` int(11) NOT NULL,
  `NomProd` varchar(40) NOT NULL,
  `DescripcionProd` varchar(120) NOT NULL,
  `Stock` int(11) NOT NULL,
  `PrecioProd` float(11,2) NOT NULL,
  `PesoProd` float(11,2) NOT NULL,
  `CodCat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`CodProd`, `NomProd`, `DescripcionProd`, `Stock`, `PrecioProd`, `PesoProd`, `CodCat`) VALUES
(1, 'PcCom Ready i5 ', '13400F / 16GB RAM / 500GB SSD / RTX 3060 12GB - Pc Gaming Negro', 9, 969.50, 3.00, 1),
(2, 'HP Victus 15L TG02-0049ns', '16\" WQXGA, Intel® Evo™ Core™ i7-1360P, 16GB RAM, 512 GB SSD, Windows 11 Home, Negro', 5, 976.65, 2.50, 1),
(3, 'iPhone 15', '128GB | White', 3, 899.00, 0.50, 2),
(4, 'Samsung Galaxy S23', '512GB', 5, 1089.00, 0.40, 2),
(7, 'Samsung Galaxy Tab A9', '64GB, 4GB RAM', 10, 152.15, 0.30, 3),
(8, 'Sony WH-CH720N Auriculares Inalámbricos', 'Noise Cancelling- hasta 35 Horas de Autonomía y Carga Rápida, Blanco', 10, 99.90, 0.10, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `IdUsuario` varchar(15) NOT NULL,
  `NombreUsuario` varchar(80) NOT NULL,
  `ApellidoUsuario` varchar(80) NOT NULL,
  `Clave` varchar(255) NOT NULL,
  `CodRol` tinyint(1) NOT NULL DEFAULT 0,
  `DescripcionRol` varchar(20) NOT NULL DEFAULT 'Cliente',
  `Correo` varchar(40) NOT NULL,
  `FechaNac` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`IdUsuario`, `NombreUsuario`, `ApellidoUsuario`, `Clave`, `CodRol`, `DescripcionRol`, `Correo`, `FechaNac`) VALUES
('admin', 'Mercedes', 'Tejada', '$2y$04$d/gTpOWxgFIUqJ60SVS3OeHsw6z4vR5RpHykwEa8Q4RXTTN5SCRXK', 1, 'Admin', 'mercedestejadaporcel@gmail.com', '2002-08-07');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`CodCat`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`CodPedido`),
  ADD KEY `IdUsuario` (`IdUsuario`);

--
-- Indices de la tabla `pedidosproductos`
--
ALTER TABLE `pedidosproductos`
  ADD PRIMARY KEY (`CodPedidoProducto`),
  ADD KEY `CodProd` (`CodProd`),
  ADD KEY `pedidosproductos_ibfk_2` (`CodPedido`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`CodProd`),
  ADD KEY `CodCat` (`CodCat`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`IdUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `CodCat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `CodPedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidosproductos`
--
ALTER TABLE `pedidosproductos`
  MODIFY `CodPedidoProducto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `CodProd` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuarios` (`IdUsuario`);

--
-- Filtros para la tabla `pedidosproductos`
--
ALTER TABLE `pedidosproductos`
  ADD CONSTRAINT `pedidosproductos_ibfk_1` FOREIGN KEY (`CodProd`) REFERENCES `productos` (`CodProd`),
  ADD CONSTRAINT `pedidosproductos_ibfk_2` FOREIGN KEY (`CodPedido`) REFERENCES `pedidos` (`CodPedido`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`CodCat`) REFERENCES `categorias` (`codCat`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
