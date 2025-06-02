import React, { createContext, useContext, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface NotificationContextType {
  openChatWithUser: (user: User) => void;
  currentChatUser: User | null;
  setCurrentChatUser: (user: User | null) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  openChatWithUser: () => {},
  currentChatUser: null,
  setCurrentChatUser: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useSocket();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [notification, setNotification] = useState<{ open: boolean; sender: User | null; message: string }>(
    { open: false, sender: null, message: '' }
  );
  const [currentChatUser, setCurrentChatUser] = useState<User | null>(null);

  // Fetch all users for notification sender info
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsers(data.users.filter((u: User) => user && u._id !== user.id));
      } catch {
        setUsers([]);
      }
    };
    if (user) fetchUsers();
  }, [user, token]);

  // Listen for chat messages globally
  useEffect(() => {
    if (!socket || !user) return;
    const handleMessage = (msg: any) => {
      // Only show notification if not currently chatting with sender
      if (
        msg.receiver === user.id &&
        (!currentChatUser || currentChatUser._id !== msg.sender)
      ) {
        const senderUser = users.find(u => u._id === msg.sender);
        setNotification({ open: true, sender: senderUser || null, message: msg.content });
      }
    };
    socket.on('chatMessage', handleMessage);
    return () => {
      socket.off('chatMessage', handleMessage);
    };
  }, [socket, user, users, currentChatUser]);

  const openChatWithUser = (user: User) => {
    navigate('/chat');
    setCurrentChatUser(user);
    setNotification({ open: false, sender: null, message: '' });
  };

  const handleNotificationClick = () => {
    if (notification.sender) {
      openChatWithUser(notification.sender);
    }
    setNotification({ open: false, sender: null, message: '' });
  };

  return (
    <NotificationContext.Provider value={{ openChatWithUser, currentChatUser, setCurrentChatUser }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ open: false, sender: null, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClick={handleNotificationClick}
          sx={{ cursor: 'pointer', minWidth: 280 }}
          severity="info"
        >
          {notification.sender ? (
            <>
              <strong>{notification.sender.firstName} {notification.sender.lastName}:</strong> {notification.message}
            </>
          ) : notification.message}
        </MuiAlert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 