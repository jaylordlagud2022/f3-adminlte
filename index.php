<?php

require 'vendor/autoload.php';

//dompdf config
define('DOMPDF_ENABLE_AUTOLOAD', false);

//validator config
use Valitron\Validator as V;
V::langDir(__DIR__.'/vendor/vlucas/valitron/lang');

V::lang('en');

$f3 = Base::instance();

$f3->config('config/config.ini');
$f3->config('config/routes.ini');
$f3->set('UPLOADS','ui/uploads/');

//$f3->set('ONERROR',function($f3){
//  echo Template::instance()->render('404.html');
//});

// Define a route for the specified URL
$f3->route('GET /api/reports.php', function() {
    // Retrieve the 'method' query parameter
    $method = \Base::instance()->get('GET.method');

    // Check the value of the 'method' parameter and call the appropriate function
    switch ($method) {
        case 'IOT_GetReportsList':
            $response = WebReports::IOT_GetReportsList();
        break;

        case 'IOT_GetCustomerList':
            $response = WebReports::IOT_GetCustomerList();
        break;

        case 'IOT_GetUsagePeriodList':
            $response = WebReports::IOT_GetUsagePeriodList();
        break;

        case 'getVersion':
            $response = WebReports::getVersion();
        break;

        case 'IOT_GetReport':
            $response = WebReports::IOT_GetReport();
        break;
         
        case 'IOT_GetReportColumns':
            $response = WebReports::IOT_GetReportColumns();
        break;

        default:
            $response = ['error' => 'Invalid method'];
            break;
    }

    // Send the JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
});


$f3->run();
