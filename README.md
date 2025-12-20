# Smart Exam Generator & Performance Prediction Platform

An AI-powered EdTech platform built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and Google Gemini. This platform streamlines the exam lifecycle, from AI-assisted creation to performance prediction.

## 🚀 Key Features

* **Role-Based Access Control**: Secure separation between Instructors (exam creators) and Students (exam takers).
* **AI-Powered Question Generation**: Automatically generates high-quality multiple-choice questions (MCQs) based on specific topics and difficulty levels using **Google Gemini 2.5 Flash**.
* **Smart Analytics & Predictions**:
    * Tracks and identifies a student's weak topics after each attempt.
    * Uses AI to predict a student's score for their next attempt based on historical performance.
* **Secure Exam Environment**: Includes a timer-based attempt system with server-side grading and performance tracking.
* **Detailed Feedback**: Provides AI-generated feedback and explanations for every question to enhance learning.

## 🔄 Project Workflow

### 1. Instructor Workflow
* **Authentication**: Instructors register and log in with assigned roles.
* **Exam Creation**: Instructors define exam metadata, including title, duration, and passing score.
* **AI Question Generation**: Instructors provide a topic and difficulty level. The system uses the Google Gemini API to generate a set of MCQs and explanations automatically.
* **Publishing**: Once questions are ready, the instructor publishes the exam to make it available to students.
* **Monitoring**: Instructors can view overall exam statistics, including average scores and top performers.

### 2. Student Workflow
* **Authentication**: Students register and log in to access the student dashboard.
* **Exam Participation**: Students browse published exams and start a timed attempt.
* **Real-time Grading**: Upon submission, the system evaluates answers server-side, calculates the final score, and determines pass/fail status.
* **AI Insights**: The platform analyzes the attempt to identify weak topics and provides a "Predicted Score" for the student's next attempt using AI analysis.
* **Review**: Students can review their answers along with AI-generated explanations for each question.

## 🛠 Tech Stack

* **Framework**: Next.js 16 (App Router).
* **Database**: PostgreSQL via Prisma ORM.
* **AI Engine**: Google Gemini Pro / Flash 2.5.
* **UI Components**: Tailwind CSS + Shadcn/UI.
* **Authentication**: Custom JWT (Jose + Bcryptjs).
* **Visualization**: Recharts for performance dashboards.

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/smart-exam-platform.git](https://github.com/your-username/smart-exam-platform.git)
    cd smart-exam-platform
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/exam_db"
    AI_API_KEY="your_google_gemini_api_key"
    JWT_SECRET="your_secure_jwt_secret"
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    npm run seed
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📜 Available Scripts

* `npm run dev`: Starts the development server.
* `npm run build`: Generates Prisma client and builds the application for production.
* `npm run start`: Starts the production server.
* `npm run lint`: Runs ESLint to identify code quality issues.