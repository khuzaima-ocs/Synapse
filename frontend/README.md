# Synapse Frontend

A modern, responsive web application built with Next.js for managing and deploying AI agents and tools. This platform provides an intuitive interface for creating, configuring, and managing custom AI agents with various capabilities.

## 🚀 Features

- **Agent Management**: Create, edit, and manage AI agents with custom configurations
- **Custom GPTs**: Build and deploy custom GPT models with specialized capabilities
- **Tool Integration**: Manage and configure various tools for agent functionality
- **Modern UI**: Built with Radix UI components and Tailwind CSS for a polished experience
- **Dark/Light Theme**: Full theme support with system preference detection
- **Responsive Design**: Optimized for desktop and mobile devices
- **Type Safety**: Full TypeScript support with strict type checking

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Fonts**: Geist Sans & Geist Mono

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saas-platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── agents/            # Agent management pages
│   ├── custom-gpts/       # Custom GPT configuration
│   ├── tools/             # Tool management
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── agent-*.tsx       # Agent-related components
│   ├── custom-gpt-*.tsx  # Custom GPT components
│   └── tool-*.tsx        # Tool-related components
├── lib/                  # Utility functions and configurations
│   ├── data-store.tsx    # Global state management
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

The project uses a comprehensive set of UI components built on Radix UI primitives:

- **Layout**: Sidebar, Header, Navigation
- **Forms**: Input, Select, Textarea, Checkbox, Radio
- **Feedback**: Toast, Alert, Dialog, Popover
- **Data Display**: Table, Card, Badge, Avatar
- **Navigation**: Tabs, Breadcrumb, Pagination
- **Overlay**: Modal, Drawer, Tooltip

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

### Tailwind CSS

The project uses Tailwind CSS 4.x with custom configuration. The main configuration is in `tailwind.config.js` and global styles are in `app/globals.css`.

### TypeScript

TypeScript is configured with strict mode enabled. Path aliases are set up for clean imports:
- `@/*` maps to the root directory

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms

The project can be deployed to any platform that supports Next.js:

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Version History

- **v0.1.0** - Initial release with basic agent management functionality

---

Built with ❤️ using Next.js and modern web technologies.
