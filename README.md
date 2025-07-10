# Dopamine Driving through Dashboard

"We’re excited to embark on this amazing project, where we aim to leverage dashboard-style interfaces to make learning more engaging, enjoyable, and enriching. By using intuitive, interactive dashboards, we can transform the learning experience, making it more immersive and motivating for learners."

## Overview

The initial version of this project (version 0) was implemented using Google Sheets and Google Apps Script.

**Dopamine Driving through Dashboard** is a unified visualization platform developed at the **Dhananjaya Lab for Education Design (DLED)**. The primary objective is to design and deliver intuitive dashboards for all current and future lab projects, empowering data-driven insights and fostering engaging, motivating user experiences.

Version 1 of the application was completed on 30th June 2025 using the MERN stack. The frontend is built with React and TypeScript, while the backend utilizes Node.js and Express.js with JavaScript.

Key enhancements in this release include:

- A modern, sleek dashboard interface for an improved user experience.
- Advanced analytical features designed to support and empower students.
- A comprehensive suite of tools that set this platform apart from conventional solutions.

## Note 

You need to have Node Version **22.14.0 or higher** to run this project.

```shell
nvm install 22.14.0
nvm use 22.14.0
```

## Tech Stack

This project is built using the **MERN stack**:

- **MongoDB** – NoSQL database for storing and retrieving project data.
- **Express.js** – Web framework for Node.js to manage backend APIs.
- **React.js** – Frontend library for building interactive dashboard components.
- **Node.js** – Runtime environment for executing JavaScript on the server.
- **Tailwind** - An utility-first CSS framework used to style HTML elements directly within the markup
- **Nodemon** - For continuous server-side listening and active deployment
- **Bcrypt** - For Password Hashing and secure authentication
- **Mongoose** - ODM (Object Data Modelling) layer to communicate with MongoDB
- **CORS** - Package to authenticate Cross Origin Request listening
- **Axios** - Efficient data fetching from API endpoints
- **Cookies** - To handled user preferences and auth token

## Folder Structure (DDD-Aligned)

DDD-Team-4/
├── backend/
│ ├── public/
│ ├── src/
│ │ ├── config/
│ │ │ └── passport.js
│ │ ├── models/
│ │ │ ├── achievement.models.js
│ │ │ ├── assignment.models.js
│ │ │ ├── course.models.js
│ │ │ ├── dailyActivities.models.js
│ │ │ ├── evaluation.models.js
│ │ │ ├── goals.models.js
│ │ │ ├── leaderboard.models.js
│ │ │ ├── preferences.models.js
│ │ │ ├── submissions.models.js
│ │ │ └── user.models.js
│ │ ├── routes/
│ │ │ ├── achievement.routes.js
│ │ │ ├── allRouters.routes.js
│ │ │ ├── assignments.routes.js
│ │ │ ├── auth.routes.js
│ │ │ ├── course.routes.js
│ │ │ ├── dailyActivity.routes.js
│ │ │ ├── evaluation.routes.js
│ │ │ ├── goals.routes.js
│ │ │ ├── healthCheck.routes.js 
│ │ │ ├── leaderboard.routes.js
│ │ │ ├── preferences.routes.js
│ │ │ ├── submission.routes.js
│ │ │ ├── upload.routes.js
│ │ │ └── user.routes.js
│ │ ├── db/
│ │ │ └── index.js
│ │ ├── controllers/
│ │ │ ├── leaderboard.controller.js
│ │ │ ├── assignment.controller.js
│ │ │ ├── achievement.controller.js
│ │ │ ├── course.controller.js
│ │ │ ├── dailyActivity.controller.js
│ │ │ ├── evaluation.controller.js
│ │ │ ├── firebaseAuth.controller.js
│ │ │ ├── goals.controller.js
│ │ │ ├── healthCheck.controller.js
│ │ │ ├── leaderboard.controller.js
│ │ │ ├── preferences.controller.js
│ │ │ ├── submission.controller.js
│ │ │ ├── upload.controller.js
│ │ │ ├── socialAuth.controller.js
│ │ │ └── auth.controller.js
│ │ ├── utils/
│ │ │ ├── apiError.js
│ │ │ ├── apiResponse.js 
│ │ │ ├── arrayUtils.js
│ │ │ ├── claudinary.js
│ │ │ ├── dateUtils.js
│ │ │ ├── fileUtils.js
│ │ │ ├── objectUtils.js
│ │ │ └── stringUtils.js
│ │ ├── services/
│ │ │ ├── achievement.service.js
│ │ │ ├── firebase.service.js
│ │ │ └── evaluationAssigner.service.js
│ │ ├── middlewares/
│ │ │ ├── auth.middleware.js
│ │ │ ├── achievement.middleware.js
│ │ │ ├── cloudinary.middleware.js
│ │ │ ├── errorHandling.middleware.js
│ │ │ ├── preferences.middleware.js
<!-- │ │ │ ├── roleAuth.middleware.js -->
│ │ │ └── multer.middleware.js
│ │ ├── server.js
│ │ ├── app.js
│ │ ├── logger.js
│ │ └── .env
│ ├── logs
│ │ ├── combined.log
│ │ ├── error.log
│ │ ├── exceptions.log
│ │ └── rejections.log
│ ├── package.json
│ └── package-lock.json
│
├── frontend/
│ ├── public
│ ├── src/
│ │ ├── badges/
│ │ │ ├── badgesData.ts
│ │ ├── components/
│ │ │ ├── games/
│ │ │ │ ├── Simple Games
│ │ │ ├── BadgesSection.tsx
│ │ │ ├── Breadcrumb.tsx
│ │ │ ├── DailyGoals.tsx
│ │ │ ├── FloatingChatbot.tsx
│ │ │ ├── GameModal.tsx
│ │ │ ├── LeaderboardModal.tsx
│ │ │ ├── LeaderboardPanel.tsx
│ │ │ ├── Preferences.tsx
│ │ │ ├── ProgressChart.tsx
│ │ │ ├── ProtectedRoute.tsx
│ │ │ ├── RecentAssignments.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ ├── SkillSuggestionModal.tsx
│ │ │ ├── SocialProfileCompletion.tsx
│ │ │ ├── StatsCard.tsx
│ │ │ ├── StreakCounter.tsx
│ │ │ ├── Toast.tsx
│ │ │ ├── ToastContainer.tsx
│ │ │ └── ThemeToggle.tsx
│ │ ├── pages/
│ │ │ ├── Achievements.tsx
│ │ │ ├── Analytics.tsx
│ │ │ ├── Assignments.tsx
│ │ │ ├── Courses.tsx
│ │ │ ├── DailyActivities.tsx
│ │ │ ├── Dashboard.tsx
│ │ │ ├── Evaluation.tsx
│ │ │ ├── GoToStudentProfile.tsx
│ │ │ ├── Login.tsx
│ │ │ ├── ProfilePage.tsx
│ │ │ ├── Register.tsx
│ │ │ └── SettingsPage.tsx
│ │ ├── contexts/
│ │ │ ├── ThemeContext.tsx
│ │ │ ├── ToastContext.tsx
│ │ │ └── AuthContext.tsx
│ │ ├── hooks/
│ │ │ ├── useToast.ts
│ │ │ └── useSkillSuggestion.ts
│ │ ├── services/
│ │ │ ├── achievements.api.tsx
│ │ │ ├── cloudinary.ts
│ │ │ ├── firebase.ts
│ │ │ └── api.ts
│ │ ├── utils/
│ │ │ └── skillDetection.ts
│ │ ├── main.tsx
│ │ ├── App.tsx
│ │ └── index.css
│ ├── index.html
│ ├── package.json
│ ├── package-lock.json
│ └── tailwind.config
├── README.md
└── package.json (Script to run the entire app)

## To run the Backend of the app as a standalone

- **Migrate** to the backend folder and run the script

```bash
npm start
```

This command starts the backend **Server**, **Middlewares**, **APIs** and **Controllers**

## To run the Frontend of the app as a standalone

- **Migrate** to the frontend folder and run the script

```bash
npm run dev
```

This command starts the **Vite + React Engine** to deploy the complete project

## To run the Frontend and Backend of the app as a Together

- **Migrate** to the PeerEval\_(Team-4) folder and run the script

```bash
npm run ddd
```

This command deploys the complete **MERN Full Stack app**
