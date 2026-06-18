FROM php:8.3-cli-alpine

RUN apk add --no-cache curl unzip git nodejs npm sqlite \
    && docker-php-ext-install pdo pdo_sqlite mbstring

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader --no-dev

COPY package.json package-lock.json ./
RUN npm install && npm run build

COPY . .

RUN cp .env.example .env \
    && php artisan key:generate \
    && php artisan storage:link \
    && chmod -R 777 storage bootstrap/cache

EXPOSE $PORT

CMD ["bash", "start.sh"]
