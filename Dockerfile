FROM php:8.4-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies, PHP extensions, Node.js, and Composer
RUN apt-get update && apt-get install -y \
    git nano unzip curl libpng-dev libonig-dev libxml2-dev zip libzip-dev \
    gnupg2 ca-certificates build-essential \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Node.js v22.17.0 and npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && node -v && npm -v
# Set ownership and permissions

#RUN chown -R www-data:www-data /var/www/html \
#    && find /var/www/html -type d -exec chmod 755 {} \; \
#    && find /var/www/html -type f -exec chmod 644 {} \; \
#    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install 

# Install Node.js dependencies and build frontend assets
RUN npm install && npm run build

# Set ownership and permissions
#RUN chown -R www-data:www-data /var/www/html \
#    && find /var/www/html -type d -exec chmod 755 {} \; \
#    && find /var/www/html -type f -exec chmod 644 {} \; \
#    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache


# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]


