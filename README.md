# Lumina Notes ✨

A modern, high-performance, and beautifully animated note-taking and reminder application. Lumina combines the power of **Next.js 15**, **Supabase**, and **GSAP** to provide a seamless productivity experience with a stunning glassmorphism aesthetic.

![Lumina Dashboard Preview](https://picsum.photos/seed/lumina/1200/600)

## 🚀 Features

- **Intuitive Dashboard:** Get a bird's-eye view of your latest notes, upcoming reminders, and activity stats.
- **Smart Notes:** Create, edit, and organize notes with a clean, distraction-free interface.
- **Dynamic Reminders:** Set time-based reminders with priority levels and real-time notifications.
- **Calendar Integration:** Visualize your schedule and notes in a sleek, interactive calendar view.
- **Advanced Animations:** Powered by GSAP and Motion for fluid transitions and a premium feel.
- **Secure Authentication:** Robust user authentication and session management via Supabase Auth.
- **Real-time Sync:** Your data is always up-to-date across all devices.
- **Dark/Light Mode:** Beautifully crafted themes that adapt to your preference.
- **3D Visuals:** Immersive background scenes powered by Three.js and React Three Fiber.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/), [GSAP](https://greensock.com/gsap/) (Animations)
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Icons:** [Lucide React](https://lucide.dev/)
- **3D Rendering:** [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Date Handling:** [date-fns](https://date-fns.org/)

## 📦 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lumina-notes.git
   cd lumina-notes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Setup

Lumina uses Supabase for its backend. To set up the required tables and policies:

1. Go to your **Supabase Dashboard**.
2. Open the **SQL Editor**.
3. Copy and paste the contents of `supabase_schema.sql` from the root of this project.
4. Run the query to create the `notes` and `reminders` tables and set up Row Level Security (RLS) policies.
5. (Optional) Create a storage bucket named `images` if you plan to support image uploads.

## 📂 Project Structure

```text
├── app/                # Next.js App Router (Pages & API)
├── components/         # Reusable UI components
│   ├── ui/             # Atomic UI elements
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared logic (Supabase client, etc.)
├── public/             # Static assets
└── styles/             # Global styles and Tailwind configuration
```

## 🔐 Security & Validation

Lumina implements strict security measures:
- **Password Validation:** Requires at least 8 characters, including uppercase, lowercase, numbers, and special characters.
- **Auth Resilience:** Automatic session cleanup and refresh token error handling to ensure a smooth user experience.
- **Protected Routes:** Middleware and layout-level checks to prevent unauthorized access to user data.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Your Name/Team]
