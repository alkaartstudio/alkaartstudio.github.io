<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format";
        exit;
    }

    // Email settings
    $to = "info.alkaartstudio@gmail.com"; // Your email address
    $subject = "New Newsletter Subscription";
    $message = "You have a new newsletter subscriber:\n\nName: $name\nEmail: $email";
    $headers = "From: no-reply@alkasartstudio.com";

    // Send email
    if (mail($to, $subject, $message, $headers)) {
        echo "Thank you for subscribing to the newsletter!";
    } else {
        echo "There was a problem with your subscription. Please try again later.";
    }
}
?>
