# FitSync (Project MaVe)

FitSync — referred to as **Project MaVe** throughout the repository — is a fitness tracking web application built with **ASP.NET Razor Pages** and **MariaDB**.  
It integrates **Google AI Studio** to help users generate personalized workouts and track their fitness progress over time.

---

## Features

- AI-powered workout generation via Google AI Studio  
- Track workouts, sets, reps, and weights  
- View historical workout data and progress  
- Secure authentication with salted + hashed passwords  
- Dockerized for consistent deployment and local testing

---

## Tech Stack

| Component     | Technology |
|----------------|-------------|
| **Backend** | ASP.NET Core (Razor Pages) |
| **Database** | MariaDB |
| **AI Integration** | Google AI Studio |
| **Containerization** | Docker |
| **Language** | C# |
| **Frontend** | Razor + HTML/CSS (via ASP.NET) |

---

## Project Structure
```
FitSync/
│
├── appsettings.Development.json    # Local configuration (DB connection, logging)
├── appsettings.json                # Default configuration
├── bin/                            # Compiled binaries
├── Constants.cs                    # Global constants and configuration values
├── Data/                           # Database context and seed logic
├── Dockerfile                      # Container build instructions
├── Interfaces/                     # Service and repository interfaces
├── Middleware/                     # Custom ASP.NET middleware
├── Models/                         # Entity and view models
├── obj/                            # Build artifacts
├── Pages/                          # Razor Pages (UI)
├── Program.cs                      # Main entry point
├── ProjectMaVe.csproj              # Project file
├── Properties/                     # ASP.NET configuration
├── redeploy.sh                     # Helper script for redeploying container
├── Services/                       # Business logic and service implementations
├── test-deploy.sh                  # Local deploy script for testing
├── Widgets/                        # Reusable UI components
└── wwwroot/                        # Static web assets (CSS, JS, images)
```

---

## Database Schema

The core entities are users, workouts, exercises, and the relationships between them.

### **Users**
| Field | Type | Notes |
|--------|------|-------|
| user_id | INT (PK, auto_increment) | Unique user identifier |
| email | VARCHAR(50), UNIQUE | User email |
| password_hash | BINARY(64) | Hashed password |
| password_salt | BINARY(64) | Salt for hashing |
| first_name | VARCHAR(20) | User first name |
| last_name | VARCHAR(20) | Optional last name |

### **Workouts**
| Field | Type | Notes |
|--------|------|-------|
| workout_id | INT (PK, auto_increment) | Unique workout ID |
| user_id | INT (FK → Users) | Linked user |
| workout_date | DATE | Date of workout |

### **Workout_Exercises**
| Field | Type | Notes |
|--------|------|-------|
| workout_exercise_id | INT (PK, auto_increment) | Entry ID |
| workout_id | INT (FK → Workouts) | Parent workout |
| exercise_id | INT (FK → Exercises) | Exercise reference |
| sets | INT | Number of sets |
| reps | INT | Reps per set |
| weight | DECIMAL(5,2) | Optional weight used |

### **Exercises**
| Field | Type | Notes |
|--------|------|-------|
| exercise_id | INT (PK, auto_increment) | Exercise ID |
| name | VARCHAR(100) | Exercise name |
| muscle_group | VARCHAR(50) | Target muscle group |

---

## Running with Docker (Local Testing)

The app can be built and run inside a Docker container.

### 1. Build the image

```bash
docker build -t projectmave:latest .
```

### 2. Run the container

```bash
docker run -d -p 127.0.0.1:8080:8080 \
  -v /opt/project/DataProtection-Keys:/root/.aspnet/DataProtection-Keys \
  --env-file ./.env \
  --name projectmave projectmave:latest
```

### 3. Stop and remove the container

```bash
docker rm -f projectmave
```

---

## Environment Configuration

Before running locally, ensure a .env file is present at the root.

```bash
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__MaVe=server=localhost;port=3306;database=mave;user=root;password=password
AI_API_KEY=your-google-ai-studio-key
```

---

## Deployment

FitSync is deployed on a VPS using Docker

---

## Development Team

| Name | Role |
|------|------|
|Aiden Carrera | Frontend |
|Joshua Wyckoff	| Frontend |
|Haoran Yue	| Backend |
|Tyler Clayton | Backend |
|Alex Seda | Database |

---

"Train smarter, not harder - with FitSync."

