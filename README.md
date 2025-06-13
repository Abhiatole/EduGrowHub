# EduGrowHub 🎓

EduGrowHub is a full-stack educational institute management web app. It enables secure login for Superadmin, Teachers, and Students, allowing teachers to enroll students, record test marks, and send WhatsApp notifications automatically via Twilio.

---

## 💻 Tech Stack

| Layer       | Technology                                  |
|------------|----------------------------------------------|
| Backend     | Java 17, Spring Boot, Spring Security, JWT  |
| Frontend    | ReactJS, Tailwind CSS                       |
| Database    | MySQL (AWS RDS)                             |
| Deployment  | AWS EC2 (backend), S3 (frontend), RDS       |
| Messaging   | Twilio API (WhatsApp Notifications)         |
| CI/CD       | GitHub + GitHub Copilot + GitHub Actions    |

---

## � Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Node.js (for frontend development)

### Backend Setup
1. Clone the repository
2. Navigate to the project directory
3. Update database configuration in `src/main/resources/application.properties`
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Dependencies Included
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- MySQL Connector/J
- Lombok

---

## 🗂️ Project Structure

```
EduGrowHub/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── edugrowhub/
│   │   │           └── EduGrowHubApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/
│               └── edugrowhub/
│                   └── EduGrowHubApplicationTests.java
├── pom.xml
└── README.md
