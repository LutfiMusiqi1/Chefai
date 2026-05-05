# AI Chef - Recipe Assistant App

An AI-powered recipe assistant built with Next.js, TypeScript, and Supabase. Users can chat with AI to get recipe ideas and save their favorite recipes.

## Features

- 🤖 AI Chat Interface - Get recipe suggestions from OpenAI GPT
- 🔐 User Authentication - Secure login/signup with Supabase Auth
- 📚 Recipe Management - Save and manage personal recipes
- 🔒 Row Level Security - Each user sees only their own data
- 🎨 Modern UI - Built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## Live Demo

[https://chefai.vercel.app](https://chefai.vercel.app) (replace with your actual Vercel URL)

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Setup

Run the SQL in `supabase-setup.sql` in your Supabase SQL Editor to create the recipes table with RLS policies.

## Deployment to Vercel

1. Connect your GitHub account to Vercel
2. Import this repository
3. Add Environment Variables in Vercel Dashboard:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

- `app/` - Next.js app router pages
- `lib/` - Supabase client configuration
- `design-patterns/` - Design pattern implementations
- `supabase-setup.sql` - Database schema
- `supabase-reflection.md` - Database integration documentation

## License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
