# Yapli

<p align="center">
  <a href="https://yapli.chat" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/user-attachments/assets/798b27c8-c9fb-477f-afb2-8ff9a764ab82" alt="Yapli App Logo" width="100"><br>
    <strong>Visit Yapli</strong>
  </a>
</p>

Yapli is a modern, full-featured web-based chatroom application built with Next.js 15 and real-time WebSocket communication. Create dynamic chat rooms with authentication, join conversations with custom aliases, share links with rich previews, and enjoy a seamless chat experience in a beautiful theme-aware interface.

## 👷‍♀️ Contributing

If you would like to contribute, please read [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## ✨ Features

### 🏠 **Dynamic Room Management**

- Create unlimited chat rooms with custom titles (authenticated users)
- Unique 6-character shareable codes for easy room access
- Room isolation - messages and presence tracking scoped per room
- Real-time room deletion with intuitive UI controls

### 💬 **Real-time Chat & Messaging**

- Instant messaging with Socket.io WebSocket integration
- Live presence tracking showing online users per room
- Custom alias support for anonymous participation
- Message persistence with PostgreSQL database storage
- Timestamp display for all messages

### 🔗 **Rich Link Previews**

- Automatic link detection and conversion to clickable links
- Rich link previews with title, description, and images
- Favicon and site name extraction for enhanced context
- Async link preview generation for optimal performance

### 🎨 **Modern UI/UX**

- Dark/Light theme toggle with next-themes
- Responsive design optimised for all screen sizes
- Gradient-based color scheme with teal and blue accents
- Smooth animations and hover effects
- Professional branding with integrated Yapli logo

### 🔐 **Authentication System**

- Secure user registration with bcrypt password hashing
- JWT-based session management with NextAuth.js
- Protected routes for room creation and management

### 🔒 **Security & Performance**

- Secure external link handling (`noopener noreferrer`)
- Database relationships with proper foreign key constraints
- Environment-based configuration for production deployment
- Comprehensive error handling and validation

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.3.2 with React 19 and TypeScript
- **Authentication:** NextAuth.js with multiple OAuth providers
- **Styling:** Tailwind CSS v4 with dark/light theme support
- **Real-time:** Socket.io for WebSocket communication
- **Database:** PostgreSQL with Prisma ORM
- **Security:** bcrypt for password hashing
- **UI Components:** Heroicons for consistent iconography
- **Link Processing:** Linkifyjs for URL detection and rich previews
- **Theme Management:** next-themes for system preference detection

## Documentation

- [Changelog](docs/CHANGELOG.md) - Project changelog and release notes
- [Standards & Guidelines](docs/CLAUDE.md) - Development standards and project guidelines
- [Database Setup](docs/DATABASE_SETUP.md) - How to set up the local database for development
