# BlueBytes Website

A 3‑page responsive website with a Node.js backend for handling contact form submissions.

## 📁 Project Structure
- `frontend/` — HTML, CSS, JS
- `backend/` — Node.js + Express server

---

## 🚀 Running Locally

### 1. Install backend dependencies
cd backend
npm install


### 2. Create `.env`
EMAIL_USER=your_email_here
EMAIL_PASS=your_app_password_here

### 3. Start backend
npm start


### 4. Open frontend
Open `frontend/index.html` in your browser.

---

## 🌐 Deploying

### Frontend
Deploy `frontend/` to:
- GitHub Pages
- Netlify
- Vercel
- Azure Static Web Apps

### Backend
Deploy `backend/` to:
- Azure App Service
- Render.com
- Railway.app
- Heroku
- AWS EC2 / Lightsail

Set environment variables in your hosting provider.

---

## 🛡️ Security Notes
- Use an email provider with App Passwords (Gmail, Outlook, etc.)
- Never expose `.env` publicly
- Use HTTPS in production

---

## 🧩 Contact Form Endpoint
POST `/contact`

Payload:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "agency": "City PD",
  "message": "Hello!"
}
