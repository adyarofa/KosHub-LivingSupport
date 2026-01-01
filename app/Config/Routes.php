<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('health', 'Api\LivingSupport::health');
$routes->get('services', 'Api\LivingSupport::services');
$routes->post('orders', 'Api\LivingSupport::createOrder');
$routes->get('orders/(:segment)', 'Api\LivingSupport::getOrder/$1');
