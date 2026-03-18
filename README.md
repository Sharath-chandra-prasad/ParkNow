# ParkNow - Real-Time Parking Slot Booking System

![ParkNow Overview](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

ParkNow is a premium MERN stack web application designed to solve modern urban parking challenges. It allows users to find, select, and book parking slots in real-time across various Indian cities with geographical precision. The platform features an advanced glassmorphic UI, real-time slot availability, OTP-verified email booking flows, and comprehensive admin dashboard controls.

## ✨ Key Features

- **Real-Time Booking & Availability:** View slot statuses in real-time. Slots are locked temporarily during the checkout process to prevent double-booking.
- **State-Wise Segmentation:** Geographically accurate grouping of 71+ premium parking locations across 7 major Indian states.
- **Premium User Interface:** A modern, gap-free glassy blur aesthetic with moving background shapes, dark theme optimization, and responsive design across all devices.
- **Secure Authentication:** JWT-based user authentication, requiring strong passwords (uppercase, lowercase, number, special char).
- **Email & OTP Verification:** Secure booking confirmations via OTP verification sent directly to the user's email using Nodemailer. Actional transactional emails for booking confirmations and cancellations.
- **Isometric Visual Grid:** Interactive visual representation of parking spaces for intuitive selection.
- **Admin Dashboard:** Full administrative control over users, parking areas, slots, and overall booking metrics.

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router DOM, React Icons, Vanilla CSS (Glassmorphism design system), Vite, Axios, React-Toastify.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Atlas / Local) with Mongoose ODM.
- **Authentication & Security:** JSON Web Tokens (JWT), Bcrypt.js.
- **Email Service:** Nodemailer.

## 📂 Project Structure

```text
ParkNow/
├── Backend/               # Express REST API Server
│   ├── config/            # DB Configuration
│   ├── controllers/       # Route Logic (Auth, Bookings, Slots)
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   ├── scripts/           # DB Seeding Scripts (e.g., seedParkingAreas.js)
│   ├── utils/             # Helper Functions (Nodemailer config)
│   └── server.js          # Entry Point
│
└── Frontend/              # React Client Application
    ├── public/            # Static Assets
    ├── src/
    │   ├── assets/        # Background Images & Icons
    │   ├── components/    # Reusable UI Components (Navbar, PremiumTimePicker)
    │   ├── context/       # React Context (AuthContext)
    │   ├── pages/         # Application Views (Home, Login, Dashboard, etc.)
    │   ├── App.jsx        # Root Component & Global Background Handling
    │   ├── index.css      # Core Design Tokens & Glassmorphic Variables
    │   └── main.jsx       # React DOM Entry
```

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URL)
- Npm or Yarn package manager

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd ParkNow
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```
*(Note: To use Nodemailer with Gmail, generate an "App Password" from your Google Account settings).*

**Seed Database (Optional but recommended):**
To populate the database with geographical locations and starting slots:
```bash
npm run seed
```

**Start the Backend Server:**
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal window:

```bash
cd Frontend
npm install
```

**Start the Frontend Application:**
```bash
npm run dev
```
The client will start on `http://localhost:5173` (or the nearest available port).

---

## 🎨 UI/UX Highlights

- **Global Gap-Free Background**: `PageBackground.jsx` combined with absolute viewport CSS rules ensures a consistent, high-fidelity backdrop across all routes without edge clipping.
- **Rupee Localization**: Native ₹ currency formatting implemented globally.
- **Scroll Conflict Isolation**: Custom event preventing multiple nested scroll bars while parsing horizontal parking sliders.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
