# Heritage Walk Trail Content Management & Visitor Feedback Analytics Dashboard

A production-grade, full-stack web application designed for cultural heritage preservation, curated walking trail exploration, and data-driven visitor feedback analytics. Built as an academic final-year project.

---

## 1. Project Overview

The **Heritage Walk Trail Content Management and Visitor Feedback Analytics Dashboard** provides an interactive platform where:
* **Visitors** can explore heritage sites, view comprehensive historical and architectural narratives, follow curated ordered walking trails (e.g. Red Fort → Qutub Minar → Taj Mahal), register/login, and submit verified ratings and feedback.
* **Administrators** have access to a secure management panel to manage heritage sites, curate walking trails and sequential stops, moderate visitor accounts, and analyze real-time visitor ratings and sentiment distributions derived directly from MySQL database entities.

---

## 2. Key Features

### Visitor Features
* **Interactive Landing Page**: Modern heritage-themed hero section, stat tickers, featured sites preview, and curated walking trail highlights.
* **Heritage Exploration**: Search by keywords, filter by geographic location and historical era.
* **Monument Details View**: High-resolution imagery, historical background, architectural styles, cultural significance highlights, GPS coordinates with Google Maps links, and visitor review lists.
* **Curated Walking Trails**: Overview cards with distance (km), estimated walking duration (mins), difficulty levels (`EASY`, `MODERATE`, `HARD`), and starting/ending points.
* **Ordered Trail Stops**: Step-by-step sequential itineraries (`1 → Stop A → 2 → Stop B → ...`) linking directly to site details.
* **Visitor Authentication**: Secure registration and login using Spring `HttpSession` and BCrypt password encryption.
* **Feedback & Reviews**: 1–5 star rating submission with written testimonials and personal feedback history.
* **Visitor Dashboard**: Personalized metrics (total reviews submitted, personal average rating, quick action shortcuts).

### Administrator Features
* **Real-time Analytics Dashboard**:
  * High-level metrics: Total Sites, Total Trails, Total Visitors, Total Feedback, Overall Average Rating.
  * Star Rating Distribution breakdown (percentage and count of 5⭐, 4⭐, 3⭐, 2⭐, 1⭐).
  * Monument-by-monument rating performance table.
* **Heritage Site CRUD**: Create, read, update, and delete historical monuments with coordinates and image URLs.
* **Trail & Stop Management**: Create and edit trails, assign heritage sites as stops, reorder stops (Move Up/Down), and delete stops.
* **Feedback Moderation**: View all submitted reviews with dynamic filtering by site or star rating.
* **User Management**: View all registered visitors and activate or deactivate accounts in one click.

---

## 3. Technology Stack

### Frontend
* **HTML5 & CSS3**
* **Vanilla JavaScript (ES6+)** with native `fetch()` API
* **Bootstrap 5.3** (Responsive grid, modal dialogs, badges, and components)
* **Bootstrap Icons**
* Clean separation of concerns: All frontend code served as static files from `src/main/resources/static/`
* *No React, Angular, Vue, Tailwind, or Next.js used.*

### Backend
* **Java 17 (LTS)**
* **Spring Boot 3.3.4**
* **Spring Web** (REST API architecture with JSON responses)
* **Spring Data JPA & Hibernate** (ORM, automated table generation, criteria queries, aggregations)
* **Jakarta Bean Validation** (`@Valid`, `@NotBlank`, `@Email`, `@Min`, `@Max`, `@Positive`)
* **Spring Security Crypto** (`BCryptPasswordEncoder` used exclusively for password hashing)
* **Spring HttpSession** (Session-based state management; no JWT)

### Database
* **MySQL 8.0**
* Relational schema with foreign-key constraints across `users`, `heritage_sites`, `trails`, `trail_stops`, and `feedback`.

---

## 4. Project Architecture

```text
src/
└── main/
    ├── java/
    │   └── com/
    │       └── heritagewalk/
    │           ├── config/
    │           │   ├── AuthInterceptor.java       (Role-based route protection)
    │           │   ├── DataInitializer.java      (Automated DB seeding on startup)
    │           │   ├── SecurityBeansConfig.java   (BCryptPasswordEncoder bean)
    │           │   └── WebMvcConfig.java          (Static mapping & interceptors)
    │           ├── controller/
    │           │   ├── AdminAnalyticsController.java
    │           │   ├── AdminHeritageController.java
    │           │   ├── AdminTrailController.java
    │           │   ├── AdminUserController.java
    │           │   ├── AuthController.java
    │           │   ├── FeedbackController.java
    │           │   ├── HeritageController.java
    │           │   └── TrailController.java
    │           ├── dto/                           (Request and Response transfer models)
    │           ├── exception/                     (Global exception handler & REST errors)
    │           ├── model/                         (JPA Entities: User, HeritageSite, Trail, etc.)
    │           ├── repository/                    (Spring Data JPA Repositories)
    │           ├── service/                       (Business logic & transactions)
    │           └── HeritageWalkApplication.java   (Application entry point)
    │
    └── resources/
        ├── application.properties
        └── static/
            ├── index.html                         (Public landing page)
            ├── pages/
            │   ├── heritage.html                  (Sites catalog with filters)
            │   ├── heritage-details.html          (Site detail view & reviews)
            │   ├── trails.html                    (Trails catalog with filters)
            │   ├── trail-details.html             (Ordered stops timeline)
            │   ├── register.html                  (Visitor registration)
            │   ├── login.html                     (Visitor & admin sign in)
            │   ├── visitor-dashboard.html         (Visitor portal & summary)
            │   ├── feedback.html                  (Review submission form)
            │   └── my-feedback.html               (Visitor's review history)
            ├── admin/
            │   ├── dashboard.html                 (Operations & analytics)
            │   ├── heritage-management.html       (Heritage CRUD & modals)
            │   ├── trail-management.html          (Trail CRUD & stops manager)
            │   ├── feedback.html                  (Feedback moderation)
            │   └── users.html                     (Visitor accounts moderation)
            ├── css/
            │   ├── style.css                      (Heritage visual aesthetic)
            │   └── admin.css                      (Admin layout & charts)
            └── js/
                ├── auth.js                        (Session state & forms)
                ├── heritage.js                    (Site search & filtering)
                ├── heritage-details.js            (Site details & modal)
                ├── trails.js                      (Trails catalog & cards)
                ├── trail-details.js               (Stops timeline sequence)
                ├── feedback.js                    (Review submission)
                ├── visitor-dashboard.js           (Visitor summary & table)
                ├── admin-dashboard.js             (Analytics & metrics)
                ├── admin-heritage.js              (Site CRUD operations)
                ├── admin-trails.js                (Trail & stop operations)
                ├── admin-feedback.js              (Feedback moderation)
                └── admin-users.js                 (Account status toggle)
```

---

## 5. Database Setup & Configuration

### Prerequisites
* MySQL Server 8.0 running locally on port `3306`.
* Java 17 installed.

### Configuration (`src/main/resources/application.properties`)
The application is pre-configured with support for environment variables or direct properties:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/heritagewalk_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:root}
```

> **Note**: If your local MySQL root user has a password other than `root`, either:
> 1. Set the environment variable before running:
>    ```powershell
>    $env:SPRING_DATASOURCE_PASSWORD="YourPasswordHere"
>    ```
> 2. Or edit `src/main/resources/application.properties` directly.

### Automated Schema & Seed Data
* On first startup, Hibernate automatically creates all 5 tables (`users`, `heritage_sites`, `trails`, `trail_stops`, `feedback`).
* `DataInitializer.java` automatically runs on startup to seed:
  * 1 Administrator account
  * 3 Visitor accounts
  * 9 Landmark Heritage Sites
  * 3 Curated Walking Trails with ordered stops
  * 16 Real visitor reviews (so analytics immediately display rich graphs)

---

## 6. How to Run

### Step 1: Compile the Code
```powershell
.\mvnw.cmd clean compile
```

### Step 2: Run the Spring Boot Application
```powershell
.\mvnw.cmd spring-boot:run
```
*(Or run `HeritageWalkApplication.java` from your preferred IDE like IntelliJ IDEA or VS Code).*

### Step 3: Access the Application
Open your web browser and navigate to:
* **Public Landing Page**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
* **Login Page**: [http://localhost:8080/pages/login.html](http://localhost:8080/pages/login.html)
* **Admin Dashboard**: [http://localhost:8080/admin/dashboard.html](http://localhost:8080/admin/dashboard.html)

---

## 7. Default Demo Credentials

For viva demonstrations and evaluation:

| Role | Email | Password | Target Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@heritagewalk.com` | `Admin@123` | `/admin/dashboard.html` |
| **Visitor** | `visitor@heritagewalk.com` | `Visitor@123` | `/pages/visitor-dashboard.html` |
| **Visitor (Alt 1)** | `arun@example.com` | `Visitor@123` | `/pages/visitor-dashboard.html` |
| **Visitor (Alt 2)** | `sneha@example.com` | `Visitor@123` | `/pages/visitor-dashboard.html` |

> *Tip: The login page includes quick-fill buttons that populate these credentials with a single click.*

---

## 8. REST API Documentation

### Authentication
* `POST /api/auth/register` - Create new visitor account (validates name, email, password match, BCrypt hash)
* `POST /api/auth/login` - Authenticate visitor or admin via HttpSession
* `POST /api/auth/logout` - Invalidate session
* `GET  /api/auth/session` - Return current logged-in user profile or null

### Public Heritage Sites
* `GET  /api/heritage` - Search sites (query params: `search`, `location`, `period`)
* `GET  /api/heritage/featured` - Return top featured monuments
* `GET  /api/heritage/{id}` - Return site details with review count and average rating
* `GET  /api/heritage/meta/locations` - Distinct locations for filter dropdown
* `GET  /api/heritage/meta/periods` - Distinct periods for filter dropdown

### Public Trails
* `GET  /api/trails` - List all curated walking trails
* `GET  /api/trails/{id}` - Get trail details with ordered sequential stops

### Visitor Feedback
* `POST /api/feedback` - Submit rating (1–5) and review (requires visitor session)
* `GET  /api/feedback/my` - List current visitor's submitted reviews
* `GET  /api/feedback/site/{siteId}` - List public reviews for a specific monument

### Administrator Endpoints (Protected by `AuthInterceptor`)
* `GET    /api/admin/heritage` - List all sites for admin table
* `POST   /api/admin/heritage` - Create new heritage site
* `PUT    /api/admin/heritage/{id}` - Update heritage site
* `DELETE /api/admin/heritage/{id}` - Delete heritage site
* `GET    /api/admin/trails` - List all trails for admin table
* `POST   /api/admin/trails` - Create new trail
* `PUT    /api/admin/trails/{id}` - Update trail
* `DELETE /api/admin/trails/{id}` - Delete trail
* `POST   /api/admin/trails/{trailId}/stops` - Add heritage site as next stop
* `DELETE /api/admin/trails/{trailId}/stops/{stopId}` - Remove stop from trail
* `PUT    /api/admin/trails/{trailId}/stops/reorder` - Reorder trail stops
* `GET    /api/admin/users` - List all registered visitors
* `PUT    /api/admin/users/{id}/status` - Toggle active/deactivated status
* `GET    /api/admin/feedback` - Filterable feedback list (params: `siteId`, `rating`)
* `GET    /api/admin/analytics/stats` - Total counts and overall average rating
* `GET    /api/admin/analytics/rating-distribution` - Star rating distribution counts
* `GET    /api/admin/analytics/site-ratings` - Site-by-site review count and average rating

---

## 9. Future Enhancements (Extensibility Architecture)

The system is structured so future AI/ML and Natural Language modules can be plugged in via REST APIs without database restructuring:
1. **Machine Learning Sentiment Analytics**: An external Python/FastAPI service can consume `GET /api/admin/feedback`, apply NLP sentiment classification on visitor comments, and return sentiment trend scores.
2. **Heritage AI Chatbot**: An AI conversational assistant can ingest monument and trail data to answer visitor questions about visiting hours, historical context, and recommended walking paths.
