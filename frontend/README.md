# FitCheck.AI Frontend

A modern React TypeScript frontend for the FitCheck.AI application that provides an intuitive interface for uploading outfit photos and viewing AI-powered shoe recommendations.

## Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Drag & Drop Upload**: Easy image upload with drag-and-drop functionality
- **Real-time Processing**: Live feedback during AI processing
- **Interactive Recommendations**: Browse through AI-generated shoe recommendations
- **Multi-angle Visualizations**: View outfit visualizations from different angles
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework (via custom CSS)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/
│   └── vite.svg          # Vite logo
├── src/
│   ├── components/       # React components
│   │   ├── ImageUpload.tsx
│   │   ├── ShoeRecommendations.tsx
│   │   └── OutfitVisualization.tsx
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## Components

### ImageUpload
Handles image upload with drag-and-drop functionality, file validation, and preview.

### ShoeRecommendations
Displays AI-generated shoe recommendations with interactive navigation and detailed information.

### OutfitVisualization
Shows generated outfit visualizations with multi-angle views and download functionality.

## API Integration

The frontend communicates with the Flask backend through the following endpoints:

- `POST /upload` - Upload image and get shoe recommendations
- `POST /generate-outfits` - Generate outfit visualizations
- `GET /health` - Health check

## Styling

The application uses custom CSS with:
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming
- Smooth animations and transitions
- Responsive design patterns
- Modern glassmorphism effects

## Development

### Adding New Components

1. Create component file in `src/components/`
2. Export component as default
3. Import and use in parent components
4. Add TypeScript types if needed

### Styling Guidelines

- Use semantic class names
- Follow mobile-first responsive design
- Use CSS custom properties for consistent theming
- Leverage Framer Motion for animations

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Preview Production Build

```bash
npm run preview
```

### Deployment

The built files in the `dist` folder can be deployed to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **Build Errors**: Clear node_modules and reinstall dependencies
3. **Type Errors**: Check TypeScript configuration and type definitions

### Development Tips

- Use React DevTools for debugging
- Check browser console for API errors
- Use Vite's hot reload for fast development
- Leverage TypeScript for better development experience

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on multiple screen sizes
4. Ensure accessibility standards
5. Update documentation as needed
