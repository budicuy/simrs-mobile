# 🤝 Contributing to SIMRS Mobile

Terima kasih atas minat Anda untuk berkontribusi pada SIMRS Hospital Management System! 

## 📋 **Code of Conduct**

Proyek ini mengikuti kode etik yang ramah dan profesional. Dengan berpartisipasi, Anda diharapkan untuk menjaga standar ini.

### **Our Standards**
- Menggunakan bahasa yang ramah dan inklusif
- Menghormati sudut pandang dan pengalaman yang berbeda
- Menerima kritik konstruktif dengan baik
- Fokus pada apa yang terbaik untuk komunitas
- Menunjukkan empati terhadap anggota komunitas lainnya

## 🚀 **How to Contribute**

### **Types of Contributions**
- 🐛 **Bug Reports** - Laporkan bug atau masalah
- ✨ **Feature Requests** - Saran fitur baru
- 📝 **Documentation** - Perbaikan dokumentasi
- 💻 **Code Contributions** - Pull requests
- 🧪 **Testing** - Testing dan quality assurance
- 🎨 **Design** - UI/UX improvements

### **Getting Started**
1. Fork repository
2. Clone fork ke local machine
3. Create feature branch
4. Make changes
5. Test changes
6. Submit pull request

## 🐛 **Reporting Bugs**

### **Before Submitting a Bug Report**
- Check existing issues
- Test on latest version
- Gather relevant information

### **Bug Report Template**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Device Information:**
 - Device: [e.g. Samsung Galaxy S21]
 - OS: [e.g. Android 12]
 - App Version: [e.g. 1.1.0]

**Additional context**
Add any other context about the problem here.
```

## ✨ **Feature Requests**

### **Feature Request Template**
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 💻 **Development Setup**

### **Prerequisites**
```bash
# Required software
- Node.js 18+
- pnpm package manager
- Android Studio
- Java 17+
```

### **Setup Steps**
```bash
# 1. Clone repository
git clone <your-fork-url>
cd simrs-mobile

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm start

# 4. Run on Android
pnpm run android
```

## 📝 **Pull Request Process**

### **Before Submitting**
1. **Code Quality**
   - Follow ESLint configuration
   - Run Prettier for formatting
   - Add comments for complex logic
   - Follow React Native best practices

2. **Testing**
   - Test on Android device/emulator
   - Verify all features work correctly
   - Test navigation flows
   - Check responsive design

3. **Documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update API documentation
   - Include screenshots for UI changes

### **Pull Request Template**
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested on Android device
- [ ] All navigation works correctly
- [ ] Forms validation works
- [ ] No performance regression

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🎨 **Code Style Guidelines**

### **JavaScript/React Native**
```javascript
// Use functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  // Use meaningful variable names
  const handleButtonPress = () => {
    // Implementation
  };
  
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

// Use StyleSheet for styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
```

### **File Naming**
- **Components**: PascalCase (e.g., `SwipeNavigation.jsx`)
- **Pages**: PascalCase (e.g., `Home.jsx`)
- **Utilities**: camelCase (e.g., `apiClient.js`)
- **Constants**: UPPER_CASE (e.g., `API_ENDPOINTS.js`)

### **Import Order**
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, StyleSheet } from 'react-native';

// 3. Third-party imports
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 4. Local imports
import CustomComponent from '../components/CustomComponent';
import { API_ENDPOINTS } from '../constants/api';
```

## 🧪 **Testing Guidelines**

### **Manual Testing Checklist**
- [ ] App starts without crashes
- [ ] Login functionality works
- [ ] All navigation methods work (swipe + tap)
- [ ] CRUD operations function correctly
- [ ] Forms validate properly
- [ ] Data persists correctly
- [ ] Logout clears session

### **Performance Testing**
- [ ] Smooth animations (60 FPS)
- [ ] No memory leaks
- [ ] Fast startup time
- [ ] Responsive UI interactions

## 📚 **Resources**

### **Documentation**
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### **Design Guidelines**
- [Material Design](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### **Hospital Domain Knowledge**
- Healthcare data standards
- Patient privacy regulations
- Medical workflow understanding

## 🏷️ **Versioning**

We use [Semantic Versioning](http://semver.org/) for version numbers:
- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes

## 📄 **License**

By contributing to SIMRS Mobile, you agree that your contributions will be licensed under the MIT License.

## 💬 **Getting Help**

### **Communication Channels**
- **GitHub Issues**: Technical discussions
- **Email**: it-support@rsi-banjarmasin.id
- **Documentation**: Comprehensive guides available

### **Mentorship**
New contributors are welcome! We provide mentorship for:
- First-time contributors
- React Native beginners
- Healthcare domain questions
- Code review guidance

---

**Thank you for your interest in improving SIMRS Mobile! 🙏**

Every contribution, no matter how small, makes a difference in healthcare digitalization.
