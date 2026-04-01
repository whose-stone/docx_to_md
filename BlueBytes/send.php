<?php
// send.php
// Simple PHP endpoint to send contact-form submissions via email.

header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Only POST is allowed.']);
    exit;
}

// Parse input depending on content type
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') === 0) {
    $body = file_get_contents('php://input');
    $input = json_decode($body, true) ?? [];
} else {
    $input = $_POST;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$agency = trim($input['agency'] ?? '');
$message = trim($input['message'] ?? '');

if (!$name || !$email || !$agency || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit;
}

// Basic sanitization
$name = filter_var($name, FILTER_SANITIZE_STRING);
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$agency = filter_var($agency, FILTER_SANITIZE_STRING);
$message = filter_var($message, FILTER_SANITIZE_STRING);

$to = 'Ideas@BlueBytes.ai';
$subject = "New Contact Form Submission from $name";
$body = "Name: $name\nEmail: $email\nAgency: $agency\n\nMessage:\n$message\n";

$headers = [
    'From' => "$name <$email>",
    'Reply-To' => $email,
    'Content-Type' => 'text/plain; charset=UTF-8'
];

$success = mail($to, $subject, $body, $headers);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to send email.']);
}
