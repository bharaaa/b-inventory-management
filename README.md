# Inventory Management Dashboard

## Overview
This project is an inventory management dashboard, built to manage and monitor product stock efficiently. The application provides a clean and responsive interface for viewing, searching, and organizing inventory data.

The frontend is developed using React and Tailwind CSS, while Supabase is used as the backend service for data storage and retrieval.

🔗 Live Demo: https://b-inventory-management.netlify.app

## Features
- Display inventory data (ID, Name, Stock Count, Last Updated)
- Search functionality for quick item lookup
- Sorting by multiple attributes (name, stock, last updated)
- Loading states using skeleton UI for better user experience
- Responsive design optimized for both desktop and mobile devices
- Human-friendly timestamp display (relative and formatted date)

## Code Structure
### Structure Explanation
- components/
Contains reusable UI components. The InventoryDashboard component handles:
	•	Data fetching from Supabase
	•	Search and sorting logic
	•	Rendering of UI states (loading, empty, data display)
- services/
Contains configuration for external services.
supabaseClient.js initializes and exports the Supabase client instance.
- helpers/
Contains javascript function used in components.
- app.jsx
Responsible for bootstrapping and rendering the application.

## Local Development Setup
1. Clone repository
2. Install dependencies
`npm install`
3. Run Development Server
`npm run dev`
Access the application at:
`http://localhost:5173`

## Deployment
The application is deployed using Netlify. Deployment is configured by connecting the GitHub repository to Netlify and setting the required environment variables in the Netlify dashboard.

## AI-Assisted Development
AI tools were utilized during development to:
- Explore and validate UI/UX design decisions
- Refine component structure and state management
- Assist in implementing features such as search, sorting, and loading states
- Improve code readability and maintainability

All generated suggestions were reviewed and adapted to align with project requirements and best practices.

## Technical Notes
- Supabase is used as a Backend-as-a-Service (BaaS) with a predefined database schema.
- The application uses the public anon key, with security expected to be enforced via Supabase Row Level Security (RLS) policies.
- The project focuses on simplicity, clarity, and maintainability as an MVP.

## Future Improvement
- Add create, update, and delete (CRUD) functionality
- Implement authentication and role-based access control
- Enable real-time updates using Supabase subscriptions
- Add inventory insights (e.g., low stock alerts, summary metrics)

## Author
Developed by Bhara Alfhaniawan
:::
