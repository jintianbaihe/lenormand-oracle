import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Home } from './pages/Home';
import { SpreadSelection } from './pages/SpreadSelection';
import { DrawCards } from './pages/DrawCards';
import { Preparation } from './pages/Preparation';
import { ReadingResult } from './pages/ReadingResult';
import { Journal } from './pages/Journal';
import { JournalDetail } from './pages/JournalDetail';
import { Wiki } from './pages/Wiki';
<<<<<<< HEAD
=======
import { Auth } from './pages/Auth';
import { Settings } from './pages/Settings';
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
import { Navbar, Header } from './components/Navigation';
import { AppProvider, useAppContext } from './context/AppContext';

import { CardLibrary } from './pages/CardLibrary';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { t } = useAppContext();
=======
  const { t, isAuthenticated } = useAppContext();

  // 路由守卫：未登录且不在登录页时跳转
  React.useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isAuthenticated, location.pathname, navigate]);
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)

  const getHeaderProps = () => {
    switch (location.pathname) {
      case '/':
        return {};
      case '/spread':
        return { title: t('chooseSpread'), showBack: true, onBack: () => navigate('/') };
      case '/journal':
        return { title: t('journal') };
      case '/cards':
        return { title: t('cardLibrary') };
      case '/wiki':
        return { title: t('wiki') };
      case '/result':
        return { subtitle: t('readingResult'), showBack: true, onBack: () => navigate('/') };
      default:
        if (location.pathname.startsWith('/preparation/')) {
          return { title: t('centerYourself'), subtitle: t('preparation'), showBack: true, onBack: () => navigate('/spread') };
        }
        if (location.pathname.startsWith('/draw/')) {
          return { subtitle: t('dailyReading'), showBack: true, onBack: () => navigate('/spread') };
        }
        if (location.pathname.startsWith('/journal/')) {
          return { title: t('entryDetails'), showBack: true, onBack: () => navigate('/journal') };
        }
        if (location.pathname.startsWith('/draw')) {
          return { subtitle: t('dailyReading'), showBack: true, onBack: () => navigate('/spread') };
        }
        return {};
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden relative">
      <div className="mystic-bg-flow" />
<<<<<<< HEAD
      <Header {...getHeaderProps()} />
=======
      {location.pathname !== '/auth' && <Header {...getHeaderProps()} />}
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
      
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col overflow-y-auto no-scrollbar"
        >
          <Routes location={location}>
<<<<<<< HEAD
=======
            <Route path="/auth" element={<Auth />} />
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
            <Route path="/" element={<Home />} />
            <Route path="/spread" element={<SpreadSelection />} />
            <Route path="/preparation/:count/:type" element={<Preparation />} />
            <Route path="/draw/:count/:type" element={<DrawCards />} />
            <Route path="/result" element={<ReadingResult />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:id" element={<JournalDetail />} />
            <Route path="/cards" element={<CardLibrary />} />
            <Route path="/wiki" element={<Wiki />} />
<<<<<<< HEAD
=======
            <Route path="/settings" element={<Settings />} />
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
          </Routes>
        </motion.div>
      </AnimatePresence>

<<<<<<< HEAD
      <Navbar />
=======
      {location.pathname !== '/auth' && <Navbar />}
>>>>>>> 34c53ed (Initial commit: 增加雷诺曼占卜应用及用户系统)
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
