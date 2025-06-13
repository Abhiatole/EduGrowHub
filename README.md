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

## 🗂️ Folder Structure

```bash
EduGrowHub/
├── backend/   # Spring Boot app
├── frontend/  # React + Tailwind app
