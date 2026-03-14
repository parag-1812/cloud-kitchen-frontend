# Cloud Kitchen Frontend

## 🍽️ Overview

The `cloud-kitchen-frontend` is the web client for the Cloud Kitchen system. It provides a role-based interface for customers, kitchens, and admins to interact with the backend services through a simple React + Vite application.

This frontend is designed to sit on top of:

- `auth-service` for login and JWT generation
- `order-engine` for order creation, order tracking, kitchen workflow, and admin reporting

## ✨ What This Frontend Does

- lets users log in with JWT-based authentication
- stores the token and role in browser `localStorage`
- routes users to the correct dashboard based on role
- allows `USER` accounts to create and cancel orders
- allows `KITCHEN` accounts to process assigned orders through the order lifecycle
- allows `ADMIN` accounts to view order stats and all orders
- sends bearer tokens automatically with backend API requests

## 🧠 Frontend Experience by Role

### 👤 Customer

The customer view supports:

- login
- create order
- add multiple ingredients to a single order
- estimate order amount before submission
- view all personal orders
- cancel eligible orders

### 👨‍🍳 Kitchen

The kitchen dashboard supports:

- loading orders for a selected kitchen
- viewing assigned order details
- progressing order status through:
  - `KITCHEN_ASSIGNED`
  - `COOKING`
  - `READY`
  - `DELIVERED`

### 🛠️ Admin

The admin dashboard supports:

- viewing total order count
- viewing total revenue
- listing all orders in one place

## 🏗️ Tech Stack

- React 19
- Vite 7
- React Router DOM 7
- Axios
- ESLint

## 🌐 Backend Dependencies

This frontend talks to two backend services:

- Auth service: `http://localhost:8081`
- Order engine: `http://localhost:8080`

Default environment behavior in code:

- `VITE_AUTH_BASE_URL` defaults to `http://localhost:8081`
- `VITE_API_BASE_URL` defaults to `http://localhost:8080`

## 🔐 Authentication Flow

1. The user logs in from the login page.
2. The frontend sends credentials to `/auth/login`.
3. The auth service returns a JWT.
4. The frontend stores:
   - `token`
   - `role`
5. Protected routes check whether:
   - a token exists
   - the role matches the page requirement
6. Axios sends the JWT in the `Authorization` header for protected backend calls.

Authorization header used by the app:

```text
Authorization: Bearer <jwt-token>
```

## 🗺️ Routes

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Login screen |
| `/` | `USER` | Customer dashboard |
| `/kitchen` | `KITCHEN` | Kitchen dashboard |
| `/admin` | `ADMIN` | Admin dashboard |

Unknown routes redirect:

- to `/login` if there is no token
- to `/` if a token exists

## 📦 Main Features in the Code

### Login Page

The login page:

- accepts username and password
- calls the auth API
- decodes the JWT payload on the client
- reads the `role` claim
- redirects to the correct dashboard

### Customer Dashboard

The customer dashboard includes:

- a customer context input
- order creation form
- customer order listing
- cancellation support for eligible statuses

### Create Order Flow

The create-order experience supports:

- multiple order items
- ingredient ID entry
- quantity entry
- live total estimate using a local menu catalog
- clear API success/error feedback

### Kitchen Dashboard

The kitchen dashboard supports:

- fetching kitchen-specific orders
- viewing item-level order details
- updating order status step by step

### Admin Dashboard

The admin dashboard supports:

- viewing aggregate stats
- listing all orders

## 📡 API Integration Summary

### Auth API

Used for:

- login
- signup support in API utility layer

Configured in:

- `src/api/authApi.js`

### Orders API

Used for:

- create order
- fetch customer orders
- fetch kitchen orders
- update order status
- cancel order

Configured in:

- `src/api/ordersApi.js`

### Admin API

Used for:

- fetch order stats
- fetch all orders

Configured in:

- `src/api/adminApi.js`

## 🧾 Example Environment Setup

Create a `.env` file in the frontend root if you want custom backend URLs:

```env
VITE_AUTH_BASE_URL=http://localhost:8081
VITE_API_BASE_URL=http://localhost:8080
```

## 🚀 Running the Frontend

From the frontend root:

```bash
cd frontend/cloud-kitchen-frontend
npm install
npm run dev
```

Vite will start the app locally, typically on:

```text
http://localhost:5173
```

## 🛠️ Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the production bundle.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

## 📁 Project Structure

```text
frontend/cloud-kitchen-frontend
|-- src
|   |-- api
|   |-- assets
|   |-- components
|   |-- constants
|   `-- pages
|-- index.html
|-- package.json
|-- vite.config.js
`-- README.md
```

## 🧩 Key Frontend Modules

### `src/pages`

Contains route-level pages:

- `LoginPage`
- `CustomerPage`
- `KitchenPage`
- `AdminPage`

### `src/components`

Contains reusable UI blocks and route protection:

- `ProtectedRoute`
- `CreateOrder`
- `CustomerOrders`
- `KitchenDashboard`

### `src/api`

Contains backend communication logic:

- `authApi.js`
- `ordersApi.js`
- `adminApi.js`

### `src/constants`

Contains supporting frontend constants such as the seeded menu catalog used for display and estimation.

## 🎯 What Makes This Frontend Useful

- simple role-based navigation
- clean separation of page, component, and API layers
- direct integration with your backend services
- easy local development using Vite
- practical dashboard flows for three different actor types
- minimal friction for testing JWT-based security end to end

## ⚠️ Current Notes

There are a few things worth knowing while working with this frontend:

- JWT decoding is currently done on the client using `atob`, which is fine for basic routing but not a replacement for backend validation.
- The app relies on backend CORS allowing the Vite dev server origin.
- Admin API currently uses a fixed `http://localhost:8080` base URL in code instead of reading from `VITE_API_BASE_URL`.
- The customer context input is shown in the UI, but customer order fetching is actually driven by the authenticated backend user, not by a passed customer ID.

## 🔭 Nice Next Improvements

If you want to level up this frontend further, strong next steps would be:

- add signup UI
- add token expiration handling and auto-logout
- add a shared auth context instead of reading directly from `localStorage`
- add loading skeletons and better empty states
- add toast notifications for API actions
- add form validation with clearer inline errors
- add responsive polish for mobile screens
- add API gateway support when your backend architecture grows
- add test coverage with React Testing Library
- add admin management screens for ingredients, kitchens, and inventory

## 📝 Summary

The `cloud-kitchen-frontend` is the control surface for your Cloud Kitchen platform. It connects authentication, order creation, kitchen processing, and admin visibility into one React application, making it easy to test and demonstrate the full system from the browser.
