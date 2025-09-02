# Sky.io - Weather Management Platform

A comprehensive weather management platform designed for businesses to make informed operational decisions based on real-time weather data and forecasts.

## 🌤️ Overview

Sky.io is a sophisticated web application that provides businesses with weather-based insights and recommendations. The platform features role-based dashboards for administrators and customers, interactive mapping capabilities, and comprehensive company management tools.

## ✨ Features

### Core Functionality
- **Real-time Weather Data** - Access current weather conditions and forecasts
- **Interactive Maps** - Mapbox integration for precise location selection and visualization
- **Business Recommendations** - Weather-based operational guidance for companies
- **Multi-tenant Architecture** - Separate admin and customer interfaces

### User Management
- **Authentication System** - Secure JWT-based login and registration
- **Role-based Access Control** - Admin and customer user roles
- **User Administration** - Complete user management for administrators

### Company Management
- **Company Profiles** - Create and manage business locations
- **Location Tracking** - Geographic positioning for accurate weather data
- **Dashboard Analytics** - Comprehensive weather insights per company

### User Interface
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark Theme Support** - Modern dark mode interface
- **Intuitive Navigation** - Hash-based SPA routing with smooth transitions

## 🛠️ Technology Stack

### Frontend
- **JavaScript (ES6+)** - Modern vanilla JavaScript
- **HTML5** - Semantic markup with SEO optimization
- **Tailwind CSS** - Utility-first CSS framework with custom theming
- **Mapbox GL JS** - Interactive mapping and geolocation services

### Architecture
- **Single Page Application (SPA)** - Hash-based client-side routing
- **RESTful API Integration** - Modular service architecture
- **JWT Authentication** - Secure token-based authentication
- **Local Storage** - Client-side state persistence

## 📁 Project Structure

\`\`\`
sky.io/
├── index.html                 # Main application entry point
├── src/
│   ├── main.js               # Application initialization
│   ├── components/
│   │   └── mapPicker.js      # Interactive map component
│   ├── pages/
│   │   ├── landing.js        # Homepage dashboard
│   │   ├── login.js          # Authentication page
│   │   ├── register.js       # User registration
│   │   ├── dashboardAdmin.js # Administrator dashboard
│   │   ├── dashboardCustomer.js # Customer dashboard
│   │   ├── companyDetail.js  # Company management
│   │   ├── aboutUs.js        # About page
│   │   └── 404.js           # Error handling
│   ├── services/
│   │   ├── auth.service.js   # Authentication API
│   │   ├── admin.service.js  # Admin operations
│   │   ├── company.service.js # Company CRUD
│   │   └── config.js         # API configuration
│   ├── router/
│   │   └── index.js          # Client-side routing
│   └── css/
│       └── style.css         # Custom styles
├── package.json              # Dependencies and scripts
└── README.md                # Project documentation
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Mapbox API key
- Backend API server (configured separately)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/sky.io.git
   cd sky.io
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   - Configure API endpoints in `src/services/config.js`
   - Set up Mapbox API key in the application
   - Ensure backend services are running

4. **Start the development server**
   \`\`\`bash
   npm start
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

## 🔧 Configuration

### API Configuration
Update `src/services/config.js` with your backend API endpoints:

\`\`\`javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
\`\`\`

### Mapbox Integration
Configure your Mapbox access token in the map picker component for location services.

## 👥 User Roles

### Administrator
- Manage user accounts and permissions
- Oversee company registrations and data
- Access system-wide analytics and reports
- Configure platform settings

### Customer
- Manage company profiles and locations
- Access weather data and recommendations
- View location-specific forecasts
- Generate operational reports

## 🌐 API Integration

The application integrates with a RESTful backend API providing:
- User authentication and authorization
- Weather data aggregation
- Company and location management
- Real-time notifications and alerts

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0** - Initial release with core weather management features
- **v1.1.0** - Enhanced mapping capabilities and user interface improvements
- **v1.2.0** - Advanced analytics and reporting features

---

**Sky.io** - Empowering businesses with intelligent weather insights.
