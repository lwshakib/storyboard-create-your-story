![Project Banner](public/screenshots/project-banner.png)

# <img src="public/logo.svg" height="40" alt="Storyboard Logo" style="vertical-align: middle; margin-right: 10px;" /> Storyboard: Create Your Story

> **Create professional, AI-powered presentations and storyboards in minutes.**

**Storyboard** is a modern, full-stack presentation builder that empowers creators to visualize their stories. Whether you're a filmmaker, marketer, or educator, our tool helps you generate, edit, and export stunning presentations with ease. Leveraging the power of AI, you can turn simple text prompts into complete visual narratives and slide decks.

## � App Preview

Here's a quick look at the application in both dark and light themes:

<div align="center">
  <img src="public/screenshots/dark_demo.png" alt="Dark Theme Preview" width="48%" />
  <img src="public/screenshots/light_demo.png" alt="Light Theme Preview" width="48%" />
</div>

## �🚀 Features

- **✨ AI-Powered Presentations**: Describe your topic, and let our AI agents generate detailed slides, scripts, and visuals automatically.
- **🎨 Interactive Slide Editor**: A powerful, drag-and-drop canvas to customize every aspect of your presentation. Add text, images, shapes, and notes.
- **📦 Professional Templates**: Jumpstart your project with a library of professionally designed templates for various use cases and industries.
- **🔄 Project Management**: Organize your work with a dashboard that supports creating, updating, archiving, and restoring presentation projects.
- **📤 Export Flexibility**: Export your decks directly to PowerPoint (.pptx), PDF (.pdf), or JSON data for offline use, sharing, and backups.
- **🔐 Secure Authentication**: Robust user authentication system powered by Better Auth.
- **🌓 Dark/Light Mode**: Fully responsive interface with theme support.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI Text/JSON**: [GLM-4.7-Flash](https://github.com/THUDM/GLM-4) via [Cloudflare Workers](https://workers.cloudflare.com/)
- **AI Image Generation**: [FLUX.2 [klein] 9B](https://blackforestlabs.ai/) via [Cloudflare Workers](https://workers.cloudflare.com/)
- **Asset Management**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Google OAuth)
- **Emails**: [Resend](https://resend.com/)

## 📐 Architecture Breakdown

```mermaid
graph TD
    A[User Input] -->|Prompt| B(AI Processing)
    B -->|Generates| C{Content Engine}
    C -->|Slides| D[Visual Layouts]
    C -->|Text| E[Script & Notes]
    D --> F[Storyboard Editor]
    E --> F
    F -->|Customization| F
    F -->|Export| G[PowerPoint / PDF]
```

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (Recommended package manager)
- **PostgreSQL** database instance

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/lwshakib/storyboard-create-your-story.git
    cd storyboard-create-your-story
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    bun install
    ```

3.  **Set up Environment Variables:**

    Create a `.env` file in the root directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Then update the values in `.env` with your actual credentials.

    The `.env` file should look like this:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/storyboard_db"

    # Authentication (Better Auth)
    BETTER_AUTH_SECRET="your_better_auth_secret"
    BETTER_AUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"

    # App
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"

    # AI Providers (via Cloudflare Workers)
    CLOUDFLARE_API_KEY="your_cloudflare_api_key"
    GLM_WORKER_URL="your_glm_worker_url"
    FLUX_KLEIN_WORKER_URL="your_flux_worker_url"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

    # Notifications/Emails
    RESEND_API_KEY="your_resend_api_key"
    ```

4.  **Database Setup:**

    Run the migrations to set up your database schema:

    ```bash
    npm run db:migrate
    # or
    bun run db:migrate
    ```

5.  **Run the Development Server:**

    ```bash
    npm run dev
    # or
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

We welcome contributions to make Storyboard even better! Please check out our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- UI components by [Shadcn UI](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
