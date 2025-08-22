# Use official PHP image with FPM and Ubuntu
FROM php:8.4-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    nginx \
    supervisor \
    default-mysql-client \
    nodejs \
    npm \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    dom \
    xml

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . .

# Recreate Laravel storage symlink
RUN php artisan storage:link || true

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_NO_INTERACTION=1
ENV COMPOSER_DISABLE_XDEBUG_WARN=1
# ENV COMPOSER_DISABLE_NETWORK=1 

# Install PHP dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Install Node.js dependencies and build assets
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage
RUN chown -R www-data:www-data /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage
RUN chmod -R 775 /var/www/html/bootstrap/cache

# Copy Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy custom Nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port 9000 for PHP-FPM and 80 for Nginx
EXPOSE 9000
EXPOSE 80

# Start supervisor which will start both PHP-FPM and Nginx
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]