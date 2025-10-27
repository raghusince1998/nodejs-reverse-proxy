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

