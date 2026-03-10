Virtual Queue Management System (VQueue)

VQueue is a web-based virtual queue management system that allows users to join service queues remotely and track their position in real time. It helps reduce physical waiting lines in places like government offices, hospitals, banks, and service centers.

The system provides an admin dashboard, user queue tracking, and a public display board similar to those used in real service counters.

Live Demo
https://virtual-queue-zqfr.onrender.com
Features

Join queues remotely without waiting physically

Real-time token status tracking

Admin dashboard to manage queues

Appointment scheduling system

Emergency priority queue (₹30 payment via QR)

Public display screen showing current and upcoming tokens

Google OAuth login support

Automatic service availability calculation

Tech Stack

Frontend & Backend

Next.js

Database

SQLite using better-sqlite3

Deployment

Render

Version Control

GitHub

Project Structure
src/
 ├── app/
 │   ├── admin/
 │   ├── dashboard/
 │   ├── display/
 │   ├── api/
 │   └── login/register
 ├── lib/
 │   ├── db.ts
 │   ├── auth.ts
 │   └── availability.ts
public/
data/
 └── vqueue.db
Installation (Local Setup)

Clone the repository:

git clone https://github.com/narriakhil-oss/Virtual-queue.git

Install dependencies:

npm install

Run development server:

npm run dev

Open in browser:

http://localhost:3000
Use Case

VQueue can be used in:

Government service centers

Hospitals and clinics

Banks

RTO offices

Customer service counters

It improves service efficiency, reduces crowding, and optimizes waiting time.

Author

Akhil
Computer Science Student
Manikanta
Computer Science Student
Sufiyaan
Computer Science Student


License

This project is for educational and demonstration purposes.
