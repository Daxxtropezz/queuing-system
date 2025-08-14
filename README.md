# queuing-system

A **Gender-Based Violence Information System** built with **Laravel 12** and **React (TypeScript)** using **shadcn/ui**. This system is designed for sensitive and secure data management related to GBV cases, built for performance and clarity.

## 🧩 Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui
- **Database**: MySQL / MariaDB (customizable)
- **API**: RESTful API with Sanctum (or Passport)
- **Package Manager**: Composer (PHP), npm (Node.js)

## 📁 Project Structure

```
queuing-system/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   │   ├── HandleAppearance.php
│   │   │   ├── HandleInertiaRequests.php
│   │   │   └── SecureHeadersMiddleware.php
│   ├── Models/
│   ├── Providers/
├── bootstrap/
│   ├── app.php
│   └── cache/
├── config/
│   ├── app.php
│   ├── database.php
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── docker/
│   ├── nginx.conf
│   ├── php.ini
│   └── supervisord.conf
├── public/
│   ├── build/ (Vite build output)
│   ├── index.php
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   └── ui/ (shadcn/ui components)
│   │   ├── pages/
│   │   │   └── auth/
│   │   │       └── login.tsx
│   │   ├── Services/
│   │   │   └── rsaService.js
│   │   ├── layouts/
│   │   └── app.tsx
│   ├── views/
│   │   └── app.blade.php
│   └── css/
├── routes/
│   ├── web.php
│   ├── console.php
├── storage/
│   ├── app/
│   ├── framework/
│   ├── logs/
├── tests/
│   ├── Feature/
│   └── Unit/
├── vendor/
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── composer.lock
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL

### Installation

```bash
# Clone the repository
git clone https://github.com/rictms-fo4a/lareact-template.git
cd lareact-template

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy and configure environment
cp .env.example .env
php artisan key:generate

# (Windows only) Fix SSL for PHP cURL (required for Google reCAPTCHA and other HTTPS requests)
# Download the latest CA certificate bundle:
#   https://curl.se/ca/cacert.pem
# Save it to a directory, e.g. C:\php\extras\ssl\cacert.pem
# Then edit your php.ini and set:
#   curl.cainfo = "C:\php\extras\ssl\cacert.pem"
#   openssl.cafile = "C:\php\extras\ssl\cacert.pem"
# Restart your web server or PHP after editing php.ini.

# Run migrations
php artisan migrate

# Start development servers
php artisan serve
npm run dev
```

## ⚙️ Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm start`           | Runs Vite dev and Laravel backend server |
| `composer run dev`    | Runs Vite development server             |
| `php artisan serve`   | Runs Laravel backend server              |
| `npm run build`       | Builds frontend for production           |
| `php artisan migrate` | Runs DB migrations                       |

## 🔐 Security Notice

This system handles sensitive data. Follow best practices for authentication, authorization, and encryption. Keep `.env` files private.

## 🤝 Contributing

This is a private project. If you have access and want to contribute, please follow the guidelines in [CONTRUBUTING.md](CONTRIBUTING.md).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

You are free to:

- ✅ Use the code for personal and commercial purposes
- ✅ Modify the source code
- ✅ Distribute the original or modified code
- ✅ Sublicense or include it in other software

Under the following conditions:

- 📝 You **must include** the original license and copyright notice.
- 🚫 The software is provided **"as is"** without any warranty of any kind. The authors are not liable for any damages or issues caused by the use of this software.

For full details, please refer to the [MIT LICENSE](LICENSE) file in this repository.
