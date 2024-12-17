<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(strip_tags($_POST["name"]));
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    $to = "info.alkaartstudio@gmail.com";
    $subject = "New Newsletter Subscription";
    $message = "New subscription:\n\nName: $name\nEmail: $email";
    $headers = [
        'From' => 'no-reply@alkasartstudio.com',
        'Reply-To' => $email,
        'Content-Type' => 'text/plain; charset=utf-8',
    ];

    if (mail($to, $subject, $message, $headers)) {
        echo "Thank you for subscribing!";
    } else {
        echo "Subscription failed. Please try again later.";
    }
}
?>
