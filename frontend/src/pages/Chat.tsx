import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, TextField, Button, Avatar, CircularProgress, ListItemButton, Fade } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '@mui/material/styles';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNotification } from '../contexts/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

type MessageStatus = 'sent' | 'delivered' | 'read';
interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  status?: MessageStatus;
}

const Chat: React.FC = () => {
  const { user, token } = useAuth();
  const socket = useSocket();
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const { currentChatUser: selectedUser, setCurrentChatUser: setSelectedUser } = useNotification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsers(data.users.filter((u: User) => user && u._id !== user.id));
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    if (user) fetchUsers();
  }, [user, token]);

  // Fetch chat history when a user is selected
  useEffect(() => {
    if (!socket || !user || !selectedUser) return;
    setLoading(true);
    socket.emit('getChatHistory', { userId: user.id, otherUserId: selectedUser._id });
    const handleHistory = (history: Message[]) => {
      setMessages(history);
      setLoading(false);
    };
    socket.on('chatHistory', handleHistory);
    return () => {
      socket.off('chatHistory', handleHistory);
    };
  }, [socket, user && user.id, selectedUser]);

  // Listen for new messages (only update messages for the current chat)
  useEffect(() => {
    if (!socket || !user) return;
    const handleMessage = (msg: Message) => {
      if (
        (msg.sender === user.id || msg.receiver === user.id) &&
        (msg.sender === selectedUser?._id || msg.receiver === selectedUser?._id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('chatMessage', handleMessage);
    // Listen for status updates
    const handleStatusUpdate = ({ messageId, status }: { messageId: string; status: MessageStatus }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    };
    socket.on('messageStatusUpdate', handleStatusUpdate);
    return () => {
      socket.off('chatMessage', handleMessage);
      socket.off('messageStatusUpdate', handleStatusUpdate);
    };
  }, [socket, user && user.id, selectedUser]);

  // Emit messageRead for received messages when chat is open and visible
  useEffect(() => {
    if (!socket || !user || !selectedUser) return;
    messages.forEach((msg) => {
      if (msg.receiver === user.id && msg.sender === selectedUser._id && msg.status !== 'read') {
        socket.emit('messageRead', { messageId: msg._id });
      }
    });
  }, [messages, socket, user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when selectedUser changes
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  const handleSend = () => {
    if (!input.trim() || !socket || !user || !selectedUser) return;
    socket.emit('chatMessage', {
      sender: user.id,
      receiver: selectedUser._id,
      content: input.trim(),
    });
    setInput('');
  };

  // Gradient background and glassmorphism for chat area
  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, md: 4 },
        px: 1,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 950,
          minHeight: 500,
          maxHeight: 500,
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          backdropFilter: 'blur(8px)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(45, 50, 130, 0.85)'
            : 'rgba(255,255,255,0.85)',
        }}
      >
        {/* User List */}
        <Box
          sx={{
            width: 270,
            borderRight: '1px solid #e3eaf6',
            bgcolor: theme.palette.background.paper,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Typography variant="h6" sx={{ p: 3, borderBottom: '1px solid #e3eaf6', fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
            Users
          </Typography>
          {usersLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={100}><CircularProgress size={24} /></Box>
          ) : (
            <List sx={{ maxHeight: 'calc(600px - 56px)', overflowY: 'auto' }}>
              {users.map(u => (
                <ListItem key={u._id} disablePadding sx={{}}>
                  <ListItemButton
                    onClick={() => setSelectedUser(u)}
                    selected={!!selectedUser && selectedUser._id === u._id}
                    sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: theme.palette.secondary.light, color: theme.palette.primary.main } }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>{u.firstName[0]}{u.lastName[0]}</Avatar>
                    <ListItemText primary={`${u.firstName} ${u.lastName}`} secondary={u.email} />
                  </ListItemButton>
                </ListItem>
              ))}
              {users.length === 0 && <Typography sx={{ p: 2 }}>No other users found.</Typography>}
            </List>
          )}
        </Box>
        {/* Chat Area */}
        <Box flex={1} display="flex" flexDirection="column" sx={{ position: 'relative', background: 'none' }}>
          {/* Header Bar */}
          <Box sx={{
            p: 3,
            borderBottom: '1px solid #e3eaf6',
            minHeight: 72,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'transparent',
            backdropFilter: 'blur(2px)',
          }}>
            {selectedUser ? (
              <>
                <Avatar sx={{ width: 44, height: 44, bgcolor: theme.palette.secondary.main, fontWeight: 700, fontSize: 22 }}>
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                </Box>
              </>
            ) : (
              <Typography variant="h6" color="text.secondary">Select a user to chat</Typography>
            )}
          </Box>
          {/* Chat Messages */}
          <Box
            flex={1}
            px={{ xs: 1, sm: 3 }}
            py={2}
            overflow="auto"
            display="flex"
            flexDirection="column"
            gap={1.5}
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(120deg, #23244a 0%, #2d3282 100%)'
                : 'linear-gradient(120deg, #f4f7fb 0%, #e3eaf6 100%)',
              transition: 'background 0.3s',
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={100}><CircularProgress size={24} /></Box>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isMe = user && msg.sender === user.id;
                  const senderUser = isMe ? user : selectedUser;
                  return (
                    <Fade in key={msg._id || idx} timeout={400}>
                      <Box
                        display="flex"
                        flexDirection={isMe ? 'row-reverse' : 'row'}
                        alignItems="flex-end"
                        gap={1}
                        sx={{ width: '100%' }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: isMe ? theme.palette.primary.main : theme.palette.secondary.main,
                            fontWeight: 700,
                            fontSize: 18,
                          }}
                        >
                          {senderUser?.firstName[0]}{senderUser?.lastName[0]}
                        </Avatar>
                        <Box
                          sx={{
                            bgcolor: isMe ? theme.palette.primary.main : '#fff',
                            color: isMe ? '#fff' : theme.palette.text.primary,
                            px: 2,
                            py: 1.2,
                            borderRadius: 3,
                            borderTopRightRadius: isMe ? 6 : 3,
                            borderTopLeftRadius: isMe ? 3 : 6,
                            boxShadow: isMe ? 3 : 1,
                            maxWidth: { xs: '80%', sm: '65%' },
                            wordBreak: 'break-word',
                            fontSize: 16,
                            position: 'relative',
                            transition: 'background 0.2s',
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', fontSize: 16, fontWeight: 500 }}>
                            {msg.content}
                          </Typography>
                          <Box display="flex" alignItems="center" justifyContent={isMe ? 'flex-end' : 'flex-start'} gap={0.5} mt={0.5}>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 11, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            {isMe && (
                              <>
                                {msg.status === 'sent' && <DoneIcon sx={{ fontSize: 16, color: '#fff', opacity: 0.7, ml: 0.5 }} />}
                                {msg.status === 'delivered' && <DoneAllIcon sx={{ fontSize: 16, color: '#fff', opacity: 0.7, ml: 0.5 }} />}
                                {msg.status === 'read' && <DoneAllIcon sx={{ fontSize: 16, color: theme.palette.success.main, ml: 0.5 }} />}
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Fade>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>
          {/* Message Input */}
          <Divider sx={{ m: 0, borderColor: '#e3eaf6' }} />
          <Box
            display="flex"
            p={2}
            gap={1.5}
            bgcolor={theme.palette.mode === 'dark' ? 'rgba(45,50,130,0.92)' : '#f8fafc'}
            sx={{
              borderTop: '1px solid #e3eaf6',
              boxShadow: '0 2px 8px rgba(80,80,80,0.04)',
              zIndex: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder={selectedUser ? 'Type a message...' : 'Select a user to start chatting'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={!selectedUser}
              size="small"
              inputRef={inputRef}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(80,80,80,0.06)',
                input: { fontSize: 16 },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim() || !selectedUser}
              sx={{
                px: 3,
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(80,80,80,0.08)',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                textTransform: 'none',
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat; 