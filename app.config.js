import 'dotenv/config';

export default {
  "expo": {
    "name": "Aloha Delivery",
    "slug": "aloha-delivery",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.alohadelivery",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "257fed07-f765-4be8-9cb6-1edea021f8df"
      },
      "TOKEN_GSC": process.env.TOKEN_GSC,
      "SECRET_GSC": process.env.SECRET_GSC,
      "GOOGLE_API": process.env.GOOGLE_API,
    },
  }
};
