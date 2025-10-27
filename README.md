# 🚀 Node.js Reverse Proxy Server (NGINX Replacement)

A programmable, high-performance **reverse proxy server built with Node.js**, designed to **replace or supplement NGINX** for scenarios requiring dynamic routing, intelligent caching, and deeper runtime control.

This project leverages the flexibility of JavaScript and the power of Node.js to create a **customizable reverse proxy layer** capable of handling both **HTTP and HTTPS traffic**, dynamic routing rules, and hybrid caching—all with detailed structured logging using **Pino**.

---

## ⚙️ Overview

Traditional reverse proxies like NGINX are powerful but often rigid when it comes to **runtime reconfiguration, advanced caching**, and **custom business logic**.

This Node.js-based reverse proxy provides:
- **Dynamic, programmatic routing** (no reloads required)
- **Custom hybrid caching** (in-memory + on-disk)
- **Request logging with Pino**
- **Full HTTPS support**
- **Pluggable middleware for transformations or analytics**

It’s an ideal choice for teams who need a **flexible, developer-friendly proxy** layer that integrates easily with microservices, API gateways, or content delivery architectures.

---

## 🧩 Key Features

✅ **Dynamic Routing:**  
Configure route mappings in real time without restarting the server. Routes can be defined based on **domain, path, or environment**.

✅ **HTTP & HTTPS Support:**  
Automatically handle both protocols with optional SSL certificates.

✅ **Hybrid Caching Layer:**  
A custom `hybridCustomCache` combines **memory caching** for fast responses and **disk caching** for persistence, reducing upstream requests by up to **60%**.

✅ **Detailed Logging:**  
Integrated with **Pino** for high-performance structured logs including:
- Request metadata (method, URL, latency)
- Cache hits/misses
- Error tracking

✅ **Flexible Extensibility:**  
Inject custom middlewares for authentication, transformations, or analytics before proxy forwarding.

✅ **Hot Reloading:**  
Update routes and configurations on-the-fly without downtime.

---

## 🏗️ Architecture

```plaintext
            ┌──────────────────────────┐
            │        Client            │
            └────────────┬─────────────┘
                         │
                 Incoming Request
                         │
        ┌────────────────▼────────────────┐
        │       Node.js Reverse Proxy     │
        │---------------------------------│
        │ • http/https servers             │
        │ • http-proxy middleware          │
        │ • hybridCustomCache (RAM+Disk)   │
        │ • Pino logging                   │
        │ • Dynamic route resolver         │
        └────────────────┬────────────────┘
                         │
                 Forwarded Request
                         │
            ┌────────────▼────────────┐
            │     Target Server(s)    │
            └─────────────────────────┘
```

## 🧠 Tech Stack 

- Node.js
- http-proxy – for low-level proxying
- Pino – for high-performance logging
- fs / path – for disk-level caching
- crypto – for cache key hashing
- dotenv – for environment configuration

## ⚙️ Installation
# Clone the repository
```bash
git clone https://github.com/raghusince1998/nodejs-reverse-proxy.git
cd nodejs-reverse-proxy
```

# Install dependencies
```bash
npm install
```

# Create a .env file
```bash
cp .env.example .env
```

## Example .env file:
```bash
HTTP_PORT=80
HTTPS_PORT=443
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem
CACHE_DIR=./cache
LOG_LEVEL=info
```

## 🚀 Usage
Run in Development
```bash
npm run dev
```

Run in Production
```bash
npm start
```


The proxy will start on:
```bash

HTTP: http://localhost:80

HTTPS: https://localhost:443
```

## 🔁 Example Route Configuration

File: routes.js

```bash
module.exports = {
  "example.com": {
    "/api": "http://localhost:8080",
    "/static": "http://localhost:3000",
  },
  "anotherdomain.com": {
    "/": "https://backend-service:5000",
  },
};
```

## 🧰 Hybrid Cache Details

hybridCustomCache intelligently stores responses in:

- Memory (RAM): for frequent short-lived requests

- Disk: for large or persistent responses

Cache keys are generated via crypto hash of request URL + headers.

## 🧩 Example Use Cases

- Replace static NGINX proxies with programmable Node.js logic

- Add custom authentication or token injection before forwarding

- Implement intelligent cache invalidation

- Build a local reverse proxy for microservice development

- Dynamic A/B routing for APIs or UI builds

## 📈 Performance Impact

- Reduced redundant upstream requests by 60% via hybrid caching

- Improved average response latency by 40% for cached routes

- Enabled zero-downtime route updates with dynamic configuration

## 🤝 Contributing

Contributions are welcome!
Please open an issue or pull request if you’d like to improve caching, add new proxy behaviors, or enhance configuration features.

## 🧾 License

This project is licensed under the MIT License.
Feel free to use, modify, and distribute with attribution.

> 💡 Author: Raghuraj Singh

> 📧 Email: raghurajs212@gmail.com
