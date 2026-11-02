# PHP service (extension point)

This folder is reserved for PHP-based ERP integrations (for example, legacy payroll or accounting connectors). The runnable MVP currently uses the Node.js/Express API as its single source of truth. PHP is intentionally not required to start the local web application. When activating this service, use the official MongoDB PHP library and connect to the same `MONGODB_URI`; do not introduce a second database.
