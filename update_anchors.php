<?php

$jsonFile = 'anchors.json';

// Check if the request is a POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get the JSON data from the request body
    $json_data = file_get_contents("php://input");

    // Decode JSON data
    $data = json_decode($json_data, true);

    // Update anchor positions in the JSON file
    $newJsonData = json_encode($data, JSON_PRETTY_PRINT);

    // Write the updated JSON data back to the file
    file_put_contents($jsonFile, $newJsonData);

    // Respond with a JSON success message
    $response = array("success" => true);
    echo json_encode($response);

    // Ensure no additional content is sent
    exit();
} else {
    // Respond with a JSON error message for non-POST requests
    $response = array("success" => false, "message" => "Invalid request method");
    echo json_encode($response);
}
?>
