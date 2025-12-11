import React, { useState, useEffect } from 'react';
import { RoleSelector } from './components/RoleSelector';
import { Dashboard } from './components/Dashboard';
import { BindingScreen } from './components/BindingScreen';
import { UserRole } from './types';
import { generateUserId } from './services/api';
import { p2pService } from './services/p2p';

const STORAGE_KEY_ROLE = 'exchangelink_role';
const STORAGE_KEY_MY_ID = 'exchangelink_my_id';
const STORAGE_KEY_PARTNER_ID = 'exchangelink_partner_id';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [role, setRole] = useState<UserRole | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [p2pStatus, setP2PStatus] = useState<string>('connecting');

  useEffect(() => {
    // 1. Load or Generate My ID
    let storedMyId = localStorage.getItem(STORAGE_KEY_MY_ID);
    if (!storedMyId) {
      storedMyId = generateUserId();
      localStorage.setItem(STORAGE_KEY_MY_ID, storedMyId);
    }
    setMyId(storedMyId);

    // Initialize P2P Service
    p2pService.initialize(storedMyId, (status) => {
      setP2PStatus(status);
    });

    // 2. Check for "connect" query param in URL (Magic Link)
    const urlParams = new URLSearchParams(window.location.search);
    const connectToId = urlParams.get('connect');
    
    if (connectToId) {
      // If URL has a partner ID, save it immediately
      localStorage.setItem(STORAGE_KEY_PARTNER_ID, connectToId);
      setPartnerId(connectToId);
      
      // Clean URL without refresh to look nicer
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Otherwise load from storage
      const storedPartnerId = localStorage.getItem(STORAGE_KEY_PARTNER_ID);
      if (storedPartnerId) {
        setPartnerId(storedPartnerId);
      }
    }

    // 3. Load Role
    const storedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    if (storedRole && Object.values(UserRole).includes(storedRole as UserRole)) {
      setRole(storedRole as UserRole);
    }

    setIsInitializing(false);

    // Cleanup on unmount
    return () => {
      // Keep p2p alive
    };
  }, []);

  const handleRoleSelect = async (selectedRole: UserRole) => {
    // Request notification permission immediately upon interaction
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    localStorage.setItem(STORAGE_KEY_ROLE, selectedRole);
    setRole(selectedRole);
  };

  const handleLinkPartner = (inputPartnerId: string) => {
    localStorage.setItem(STORAGE_KEY_PARTNER_ID, inputPartnerId);
    setPartnerId(inputPartnerId);
  };

  const handleBackToHome = () => {
    localStorage.removeItem(STORAGE_KEY_ROLE);
    setRole(null);
  };

  const handleUnpair = () => {
    localStorage.removeItem(STORAGE_KEY_PARTNER_ID);
    setPartnerId(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Step 1: Select Role
  if (!role) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  // Step 2: Bind Partner (if not yet bound)
  if (!partnerId) {
    return (
      <BindingScreen 
        role={role} 
        myId={myId} 
        onLink={handleLinkPartner}
        onBack={handleBackToHome} 
      />
    );
  }

  // Step 3: Dashboard
  return (
    <Dashboard 
      role={role}
      myId={myId}
      partnerId={partnerId} 
      onBack={handleBackToHome}
      onUnpair={handleUnpair}
      p2pStatus={p2pStatus}
    />
  );
};

export default App;