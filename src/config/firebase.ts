import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// ==========================================
// ИНСТРУКЦИЯ ПО НАСТРОЙКЕ FIREBASE
// ==========================================
//
// 1. Перейдите на https://console.firebase.google.com/
// 2. Создайте новый проект "TaskManager Pro"
// 3. Включите Authentication → Phone
// 4. Создайте Firestore Database (Production mode)
// 5. В Project Settings → Web apps → создайте приложение
// 6. Скопируйте конфигурацию ниже
//
// ==========================================

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyDlMArNXkKcGi9kCMPDfunPe2PP-16lviI",
  authDomain: "taskmanager-pro-7429a.firebaseapp.com",
  projectId: "taskmanager-pro-7429a",
  storageBucket: "taskmanager-pro-7429a.firebasestorage.app",
  messagingSenderId: "1076300762409",
  appId: "1:1076300762409:web:d0707ffd551b104d5f3b38",
  measurementId: "G-5D293KHZ03"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Сервисы
export const auth = getAuth(app);
export const db = getFirestore(app);

// Включаем офлайн режим (данные кэшируются локально)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Множественные вкладки открыты, персистентность отключена');
  } else if (err.code === 'unimplemented') {
    console.warn('Браузер не поддерживает офлайн режим');
  }
});

export default app;


