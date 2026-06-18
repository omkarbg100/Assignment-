# SortMyScene Ticket Booking

Full-stack MERN + Tailwind CSS ticket booking app with authenticated seat reservations, a 10-minute hold timer, and double-booking protection.

## Objective

Users can:

1. Register or log in.
2. Browse events.
3. Open an event and view a seat grid.
4. Select available seats.
5. Reserve seats for 10 minutes.
6. Confirm the booking before the reservation expires.
7. See a success screen with the booked seats.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router DOM, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, dotenv, cors

## Project Structure

- `backend/` - Express API and MongoDB models
- `frontend/` - React UI

## Environment Variables

Create these files from the examples:

- `backend/.env`
- `frontend/.env`

### Backend

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sortmyscene
JWT_SECRET=replace_me_with_a_long_secret
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=replace_me_with_a_separate_admin_secret
ADMIN_JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## How To Run

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker

Run the full stack with MongoDB, backend, and frontend:

```bash
docker compose up --build
```

After startup:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

Notes:

- Frontend routes such as `/admin/login` and `/events/:id` are handled by Nginx.
- API requests are proxied from the frontend container to the backend container at `/api`.
- To load sample events and seats in Docker, run:

```bash
docker compose exec backend node src/utils/seed.js
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Admin Auth

- `POST /api/admin/login`

### Events

- `GET /api/events`
- `GET /api/events/:id`

### Reservations

- `POST /api/reserve`

### Bookings

- `POST /api/bookings`

### Admin Management

- `POST /api/admin/events`
- `PUT /api/admin/events/:id`
- `DELETE /api/admin/events/:id`
- `GET /api/admin/bookings`
- `GET /api/admin/reservations`
- `GET /api/admin/events/:id/seats`

## Database Models

- `User`: `name`, `email`, `password`, `createdAt`
- `Event`: `name`, `description`, `dateTime`, `venue`, `totalSeats`, `posterUrl`, `createdAt`
- `Seat`: `eventId`, `seatNumber`, `status`, `reservedBy`, `reservationId`, `updatedAt`
- `Reservation`: `userId`, `eventId`, `seatNumbers`, `expiresAt`, `status`
- `Booking`: `userId`, `eventId`, `seatNumbers`, `reservationId`, `bookedAt`
- `Admin`: `email`, `password`, `role`, `createdAt`

## Double Booking Prevention

The backend only reserves seats whose status is `available`. If even one selected seat is already reserved or booked, the whole reservation request is rejected.

During booking, the backend only allows seats that are still `reserved` by the same user and tied to the same reservation record. MongoDB transactions keep the seat updates and booking record aligned.

## Reservation Expiry

Reservations expire after 10 minutes.

This is handled in three places:

1. The frontend shows a countdown timer.
2. The booking endpoint rejects expired reservations.
3. The cleanup utility releases stale reservations and frees seats.

## Assumptions

- MongoDB transactions are available on the target database.
- The backend is seeded before testing the UI.
- Authentication is JWT-based with the token stored in localStorage for the frontend flow.
- Admin documents are inserted manually into MongoDB with a hashed password and `role: "admin"`.
- Admin and user JWTs are stored separately in the browser.

## Notes

- Sample event posters are optional and included in the seed data.
- The first-time login credentials after seeding are:
  - Email: `omkar@gmail.com`
  - Password: `123456`
- Admin demo login:
  - Email: `ab@gmail.com`
  - Password: `123`
- There is no `/api/admin/register` route.
