# AI-Powered Meeting Notes Summarizer - Frontend

React + TypeScript frontend for the AI-powered meeting notes summarizer application.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 🌐 Vercel Deployment

### Prerequisites
1. Fork/clone this repository
2. Create a Vercel account at [vercel.com](https://vercel.com)
3. Deploy your backend API first (see backend deployment guide)

### Deploy to Vercel

#### Option 1: Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Import the project and select the `frontend` folder as the root directory
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL=https://your-backend-api-url.vercel.app/api`
4. Deploy!

#### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
vercel --prod
```

### Environment Variables
Set these in your Vercel dashboard under "Environment Variables":

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-api.vercel.app/api` | Your deployed backend API URL |

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🎯 Features

- **File Upload**: Upload .txt files for summarization
- **Text Input**: Paste text directly for processing
- **AI Summarization**: Generate intelligent summaries using Groq API
- **Edit/Preview**: Toggle between editing and formatted display
- **Email Sharing**: Send summaries via email with beautiful HTML formatting
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with floating GitHub button

## 🛠️ Technologies

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API communication
- **CSS3** - Modern styling with animations and responsive design

## 🔧 Configuration

### Custom API URL
Create a `.env.local` file (gitignored) with:
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Development vs Production
- **Development**: Uses `http://localhost:3001/api`
- **Production**: Uses environment variable `VITE_API_URL`

## 📱 Mobile Support

The application is fully responsive and includes:
- Touch-friendly buttons and inputs
- Optimized layouts for small screens  
- Proper text sizing and spacing
- Mobile-friendly modal dialogs
- Bottom-right positioned GitHub button for mobile

## 🎨 Customization

### Styling
- Edit `src/App.css` for visual customizations
- Modern CSS with flexbox and grid layouts
- Clean color scheme with professional appearance
- Smooth animations and hover effects

### API Integration
- All API calls centralized in `App.tsx`
- Error handling with user-friendly messages
- Loading states and validation

## 📈 Performance

- **Optimized builds** with Vite and TypeScript
- **Efficient re-renders** with proper React patterns
- **Fast development** with HMR (Hot Module Replacement)
- **Responsive images** and optimized assets

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured with your frontend URL
2. **API Not Found**: Check `VITE_API_URL` environment variable in Vercel
3. **Build Failures**: Run `npm run lint` and `npm run build` locally first

### Debug Mode
Check API URL in browser console:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

## 🚀 Deployment Checklist

- [ ] Backend API deployed and accessible
- [ ] Environment variables set in Vercel dashboard
- [ ] CORS configured in backend with frontend URL
- [ ] Build and preview tested locally
- [ ] All features tested in production environment

## 📝 License

This project is open source and available under the MIT License.

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
