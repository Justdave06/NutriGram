FROM php:8.4-cli-alpine

RUN apk add --no-cache curl unzip git nodejs npm sqlite sqlite-dev \
    && docker-php-ext-install pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build \
    && composer dump-autoload \
    && cp .env.example .env \
    && php artisan key:generate \
    && php artisan storage:link \
    && chmod -R 777 storage bootstrap/cache

EXPOSE $PORT

CMD ["sh", "start.sh"]
