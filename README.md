# Flex Rent

A modern platform for property owners to list their properties and for tenants to find flexible rental options.

## Features

- User authentication with Supabase
- Property listing and management
- Flexible rental rates (daily, weekly, monthly)
- Secure payments with Stripe
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend and authentication
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flex-rent.git
   cd flex-rent
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` with your Supabase and Stripe credentials.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
flex-rent/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── properties/        # Property-related routes
│   ├── bookings/         # Booking-related routes
│   └── payment/          # Payment-related routes
├── components/            # React components
│   ├── ui/               # UI components
│   └── properties/       # Property-specific components
├── lib/                  # Utility functions and hooks
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
