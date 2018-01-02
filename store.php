<?php

//Make sure that it is a POST request.
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
    throw new Exception('Request method must be POST!');
}

//Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

$filepath = "./results/result_" . uniqid() . ".json";

$myfile = fopen($filepath, "w");
fwrite($myfile, $content);
fclose($myfile);

echo "OK";

?>
