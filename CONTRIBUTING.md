# Contributing to Base Template

Thank you for considering contributing to **Base Template** — a secure and performance-driven Gender-Based Violence Information System.

> ⚠️ This is a private project handling sensitive data. All contributors must adhere to strict security, code quality, and collaboration standards.

---

## 📋 Code of Conduct

Before contributing, please review our [Code of Conduct](CODE_OF_CONDUCT.md) to foster a respectful and inclusive environment.

---

## 📁 Project Structure Overview

This is a **Laravel 12 + React (TypeScript)** monorepo. Please respect the separation of concerns between backend (Laravel) and frontend (React).

### Key Folders

- `app/` - Laravel application logic
- `resources/js/` - Frontend React (TypeScript)
- `routes/` - Laravel routes
- `database/` - Migrations and seeders
- `tests/` - Laravel test suite

---

## 🧰 Prerequisites

Ensure your environment is aligned with the following:

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL

---

## 🔨 Setting Up Local Dev

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-org/base-template.git
    cd base-template
    ```

2. **Install dependencies**

    ```bash
    composer install
    npm install
    ```

3. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Run migrations**

    ```bash
    php artisan migrate
    ```

5. **Start dev servers**
    ```bash
    php artisan serve
    npm run dev
    ```

---

## 🧪 Testing & Linting

- Run tests:

    ```bash
    php artisan test
    ```

- Type-check frontend:

    ```bash
    npm run typecheck
    ```

- Format with Prettier:

    ```bash
    npm run format
    ```

- Lint code:
    ```bash
    npm run lint
    ```

---

## 🔄 Pull Request Guidelines

- Fork the repository and create a new branch.
- Write clear, descriptive commit messages.
- Follow PSR-12 for PHP and Airbnb/Prettier for TypeScript.
- Ensure your feature/change has relevant tests.
- Submit a pull request and describe **what** and **why** clearly.

---

## 🚫 Security Considerations

- Do not log or expose any sensitive GBV-related data.
- Never commit secrets, credentials, or `.env` files.
- Sanitize inputs and follow Laravel + React security best practices.

---

## 🤝 Contributor Recognition

All contributors will be acknowledged in `README.md` and relevant changelogs.

---

## 📜 License

By contributing, you agree that your code will be licensed under the [MIT License](LICENSE).

Thank you for helping improve Base Template! 💙
