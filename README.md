# ID Finder - Ghana

A system for reuniting Ghanaian citizens with their lost national ID cards. When someone finds a lost card, they can take it to the nearest police station or government office where staff input it into the system. Citizens can then search for their cards online and claim them.

## Features

### Public Features
- **Search by ID**: Enter ID number and card type to find your card
- **Search by Person**: Use first name, last name, and date of birth if you don't remember your ID number
- **Claim Process**: Create a claim request with contact information and receive a reference code
- **Safe Preview**: Only masked/safe information is shown publicly

### Staff Features
- **Authentication**: Secure login for police/government staff
- **Card Management**: Add new found cards, edit details, mark as claimed
- **Location Management**: Manage pickup locations (police stations, government offices)
- **Claims Management**: Process claim requests and mark cards as collected
- **Role-based Access**: Admin, Intake Officer, and Viewer roles

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing

## Project Structure

```
ID Finder/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API routes (public, staff)
│   │   ├── middleware/ # Auth middleware
│   │   ├── index.ts  # Server entry point
│   │   └── seed.ts    # Database seeding
│   ├── prisma/       # Database schema and migrations
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── App.tsx   # Main application component
│   │   └── main.tsx  # Entry point
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy .env file (already created)
   # Edit DATABASE_URL, JWT_SECRET, PORT as needed
   ```

4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Seed initial data (admin user + sample locations):
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:4000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## API Endpoints

### Public Endpoints
- `GET /api/public/search/by-id` - Search by ID number and card type
- `GET /api/public/search/by-person` - Search by name and date of birth
- `POST /api/public/claims` - Create a claim request

### Staff Endpoints (Requires Authentication)
- `POST /api/staff/auth/login` - Staff login
- `GET /api/staff/cards` - List all cards
- `POST /api/staff/cards` - Create new card
- `PATCH /api/staff/cards/:id` - Update card
- `GET /api/staff/locations` - List locations
- `POST /api/staff/locations` - Create location (Admin only)
- `GET /api/staff/claims` - List claims
- `PATCH /api/staff/claims/:id` - Update claim status

## Default Admin Account

After running the seed script:
- **Email**: admin@idfinder.gh
- **Password**: admin123

## Card Types Supported

- Ghana Card (NIA)
- Driver's License
- Voter ID
- NHIS Card
- Passport

## Security Features

- JWT-based authentication for staff
- Password hashing with bcrypt
- Role-based access control
- Data masking for public display
- CORS protection
- Input validation with Zod

## Development

### Database Management
```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:migrate:reset

# Generate Prisma client
npm run prisma:generate
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
