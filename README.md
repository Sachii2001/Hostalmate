# Hostalmate

Hostalmate is a hostel room listing and booking application. The project contains an Expo / React Native client and a Node.js / Express REST API backed by MongoDB and Mongoose.

This guide is for developers setting up the project and QA testers validating its current behavior. It describes the implementation in this repository, including known setup and testing limitations.

## Project Overview

The client provides account registration and login, room browsing and detail views, room management screens, booking requests, and a user's booking list. The API stores users, rooms, and bookings in MongoDB. Protected API requests use JSON Web Tokens (JWT).

This is currently a development/demo application. There is no separate admin role, production deployment configuration, or automated test suite configured.

## Key Features

- Register an account and log in with email and password.
- Hash passwords with `bcryptjs`; issue JWTs that expire after one day.
- Browse room listings and inspect room type, monthly price, capacity, occupancy, availability, description, and image.
- Create, update, and delete rooms; attach an image when creating or updating a room.
- Submit a booking request with a start and end date.
- List, inspect, update the status of, and delete the signed-in user's bookings.
- Track booking statuses: `Pending`, `Approved`, `Rejected`, and `Cancelled`.
- Update room occupancy when an approved booking is approved, cancelled, rejected, or deleted.

## Technology Stack

| Area | Technology |
| --- | --- |
| Client | Expo SDK 57, React Native, React, TypeScript, Expo Router |
| API | Node.js, Express 5, CommonJS |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens and bcryptjs |
| Image upload | Multer to local disk |

## System Workflow

The Expo client sends HTTP requests to the Express API. The API validates JWTs for protected routes and reads or writes MongoDB documents. Room images are stored on the API host and served as static files.

### User workflow

1. A new user registers with a name, email, and password.
2. The user logs in; the API returns a JWT and user details. The client stores these locally and sends the token on protected requests.
3. The user browses rooms, opens room details, and submits a booking request for an available room.
4. The API creates a booking with `Pending` status. The user can review bookings and update or cancel their own booking.
5. A booking status change to `Approved` increases room occupancy. Rejecting or cancelling an approved booking, or deleting it, releases occupancy.

Room create, edit, and delete screens are available to any authenticated user. There is no separate staff/admin workflow or role model in the current implementation.

### Services and ports

| Service | Default port | Run command | Notes |
| --- | ---: | --- | --- |
| Express API | `5000` | From repository root: `npm run dev` | Can be changed with the `PORT` environment variable. |
| MongoDB | `27017` | Start the local MongoDB service (or run `mongod` if installed as a process). | For hosted MongoDB, set `MONGO_URI`; no local MongoDB process is needed. |
| Expo / Metro | `8081` | From `frontend/`: `npm run dev` | Expo may select another available port; use the URL printed by Expo. |

The API starts listening only after MongoDB connects. `GET /test` returns a small response to verify that the API is reachable.

## Requirements

- Node.js 20.19 or later and npm.
- A reachable MongoDB deployment (local or hosted).
- For native testing: Expo Go or a configured Android emulator / iOS simulator.
- For web testing: a supported browser.

## Environment Variables

The API loads `backend/.env` in `backend/server.js`. This file is ignored by Git and must be created locally.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Keep it private. |
| `PORT` | No | API port; defaults to `5000`. |

Example local configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hostalmate
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

For MongoDB Atlas, use the connection string configured for your cluster. Do not commit real credentials or secrets.

## Installation & Setup

Run commands from the repository root unless a command explicitly changes directory.

### 1. Install API dependencies

```sh
npm install
```

In the current checkout, the root `package.json` contains the API dependencies and the `dev` script. There is no `backend/package.json` in the current checkout, so run the backend command from the repository root, not from `backend/`.

Before starting, configure the variables listed in [Environment Variables](#environment-variables) and ensure MongoDB is reachable.

## Running the Application

### Start the API

In terminal 1, from the repository root:

```sh
npm run dev
```

Expected startup messages include a successful MongoDB connection and `Server is running on port 5000`. If the API does not start, first check `backend/.env`, MongoDB availability, and whether the port is already in use.

Verify the API in a browser or API client:

```text
http://127.0.0.1:5000/test
```

Expected response:

```json
{"message":"Main server is working!"}
```

### Start the client

In terminal 2:

```sh
cd frontend
npm install
npm run dev
```

Use the URL or QR code printed by Expo. Available target-specific scripts, run from `frontend/`, are:

```sh
npm run web
npm run android
npm run ios
```

The Android and iOS scripts require the corresponding simulator/emulator or device setup. `npm run web` starts the client in a browser.

## Client API Address

The frontend currently hard-codes `API_URL` in multiple screen files under `frontend/src/app/`. The checked-in value is `http://10.165.196.224:5000`; replace it with the address reachable from the device running the client before testing. Keep the value consistent in every screen that declares `API_URL`.

| Client target | Example API address |
| --- | --- |
| Browser on the same computer as the API | `http://127.0.0.1:5000` |
| Android emulator | `http://10.0.2.2:5000` |
| Physical phone | `http://<computer-LAN-IP>:5000` |

For a physical phone, the phone and computer must be on a network that allows device-to-device connections. `localhost` on a phone refers to the phone, not the computer. The current client does not load the API address from an environment variable.

## Project Structure

```text
Hostalmate/
|-- .gitignore
|-- package.json                 # API dependencies and root development script
|-- package-lock.json
|-- README.md
|-- backend/
|   |-- .env                     # Local configuration; do not commit
|   |-- server.js                # Express app, middleware, route registration, DB startup
|   |-- uploads/                 # Runtime image directory served by the API
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- bookingController.js
|   |   `-- roomController.js
|   |-- middleware/
|   |   |-- authMiddleware.js    # JWT verification
|   |   `-- uploadMiddleware.js  # Multer image upload
|   |-- models/
|   |   |-- User.js
|   |   |-- Room.js
|   |   `-- Booking.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- roomRoutes.js
|   |   `-- bookingRoutes.js
|   `-- room.jpg                 # Included sample image
`-- frontend/
	|-- app.json                 # Expo app configuration
	|-- package.json             # Expo client scripts and dependencies
	|-- assets/                  # App icons and images
	`-- src/
		|-- app/                 # Expo Router screens
		|   |-- index.tsx        # Login
		|   |-- register.tsx
		|   |-- rooms.tsx
		|   |-- room-details.tsx
		|   |-- add-room.tsx
		|   |-- edit-room.tsx
		|   |-- booking.tsx
		|   `-- my-bookings.tsx
		|-- components/
		|-- constants/
		`-- hooks/
```

`git-backup/` contains preserved package manifests and is not used at runtime. Generated folders such as `node_modules/`, `.expo/`, `dist/`, and `web-build/` are not part of the source layout. In the current checkout, backend dependencies and the development script are declared in the root `package.json`; `backend/package.json` is absent.

## Authentication & Authorization

- Registration is public. Passwords are hashed with `bcryptjs` before being stored.
- Login is public and returns a signed JWT that expires after one day.
- Protected endpoints expect `Authorization: Bearer <token>`. The API verifies the token with `JWT_SECRET` and assigns its user ID to the request.
- Room and booking routes require a valid token. Booking read, update, and delete operations check that the booking belongs to the current user.
- There are no roles. Any authenticated user can create, update, or delete rooms. A booking owner can set their booking to any accepted status, including `Approved`; status changes are not restricted to an administrator.

## Room Management

Rooms support the types `Single`, `Double`, and `Triple`. A room stores its number, monthly price, capacity, current occupancy, optional description and image path, and availability (`Available` or `Full`). Room listing, details, creation, update, and deletion endpoints are protected by JWT authentication.

Room creation requires a room number, type, monthly price, and capacity. The Mongoose schema enforces required fields and the room-type enum. Updating a room recalculates availability from `currentOccupancy` and `capacity`.

## Booking Management

An authenticated user submits `roomId`, `startDate`, and `endDate`. Dates must parse successfully, the end date must be later than the start date, and the room must exist and not be marked `Full`. New bookings start as `Pending`.

Allowed statuses are `Pending`, `Approved`, `Rejected`, and `Cancelled`. Approving a booking checks room capacity and increments occupancy. Rejecting or cancelling an approved booking releases one occupant; deleting an approved booking also releases occupancy. The API lists only the signed-in user's bookings and checks ownership when reading, updating, or deleting one booking.

## Database Models

| Model | Fields |
| --- | --- |
| User | `name`, unique `email`, hashed `password`, Mongoose timestamps |
| Room | `roomNumber`, `roomType` (`Single`, `Double`, `Triple`), `pricePerMonth`, `capacity`, `currentOccupancy`, `description`, `image`, `availabilityStatus` (`Available`, `Full`), timestamps |
| Booking | `userId`, `roomId`, `bookingDate`, `startDate`, `endDate`, `status`, timestamps |

## Image Uploads

Room creation and update accept an optional multipart/form-data file field named `image`. Multer generates a timestamp-based filename with the original extension, and the room document stores the uploaded file path. Express serves images under `/uploads/<filename>`; the room-details screen builds the image URL from the API base address and that path.

The current upload middleware writes to the relative directory `uploads/`, while the server exposes `backend/uploads/`. The relative write destination depends on the API process's working directory. Confirm that uploads are written under the directory the server serves when running QA; this path should be made absolute and shared between upload and static middleware for reliable deployment. No file type or size limits are currently configured.

## API Endpoints

The API runs on `http://127.0.0.1:5000` by default. Registration and login are public. Room and booking endpoints require this header:

```http
Authorization: Bearer <jwt-token>
```

### Authentication

| Method | Path | Request body | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ "name": "...", "email": "...", "password": "..." }` | Public |
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` | Public |

Registration requires a name, email, and password. The password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character. Login returns a JWT and basic user information. The token expires after one day.

### Rooms

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/rooms` | List all rooms | JWT required |
| `GET` | `/api/rooms/:id` | Read one room | JWT required |
| `POST` | `/api/rooms` | Create a room | JWT required |
| `PUT` | `/api/rooms/:id` | Update a room | JWT required |
| `DELETE` | `/api/rooms/:id` | Delete a room | JWT required |

Room fields are `roomNumber`, `roomType`, `pricePerMonth`, `capacity`, and optional `description`. Create and update requests may include an optional multipart file field named `image`. Uploaded files are served from `/uploads/<filename>`.

### Bookings

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `POST` | `/api/bookings` | Submit a booking request | JWT required |
| `GET` | `/api/bookings` | List the signed-in user's bookings | JWT required |
| `GET` | `/api/bookings/:id` | Read a booking owned by the signed-in user | JWT required |
| `PUT` | `/api/bookings/:bookingId` | Set booking status | JWT required; owner check |
| `DELETE` | `/api/bookings/:id` | Delete a booking owned by the signed-in user | JWT required; owner check |

Create a booking with JSON containing `roomId`, `startDate`, and `endDate`. Dates must be valid and the end date must be after the start date. Status updates accept `Pending`, `Approved`, `Rejected`, or `Cancelled`.

### Diagnostics and static files

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/test` | Confirm that the Express server responds |
| `GET` | `/api/auth/test` | Confirm that the auth router responds |
| `GET` | `/uploads/:filename` | Retrieve a locally stored room image |

## Error Handling / Validation

| Condition | Current API behavior |
| --- | --- |
| Missing registration or login fields | HTTP `400` with a message |
| Weak registration password or duplicate email | HTTP `400` with a validation message |
| Missing, invalid, or expired bearer token | HTTP `401` |
| Booking has missing fields, invalid dates, invalid status, or a full room | HTTP `400` |
| Room or booking does not exist | HTTP `404` |
| User attempts to access another user's booking | HTTP `403` |
| Unexpected database/controller error | Usually HTTP `500`; response bodies may include the error message |

Mongoose schemas enforce required fields and enum values for persisted models. Controllers also validate required registration/login fields, password strength, booking date order, room capacity, status values, and booking ownership. Room create/update does not currently provide a complete user-facing validation layer for all invalid values; malformed model data can surface as a server error.

In the client, failed HTTP responses are displayed through alerts. A network timeout or unreachable API is a transport/configuration problem and will not produce the JSON validation response described above.

## QA Test Guide

Use a fresh test account and test data. Confirm the API is running, MongoDB is connected, and the client points to the correct API address before testing UI flows.

| Test area | Action | Expected result |
| --- | --- | --- |
| API availability | Request `GET /test` | HTTP response with `Main server is working!` |
| Registration | Submit valid name, unique email, and compliant password | Account is created; response is successful |
| Registration validation | Omit a required field or use a weak password | Request is rejected with a validation message |
| Duplicate account | Register the same email a second time | Duplicate email is rejected |
| Login | Log in with valid credentials | JWT and user details are returned; client opens rooms screen |
| Authentication | Call a protected room or booking endpoint without a token | Request is rejected as unauthorized |
| Room listing | Log in and open rooms | Room records and availability are displayed |
| Room creation | Add a room with valid values and an image | Room is created and appears in the room list; image can be fetched |
| Room editing/deletion | Update a room, then delete a disposable room | Changes persist; deleted room is no longer returned |
| Booking validation | Submit a missing/invalid date or end date before start date | Request is rejected with a validation message |
| Booking lifecycle | Book an available room, then update status | Booking status changes; approval updates room occupancy |
| Booking ownership | Request another user's booking by ID | API rejects access to the other user's booking |
| Occupancy release | Cancel, reject, or delete an approved booking | Room occupancy decreases and availability is recalculated |

When testing file upload, verify the API process can write to `backend/uploads/`. Use disposable rooms and accounts for destructive tests.

## Validation Commands

Run the Expo lint command from `frontend/`:

```sh
cd frontend
npm run lint
```

The root `npm test` script is currently a placeholder and exits with an error. No automated API or UI test suite is configured; the QA table above describes manual checks, not tests that run automatically.

## Known Limitations and QA Notes

- The API address is hard-coded in multiple frontend screens and must be adjusted for each local network/device setup.
- There are no user roles. Any authenticated account can use room create, update, and delete endpoints; booking status changes are also available to the booking owner. Do not assume the current authorization rules provide an administrator workflow.
- Room images are stored on the API host's local disk. There is no cloud object storage or upload size/type policy configured.
- The root package has the backend development command; `backend/package.json` is not present in the current checkout.
<<<<<<< HEAD
- The root `npm test` script is not an automated test suite. CI, deployment, monitoring, and production secrets management are not configured here.
=======
- The root `npm test` script is not an automated test suite. CI, deployment, monitoring, and production secrets management are not configured here.
>>>>>>> e0dda91 (Add comprehensive project documentation and QA guide)
