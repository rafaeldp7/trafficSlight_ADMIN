// Notification center component with real-time notifications
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  MarkEmailRead,
  Delete,
  MoreVert,
  Info,
  Warning,
  Error,
  CheckCircle
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';

const NotificationCenter = ({ 
  onNotificationClick,
  showBadge = true,
  maxNotifications = 50
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' }
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications(1, maxNotifications);
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (notificationId) => {
    try {
      await notificationService.markAsUnread(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: false } : n
        )
      );
    } catch (err) {
      console.error('Mark as unread error:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Error color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'success';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  // Handle menu open
  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    const tabValue = tabs[activeTab]?.value;
    
    switch (tabValue) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  return (
    <Box>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        color="inherit"
      >
        <Badge badgeContent={showBadge ? unreadCount : 0} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ width: 400 }}
      >
        <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box p={2} borderBottom="1px solid #e0e0e0">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Notifications
              </Typography>
              <Box>
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </Button>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <NotificationsOff />
                </IconButton>
              </Box>
            </Box>
            
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mt: 1 }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  sx={{ minWidth: 'auto' }}
                />
              ))}
            </Tabs>
          </Box>

          <Box flex={1} overflow="auto">
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            ) : filteredNotifications.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No notifications found
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        backgroundColor: notification.read ? 'transparent' : '#f5f5f5',
                        '&:hover': {
                          backgroundColor: '#e0e0e0'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getPriorityIcon(notification.priority)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Chip label="New" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Chip
                                label={notification.priority}
                                size="small"
                                color={getPriorityColor(notification.priority)}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, notification)}
                        >
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedNotification) {
              if (selectedNotification.read) {
                markAsUnread(selectedNotification.id);
              } else {
                markAsRead(selectedNotification.id);
              }
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <MarkEmailRead />
          </ListItemIcon>
          <ListItemText>
            {selectedNotification?.read ? 'Mark as Unread' : 'Mark as Read'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedNotification) {
              deleteNotification(selectedNotification.id);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationCenter;
