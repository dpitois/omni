import { UIProvider, useUIState } from './context/UIContext';
import { OutlinerProvider } from './context/OutlinerContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { OutlinerWrapper } from './components/OutlinerWrapper';
import { NotificationContainer } from './components/NotificationContainer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CommandPalette } from './components/CommandPalette';
import { ColumnsMenu } from './components/ColumnsMenu';

function MainLayout() {
  const { showSidebar } = useUIState();

  return (
    <div className="flex h-screen bg-app-bg text-text-main overflow-hidden font-sans selection:bg-blue-500/30">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative bg-app-bg">
          <OutlinerWrapper />
        </main>
        <StatusBar />
      </div>
    </div>
  );
}

export function App() {
  return (
    <UIProvider>
      <OutlinerProvider>
        <MainLayout />
        <NotificationContainer />
        <ShortcutsModal />
        <CommandPalette />
        <ColumnsMenu />
      </OutlinerProvider>
    </UIProvider>
  );
}
