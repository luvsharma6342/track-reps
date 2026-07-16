# Fitness Tracking App Specification

## 1. Application Flow

### 1.1 Onboarding & Dashboard
- **Initial State:** Upon creating an account, the user lands on a clean dashboard. As there are no default exercises, the initial state encourages the user to either "Create Your First Exercise" or "Start a Workout."
- **Populated State:** Eventually displays recent workouts and high-level progress charts once data is populated.

### 1.2 Building the Custom Exercise Library
- **Concept:** Since the database starts empty, users must define their movements.
- **Creation Action:** The user clicks "Add Exercise."
- **Input Fields:** Name (e.g., "Incline Dumbbell Press") and Body Part/Category tag (e.g., "Chest" or "Push").
- **Storage:** The exercise is permanently saved to the user's personal account library for future selection.

### 1.3 The Workout Logging Loop
- **Start Session:** User clicks "Start Workout." A timer begins, and the current date is logged.
- **Add Exercise:** User selects an exercise from their personal library.
- **Log Sets:** For the chosen exercise, the user inputs Weight and Reps for Set 1. They click "Add Set" for subsequent sets.
- **Finish Session:** User clicks "Complete Workout," which saves the session data to their history.

### 1.4 Progress & History (Solving the Notes App Pain Point)
- **Inline Previous Data:** When a user selects an exercise during a live workout, the UI automatically displays the exact sets, reps, and weight they achieved the last time they performed that specific exercise, placed directly above or beside the current input fields.
- **Exercise Analytics:** A dedicated "Exercises" tab where a user taps an exercise and sees a line chart or list of their entire history with that specific movement, tracking total volume or max weight over time.

---

## 2. Tracking by Body Part

To allow users to organize by body part without providing a pre-populated list of exercises, a Tagging System will be implemented.

### Category Creation
When a user adds a new exercise to their library, they are required to assign a body part tag. 
- **Approach:** Hardcoded Categories, Custom Exercises.
- **Implementation:** Provide a fixed dropdown of standard body parts (Chest, Back, Legs, Arms, Shoulders, Core, Cardio). The user maps their custom exercise to these fixed categories. This prevents typos, duplicate tags, and improves overall UX.

---

## 3. Filtering UI

When the user is in a workout and clicks "Add Exercise," they are presented with their custom list. A filter bar at the top with chips for each body part will be included.

| Action | User Experience |
| :--- | :--- |
| **Search** | Typing "Bench" filters their custom list to "Barbell Bench Press". |
| **Filter by Tag** | Tapping the "Back" chip hides all exercises except those the user tagged as "Back". |
| **Quick Add** | If an exercise doesn't exist while they are searching, a "Create [Search Term]" button appears directly in the dropdown. |

---

## 4. Database Structure (High-Level)

The relational database requires three core tables to make this flow work.

### 4.1 `Exercises` Table
- `id` (String/UUID): Unique identifier.
- `user_id` (String/UUID): Ties the exercise strictly to the user who created it.
- `name` (String): e.g., "Deadlift".
- `body_part` (String): e.g., "Back".

### 4.2 `Workouts` Table
- `id` (String/UUID): Unique identifier.
- `user_id` (String/UUID): Foreign key linking to the user.
- `date` (DateTime): The timestamp when the workout occurred.

### 4.3 `Sets` Table (Queried to show previous week's performance)
- `id` (String/UUID): Unique identifier.
- `workout_id` (String/UUID): Foreign key referencing the workout.
- `exercise_id` (String/UUID): Foreign key referencing the exercise.
- `set_number` (Int): The order of the set (1, 2, 3, etc.).
- `weight` (Float/Decimal): The weight lifted.
- `reps` (Int): The number of repetitions completed.

---

## 5. Tech Stack & Styling Guidelines

### Tech Stack
- **Framework:** Next.js (App Router recommended)
- **Database:** PostgreSQL (hosted on Neon Database)
- **ORM:** Prisma

### Design & Aesthetics
- **Vibe:** Modern, engaging, and premium to attract Gen Z customers.
- **Styling:**
  - Utilize sleek dark modes or vibrant curated color palettes.
  - Implement glassmorphism effects where appropriate.
  - Use high-quality, modern typography (e.g., Inter, Outfit).
- **Animations:** Use `framer-motion` (or similar motion libraries) for:
  - Smooth page transitions.
  - Micro-animations for buttons, chips, and list interactions.
  - Dynamic layouts when adding sets or exercises.
