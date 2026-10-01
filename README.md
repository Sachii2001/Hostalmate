# Hostalmate

Hostalmate is a hostel room listing and booking application. The project contains an Expo / React Native client and a Node.js / Express REST API backed by MongoDB and Mongoose.

This guide is for developers setting up the project and QA testers validating its current behavior. It describes the implementation in this repository, including known setup and testing limitations.

## Project Overview

The client provides account registration and login, room browsing and detail views, room management screens, booking requests, and a user's booking list. The API stores users, rooms, and bookings in MongoDB. Protected API requests use JSON Web Tokens (JWT).

This is currently a development/demo application. There is no separate admin role, production deployment configuration, or automated test suite configured.

## Key Features

* Register an account and log in with email and password.
* Hash passwords with `bcryptjs`; issue JWTs that expire after one day.
* Browse room listings and inspect room type, monthly price, capacity, occupancy, availability, description, and image.
* Create, update, and delete rooms; attach an image when creating or updating a room.
* Submit a booking request with a start and end date.
* List, inspect, update the status of, and delete the signed-in user's bookings.
* Track booking statuses: `Pending`, `Approved`, `Rejected`, and `Cancelled`.
* Update room occupancy when an approved booking is approved, cancelled, rejected, or deleted.

## Technology Stack

| Area           | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Client         | Expo SDK 57, React Native, React, TypeScript, Expo Router |
| API            | Node.js, Express 5, CommonJS                              |
| Database       | MongoDB with Mongoose                                     |
| Authentication | JSON Web Tokens and bcryptjs                              |
| Image upload   | Multer to local disk                                      |

## System Workflow

The Expo client sends HTTP requests to the Express API. The API validates JWTs for protected routes and reads or writes MongoDB documents. Room images are stored on the API host and served as static files.

### User workflow

1. A new user registers with a name, email, and password.
2. The user logs in; the API returns a JWT and user details. The client stores these locally and sends the token on protected requests.
3. The user browses rooms, opens room details, and submits a booking request for an available room.
4. The API creates a booking with `Pending` status. The user can review bookings and update or cancel their own booking.
5. A booking status change to `Approved` increases room occupancy. Rejecting or cancelling an approved booking, or deleting it, releases occupancy.

Room create, edit, and delete screens are available to any authenticated user. There is no separate staff/admin workflow or role model in the current implementation.

## Services and Ports

| Service      | Default Port | Run Command                         | Notes                                                                    |
| ------------ | -----------: | ----------------------------------- | ------------------------------------------------------------------------ |
| Express API  |       `5000` | From repository root: `npm run dev` | Can be changed with the `PORT` environment variable.                     |
| MongoDB      |      `27017` | Start the local MongoDB service     | For hosted MongoDB, set `MONGO_URI`; no local MongoDB process is needed. |
| Expo / Metro |       `8081` | From `frontend/`: `npm run dev`     | Expo may select another available port; use the URL printed by Expo.     |

The API starts listening only after MongoDB connects. `GET /test` returns a small response to verify that the API is reachable.

## Requirements

* Node.js 20.19 or later and npm.
* A reachable MongoDB deployment, either local or hosted.
* For native testing: Expo Go or a configured Android emulator / iOS simulator.
* For web testing: a supported browser.

## Environment Variables

The API loads `backend/.env` in `backend/server.js`. This file is ignored by Git and must be created locally.

| Variable     | Required | Purpose                                               |
| ------------ | -------- | ----------------------------------------------------- |
| `MONGO_URI`  | Yes      | MongoDB connection string.                            |
| `JWT_SECRET` | Yes      | Secret used to sign and verify JWTs. Keep it private. |
| `PORT`       | No       | API port; defaults to `5000`.                         |

Example local configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hostalmate
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

For MongoDB Atlas, use the connection string configured for your cluster. Do not commit real credentials or secrets.

## Installation & Setup

Run commands from the repository root unless a command explicitly changes directory.

### 1. Install API Dependencies

```sh
npm install
```

The root `package.json` provides the repository-level API development command. `backend/package.json` also provides scripts for running the API from the `backend/` directory.

Before starting, configure the variables listed in **Environment Variables** and ensure MongoDB is reachable.

### 2. Install Client Dependencies

```sh
cd frontend
npm install
```

## Running the Application

### Start the Backend API

In terminal 1, from the repository root:

```sh
npm run dev
```

Expected startup messages include a successful MongoDB connection and:

```text
Server is running on port 5000
```

If the API does not start, first check `backend/.env`, MongoDB availability, and whether port `5000` is already in use.

### Verify the Backend API

Open a browser or API client and request:

```text
http://127.0.0.1:5000/test
```

Expected response:

```json
{"message":"Main server is working!"}
```

You can also test from PowerShell:

```powershell
Invoke-WebRequest http://127.0.0.1:5000/test
```

### Start the Frontend

In terminal 2:

```sh
cd frontend
npm run dev
```

Use the URL or QR code printed by Expo.

Available target-specific scripts, run from `frontend/`:

```sh
npm run web
npm run android
npm run ios
```

The Android and iOS scripts require the corresponding simulator/emulator or device setup.

## Frontend, Backend & API URLs

The following table shows the main URLs used during local development and testing.

| Component            | URL                                            | Purpose                                            |
| -------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Backend API          | `http://127.0.0.1:5000`                        | Express backend server                             |
| Backend Test         | `http://127.0.0.1:5000/test`                   | Verify that the API is running                     |
| Auth Test            | `http://127.0.0.1:5000/api/auth/test`          | Verify that the authentication router is reachable |
| Frontend Web         | `http://localhost:4200`*                       | Frontend browser application                       |
| Android Emulator API | `http://10.0.2.2:5000`                         | Connect Android emulator to local backend          |
| Physical Phone API   | `http://<computer-LAN-IP>:5000`                | Connect a physical phone to the local backend      |
| Deployed Backend API | `https://hostel-booking-api-nl99.onrender.com` | Current checked-in remote API address              |

* Expo may use another browser port depending on the local configuration. Always use the URL printed by Expo when the actual frontend port differs.

## Client API Address

The frontend currently hard-codes `API_URL` in multiple screen files under `frontend/src/app/`.

The checked-in client value is:

```text
https://hostel-booking-api-nl99.onrender.com
```

For local API testing, replace the API address consistently in every screen that declares `API_URL`.

### Browser on the Same Computer

If the frontend is running in a browser on the same computer as the local backend:

```text
http://127.0.0.1:5000
```

Example:

```ts
const API_URL = "http://127.0.0.1:5000";
```

### Android Emulator

If the frontend is running on an Android emulator:

```text
http://10.0.2.2:5000
```

Example:

```ts
const API_URL = "http://10.0.2.2:5000";
```

`10.0.2.2` represents the host computer from the standard Android emulator.

### Physical Phone

If testing from a physical phone, use the computer's reachable LAN IPv4 address:

```text
http://<computer-LAN-IP>:5000
```

Example:

```text
http://192.168.1.100:5000
```

Example configuration:

```ts
const API_URL = "http://192.168.1.100:5000";
```

The phone and computer must be connected to a network that allows device-to-device communication.

> `localhost` and `127.0.0.1` on a physical phone refer to the phone itself, not the computer running the backend.

The previous address `10.165.196.224:5000` should only be used if that address is currently the computer's reachable LAN IP.

The current client does not load the API address from an environment variable. Keep the API URL consistent in every screen that declares `API_URL`.

## API Address & Authentication

The default local API base URL is:

```text
http://127.0.0.1:5000
```

Registration and login endpoints are public.

Protected API requests require:

```http
Authorization: Bearer <jwt-token>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Project Structure

```text
Hostalmate/
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
|-- backend/
|   |-- .env
|   |-- package.json
|   |-- server.js
|   |-- uploads/
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- bookingController.js
|   |   `-- roomController.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   `-- uploadMiddleware.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Room.js
|   |   `-- Booking.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- roomRoutes.js
|   |   `-- bookingRoutes.js
|   `-- room.jpg
`-- frontend/
    |-- app.json
    |-- package.json
    |-- assets/
    `-- src/
        |-- app/
        |   |-- index.tsx
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

Generated folders such as `node_modules/`, `.expo/`, `dist/`, and `web-build/` are not part of the source layout.

## Authentication & Authorization

* Registration is public.
* Passwords are hashed with `bcryptjs` before being stored.
* Login is public and returns a signed JWT that expires after one day.
* Protected endpoints expect `Authorization: Bearer <token>`.
* The API verifies the token with `JWT_SECRET` and assigns its user ID to the request.
* Room and booking routes require a valid token.
* Booking read, update, and delete operations check that the booking belongs to the current user.
* There are no roles.
* Any authenticated user can create, update, or delete rooms.
* A booking owner can set their booking to any accepted status, including `Approved`.

## Room Management

Rooms support the types:

* `Single`
* `Double`
* `Triple`

A room stores:

* `roomNumber`
* `roomType`
* `pricePerMonth`
* `capacity`
* `currentOccupancy`
* `description`
* `image`
* `availabilityStatus`

Availability can be:

```text
Available
Full
```

Room listing, details, creation, update, and deletion endpoints are protected by JWT authentication.

Room creation requires a room number, type, monthly price, and capacity.

## Booking Management

An authenticated user submits:

* `roomId`
* `startDate`
* `endDate`

Dates must parse successfully, the end date must be later than the start date, and the room must exist and not be marked `Full`.

New bookings start as:

```text
Pending
```

Allowed statuses are:

```text
Pending
Approved
Rejected
Cancelled
```

Approving a booking checks room capacity and increments occupancy.

Rejecting or cancelling an approved booking releases one occupant. Deleting an approved booking also releases occupancy.

## Database Models

| Model   | Fields                                                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| User    | `name`, unique `email`, hashed `password`, Mongoose timestamps                                                                      |
| Room    | `roomNumber`, `roomType`, `pricePerMonth`, `capacity`, `currentOccupancy`, `description`, `image`, `availabilityStatus`, timestamps |
| Booking | `userId`, `roomId`, `bookingDate`, `startDate`, `endDate`, `status`, timestamps                                                     |

## Image Uploads

Room creation and update accept an optional multipart/form-data file field named `image`.

Multer generates a timestamp-based filename with the original extension, and the room document stores the uploaded file path.

Express serves images under:

```text
/uploads/<filename>
```

The room-details screen builds the image URL from the API base address and that path.

The current upload middleware writes to the relative directory `uploads/`, while the server exposes `backend/uploads/`. The relative write destination depends on the API process's working directory. Confirm that uploads are written under the directory the server serves when running QA.

No file type or size limits are currently configured.

## API Endpoints

The API runs on:

```text
http://127.0.0.1:5000
```

Registration and login are public.

Room and booking endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Authentication

| Method | Path                 | Request Body                                           | Access |
| ------ | -------------------- | ------------------------------------------------------ | ------ |
| `POST` | `/api/auth/register` | `{ "name": "...", "email": "...", "password": "..." }` | Public |
| `POST` | `/api/auth/login`    | `{ "email": "...", "password": "..." }`                | Public |

Registration requires a name, email, and password.

The password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character.

Login returns a JWT and basic user information. The token expires after one day.

### Rooms

| Method   | Path             | Purpose        | Access       |
| -------- | ---------------- | -------------- | ------------ |
| `GET`    | `/api/rooms`     | List all rooms | JWT required |
| `GET`    | `/api/rooms/:id` | Read one room  | JWT required |
| `POST`   | `/api/rooms`     | Create a room  | JWT required |
| `PUT`    | `/api/rooms/:id` | Update a room  | JWT required |
| `DELETE` | `/api/rooms/:id` | Delete a room  | JWT required |

Room fields are:

```text
roomNumber
roomType
pricePerMonth
capacity
description
```

Create and update requests may include an optional multipart file field named `image`.

Uploaded files are served from:

```text
/uploads/<filename>
```

### Bookings

| Method   | Path                       | Purpose                                      | Access                    |
| -------- | -------------------------- | -------------------------------------------- | ------------------------- |
| `POST`   | `/api/bookings`            | Submit a booking request                     | JWT required              |
| `GET`    | `/api/bookings`            | List the signed-in user's bookings           | JWT required              |
| `GET`    | `/api/bookings/:id`        | Read a booking owned by the signed-in user   | JWT required              |
| `PUT`    | `/api/bookings/:bookingId` | Set booking status                           | JWT required; owner check |
| `DELETE` | `/api/bookings/:id`        | Delete a booking owned by the signed-in user | JWT required; owner check |

Create a booking with JSON containing:

```json
{
  "roomId": "...",
  "startDate": "...",
  "endDate": "..."
}
```

Dates must be valid and the end date must be after the start date.

### Diagnostics and Static Files

| Method | Path                 | Purpose                                  |
| ------ | -------------------- | ---------------------------------------- |
| `GET`  | `/test`              | Confirm that the Express server responds |
| `GET`  | `/api/auth/test`     | Confirm that the auth router responds    |
| `GET`  | `/uploads/:filename` | Retrieve a locally stored room image     |

## Error Handling / Validation

| Condition                                                                 | Current API Behavior                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Missing registration or login fields                                      | HTTP `400` with a message                                         |
| Weak registration password or duplicate email                             | HTTP `400` with a validation message                              |
| Missing, invalid, or expired bearer token                                 | HTTP `401`                                                        |
| Booking has missing fields, invalid dates, invalid status, or a full room | HTTP `400`                                                        |
| Room or booking does not exist                                            | HTTP `404`                                                        |
| User attempts to access another user's booking                            | HTTP `403`                                                        |
| Unexpected database/controller error                                      | Usually HTTP `500`; response bodies may include the error message |

Mongoose schemas enforce required fields and enum values for persisted models.

Controllers also validate required registration/login fields, password strength, booking date order, room capacity, status values, and booking ownership.

## QA Test Guide

Use a fresh test account and disposable room/booking data.

Before testing UI flows, confirm:

1. MongoDB is connected.
2. Backend is running on port `5000`.
3. `http://127.0.0.1:5000/test` responds successfully.
4. Frontend is running.
5. The frontend `API_URL` matches the selected testing environment.
6. The selected device can reach the backend address.

Mark each test as `Pass`, `Fail`, or `Blocked` during execution.

### QA Validation Table

| ID      | Test Area                     | Validation Action                                                | Expected Result                                                            | Status         |
| ------- | ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- |
| SET-01  | Environment Setup             | Start MongoDB and backend with valid environment variables       | MongoDB connects successfully and API starts on the configured port        | Not Run        |
| API-01  | Backend Health                | Request `GET /test`                                              | HTTP response contains `Main server is working!`                           | Not Run        |
| API-02  | Auth Health                   | Request `GET /api/auth/test`                                     | Auth route returns a successful response                                   | Not Run        |
| DB-01   | Database Persistence          | Create a user or room, restart the API, then retrieve the record | Previously saved data remains available                                    | Not Run        |
| AUTH-01 | Registration                  | Register with valid name, unique email, and compliant password   | Account is created successfully                                            | Not Run        |
| AUTH-02 | Registration Validation       | Submit registration with missing fields                          | API rejects the request with HTTP `400`                                    | Not Run        |
| AUTH-03 | Password Validation           | Register using a weak password                                   | API rejects the password with a validation message                         | Not Run        |
| AUTH-04 | Duplicate Account             | Register the same email twice                                    | Second registration is rejected                                            | Not Run        |
| AUTH-05 | Login                         | Login with valid credentials                                     | JWT and user details are returned                                          | Not Run        |
| AUTH-06 | Invalid Login                 | Login with unknown email or incorrect password                   | Login request is rejected                                                  | Not Run        |
| AUTH-07 | Protected Route               | Access protected endpoint without JWT                            | API returns HTTP `401`                                                     | Not Run        |
| AUTH-08 | Invalid JWT                   | Send malformed or invalid bearer token                           | API returns HTTP `401`                                                     | Not Run        |
| ROOM-01 | Room Listing                  | Login and request room list                                      | Available room records are returned                                        | Not Run        |
| ROOM-02 | Room Details                  | Open an existing room by ID                                      | Correct room details are displayed                                         | Not Run        |
| ROOM-03 | Room Creation                 | Create room with valid room number, type, price, and capacity    | Room is created successfully with zero occupancy                           | Not Run        |
| ROOM-04 | Room Validation               | Submit unsupported room type or missing required field           | Invalid room is rejected                                                   | Not Run        |
| ROOM-05 | Room Update                   | Update a disposable room                                         | Updated values persist correctly                                           | Not Run        |
| ROOM-06 | Room Availability             | Set occupancy equal to capacity                                  | Room availability changes to `Full`                                        | Not Run        |
| ROOM-07 | Room Deletion                 | Delete a disposable room                                         | Room is deleted and cannot be retrieved                                    | Not Run        |
| IMG-01  | Image Upload                  | Create room with an image                                        | Image is uploaded and stored successfully                                  | Not Run        |
| IMG-02  | Image Retrieval               | Request uploaded image through `/uploads/<filename>`             | Image is returned successfully                                             | Not Run        |
| BOOK-01 | Booking Creation              | Book an available room using valid dates                         | Booking is created with `Pending` status                                   | Not Run        |
| BOOK-02 | Booking Required Fields       | Submit booking without required fields                           | Request is rejected with validation response                               | Not Run        |
| BOOK-03 | Booking Date Validation       | Use invalid dates or end date before/equal to start date         | Booking is rejected                                                        | Not Run        |
| BOOK-04 | Full Room Booking             | Attempt booking for a room marked `Full`                         | Booking request is rejected                                                | Not Run        |
| BOOK-05 | Booking List                  | Open signed-in user's bookings                                   | Only current user's bookings are displayed                                 | Not Run        |
| BOOK-06 | Booking Details               | Open a booking owned by current user                             | Booking details are displayed                                              | Not Run        |
| BOOK-07 | Booking Ownership             | Use another account to access the first user's booking           | API returns HTTP `403`                                                     | Not Run        |
| BOOK-08 | Booking Approval              | Approve a pending booking                                        | Status becomes `Approved` and room occupancy increases                     | Not Run        |
| BOOK-09 | Capacity Validation           | Approve booking when room is already at capacity                 | Approval is rejected                                                       | Not Run        |
| BOOK-10 | Occupancy Release             | Cancel or reject an approved booking                             | Room occupancy decreases correctly                                         | Not Run        |
| BOOK-11 | Delete Approved Booking       | Delete an approved booking                                       | Booking is deleted and occupancy is released                               | Not Run        |
| UI-01   | Registration UI               | Complete registration from frontend                              | Account is created and appropriate result is shown                         | Not Run        |
| UI-02   | Login UI                      | Login with valid credentials                                     | User reaches rooms screen                                                  | Not Run        |
| UI-03   | Room UI                       | Browse and open room details                                     | Room information is displayed correctly                                    | Not Run        |
| UI-04   | Room Management UI            | Add, edit, and delete a disposable room                          | UI reflects successful API changes                                         | Not Run        |
| UI-05   | Booking UI                    | Create and view a booking                                        | Booking information is displayed correctly                                 | Not Run        |
| UI-06   | Booking Status UI             | Update or cancel a booking                                       | New booking status is reflected in UI                                      | Not Run        |
| UI-07   | Error Handling UI             | Test invalid input and unavailable API                           | Appropriate error/alert is displayed                                       | Not Run        |
| NET-01  | Browser Connectivity          | Run frontend in browser using `127.0.0.1:5000`                   | Browser client reaches local API                                           | Not Run        |
| NET-02  | Android Emulator Connectivity | Run frontend using `10.0.2.2:5000`                               | Emulator reaches local API                                                 | Not Run        |
| NET-03  | Physical Phone Connectivity   | Run frontend using computer LAN IP                               | Phone reaches local API and room images load                               | Not Run        |
| NET-04  | API URL Consistency           | Check all frontend files containing `API_URL`                    | All screens use the intended API address                                   | Not Run        |
| CMD-01  | Frontend Lint                 | Run `npm run lint` from `frontend/`                              | Command completes without lint errors                                      | Not Run        |
| CMD-02  | TypeScript Check              | Run `npx tsc --noEmit -p tsconfig.json` from `frontend/`         | TypeScript check completes without errors                                  | Not Run        |
| CMD-03  | Automated Tests               | Run `npm test` from repository root                              | Automated test suite should execute; currently the script is a placeholder | Not Configured |

## Cypress / Database Testing Notes

Cypress database/dashboard failures or timeouts should be investigated separately from backend startup.

If the backend terminal shows:

```text
MongoDB Database Connected Successfully!
Server is running on port 5000
```

the API has started successfully.

For Cypress failures involving database tables, verify:

* The expected schema is selected.
* The expected table name matches the generated table name.
* Generated `animal_table_*` tables are not causing unexpected table lists.
* The Cypress timeout is sufficient for the database operation.
* The test does not depend on stale or previously generated database tables.

A Cypress database/dashboard timeout does not by itself indicate that the backend API failed to start.

## Validation Commands

### Frontend Lint

Run from `frontend/`:

```sh
cd frontend
npm run lint
```

### TypeScript Validation

Run from `frontend/`:

```sh
npx tsc --noEmit -p tsconfig.json
```

### Backend Health Check

From PowerShell:

```powershell
Invoke-WebRequest http://127.0.0.1:5000/test
```

### Authentication Health Check

```powershell
Invoke-WebRequest http://127.0.0.1:5000/api/auth/test
```

### Automated Test Command

From the repository root:


npm test
```

The root `npm test` script is currently a placeholder and does not represent a configured automated test suite.

## Known Limitations and QA Notes

* The API address is hard-coded in multiple frontend screens and must be adjusted for each local network/device setup.
* Browser testing on the same computer can use `http://127.0.0.1:5000`.
* Android emulator testing should use `http://10.0.2.2:5000`.
* Physical phone testing requires the computer's reachable LAN IP.
* The current checked-in remote API address is `https://hostel-booking-api-nl99.onrender.com`.
* There are no user roles.
* Any authenticated account can use room create, update, and delete endpoints.
* Booking status changes are available to the booking owner.
* Room images are stored on the API host's local disk.
* There is no cloud object storage.
* No upload file type or size limits are currently configured.
* The upload middleware uses a relative `uploads/` path; verify that uploaded files are written to the directory exposed by the static middleware.
* The current client does not load `API_URL` from an environment variable.
* The root `npm test` script is not an automated test suite.
* CI, deployment, monitoring, and production secrets management are not configured here.
* Native device testing requires the backend to be reachable from the selected device.
* `localhost` or `127.0.0.1` should not be used as the backend address from a physical phone.
* Use disposable accounts, rooms, and bookings when executing destructive QA tests.
