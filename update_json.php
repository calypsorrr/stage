<?php
$jsonFile = 'anchors.json';

// Get values from the request
$anchorId = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
$propertyName = filter_input(INPUT_POST, 'property', FILTER_SANITIZE_SPECIAL_CHARS);
$newValue = filter_input(INPUT_POST, 'value', FILTER_SANITIZE_SPECIAL_CHARS);

if ($anchorId !== null && $propertyName !== null && $newValue !== null) {
    // Read existing JSON data from anchors.json
    $data = json_decode(file_get_contents($jsonFile), true);

    // Find the anchor by ID
    $index = array_search($anchorId, array_column($data, 'id'));

    if ($index !== false) {
        // Convert the new value to a number if possible
        if (is_numeric($newValue)) {
            $newValue = floatval($newValue);
        }

        // Update the property value
        $data[$index][$propertyName] = $newValue;

        // Save the updated data back to anchors.json
        if (file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT))) {
            // Return updated data as JSON response (optional)
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'data' => $data]);
        } else {
            // File write error
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Error writing to the JSON file']);
        }
    } else {
        // Anchor not found
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Anchor not found']);
    }
} else {
    // Invalid input
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid input values']);
}
?>
