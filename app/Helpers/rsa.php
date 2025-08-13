<?php

if (!function_exists('rsa_decrypt')) {

    function rsa_decrypt(string $encrypted): ?string
    {
        $privateKey = config('app.rsa_private_key');

        if (!$privateKey) {
            throw new \RuntimeException('RSA private key not configured.');
        }

        // Convert literal \n to actual newlines (important if loaded from .env)
        $privateKey = str_replace('\\n', "\n", $privateKey);

        $keyResource = openssl_pkey_get_private($privateKey);

        if (!$keyResource) {
            throw new \RuntimeException('Invalid RSA private key.');
        }

        $success = openssl_private_decrypt(
            base64_decode($encrypted),
            $decrypted,
            $keyResource,
            OPENSSL_PKCS1_OAEP_PADDING
        );

        if (!$success) {
            throw new \RuntimeException('RSA decryption failed.');
        }

        return $decrypted;
    }
}

