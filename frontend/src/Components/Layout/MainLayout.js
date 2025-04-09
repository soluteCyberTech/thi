import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  styled,
  useTheme,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  People,
  Settings,
  Assignment,
  AccountCircle,
  Notifications,
  ExitToApp,
  Person,
  BarChart,
  Description,
  Mail,
  CalendarToday,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { AccountTree, Security } from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { URL, get_user_access } from '../BaseURL';
import HODModal from '../Dashboard/HODModal';
import HODAssignmentModal from '../Dashboard/HODAssignmentModal';
import DepartmentUserModal from '../Dashboard/DepartmentUserModal';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  })
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  zIndex: theme.zIndex.drawer + 1,
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: 'none',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 2),
  '&:hover': {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.16)',
    },
  },
}));

const StyledSubMenu = styled(Collapse)(({ theme }) => ({
  '& .MuiList-root': {
    padding: theme.spacing(1, 0),
  }
}));

const StyledSubMenuItem = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.8, 2, 0.8, 6),
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.3, 2),
  '&:hover': {
    backgroundColor: 'rgba(46, 125, 50, 0.04)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.12)',
    },
  }
}));

function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState('');
  const [showHODModal, setShowHODModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showHODAssignmentModal, setShowHODAssignmentModal] = useState(false);
  const [showDepartmentUserModal, setShowDepartmentUserModal] = useState(false);
  const [userAccess, setUserAccess] = useState([]);

  const handleHODModalClose = (reopen = true) => {
    setShowHODModal(!reopen);
  };

  const handleAccessModalClose = (reopen = true) => {
    setShowAccessModal(!reopen);
  };

  const handleHODAssignmentModalClose = (reopen = true) => {
    setShowHODAssignmentModal(!reopen);
  };

  const handleDepartmentUserModalClose = (reopen = true) => {
    setShowDepartmentUserModal(!reopen);
  };

  // user info loading
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      const parsedInfo = JSON.parse(savedUserInfo);
      console.log('User Info:', parsedInfo);
      setUserInfo(parsedInfo);
    } else {
      navigate('/login');
    }
  }, []);

  // after userInfo is loaded
  useEffect(() => {
    if (userInfo?.staff_id && 
        (userInfo?.role === 'Head of Department' || 
         userInfo?.role === 'Department User')) {
        fetchUserAccess();
    }
  }, [userInfo]);

  const fetchUserAccess = async () => {
    try {
      if (!userInfo?.staff_id) {
        console.error('No staff_id available');
        return;
      }

      const response = await axios.get(get_user_access, {
        params: { userId: userInfo.staff_id },
      });
      
      if (response.data.success) {
        const accessList = response.data.access;
        setUserAccess(accessList);
        console.log('Access List loaded:', accessList);
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(userInfo?.role === 'Head Of Assembly' ? [
      { 
        text: 'HOD Management', 
        icon: <AccountTree />, 
        children: [
          { 
            text: 'Manage HODs', 
            onClick: () => {
              setShowHODModal(true);
              setOpen(false);
            }
          },
          { 
            text: 'Assign Access', 
            onClick: () => {
              setShowHODAssignmentModal(true);
              setOpen(false);
            }
          }
        ]
      }
    ] : []),
    ...(userInfo?.role === 'Head of Department' ? [
      { 
        text: 'Department Management',
        icon: <Security />,
        children: [
          {
            text: 'Manage Users',
            onClick: () => {
              setShowDepartmentUserModal(true);
              setOpen(false);
            }
          },
          {
            text: 'Access Control',
            path: '/dashboard/department-access'
          }
        ]
      },
      ...userAccess.map(access => ({
        text: access.name,
        icon: <Security color={access.is_core ? "primary" : "action"} />,
        path: access.path,
        isCore: access.is_core
      }))
    ] : []),
    ...(userInfo?.role === 'Department User' ? [
      ...userAccess.map(access => ({
        text: access.name,
        icon: <Security color={access.is_core ? "primary" : "action"} />,
        path: access.path,
        isCore: access.is_core
      }))
    ] : []),
  ];

  const [companyInfor, setcompanyInfor] = useState();
  const [logo, setlogo] = useState('');

  useEffect(() => {
    axios.get(URL).then(res => setcompanyInfor(res.data)).catch(err => console.log(URL));
  }, []);

  useEffect(() => {
    if (companyInfor) {
      setlogo(companyInfor[0].logo);
    }
  }, [companyInfor]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const handleSubMenuClick = (itemText) => {
    setOpenSubMenu(openSubMenu === itemText ? '' : itemText);
  };

  const renderMenuItem = (item) => (
    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
      <StyledListItemButton
        selected={selectedIndex === item.path}
        onClick={() => {
          if (item.children) {
            handleSubMenuClick(item.text);
          } else if (item.path?.startsWith('modal:')) {
           
            const modalType = item.path.split(':')[1];
            switch(modalType) {
              case 'department-users':
                setShowDepartmentUserModal(true);
                setOpen(false);
                break;
             
              default:
                console.warn('Unknown modal type:', modalType);
            }
          } else if (item.onClick) {
            item.onClick();
          } else {
            setSelectedIndex(item.path);
            navigate(item.path);
          }
        }}
        sx={{
          minHeight: 48,
          justifyContent: 'initial',
          px: 2.5,
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: 'primary.main',
            minWidth: 40,
            opacity: openSubMenu === item.text ? 1 : 0.8
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text}
          primaryTypographyProps={{
            fontSize: '0.95rem',
            fontWeight: selectedIndex === item.path || openSubMenu === item.text ? 600 : 400
          }}
        />
        {item.children && (
          <IconButton
            size="small"
            sx={{ 
              ml: 1,
              transform: openSubMenu === item.text ? 'rotate(-180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <ExpandMore fontSize="small" />
          </IconButton>
        )}
      </StyledListItemButton>
      {item.children && (
        <StyledSubMenu in={openSubMenu === item.text} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <StyledSubMenuItem
                key={child.text}
                selected={selectedIndex === child.path}
                onClick={() => {
                  if (child.onClick) {
                    child.onClick();
                  } else {
                    setSelectedIndex(child.path);
                    navigate(child.path);
                  }
                }}
              >
                <ListItemText 
                  primary={child.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selectedIndex === child.path ? 600 : 400,
                    color: selectedIndex === child.path ? 'primary.main' : 'text.secondary'
                  }}
                  sx={{ 
                    ml: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 28,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: selectedIndex === child.path ? 'primary.main' : 'divider'
                    }
                  }}
                />
              </StyledSubMenuItem>
            ))}
          </List>
        </StyledSubMenu>
      )}
    </ListItem>
  );

  const UserProfile = () => (
    <Box sx={{ 
      p: 2, 
      borderTop: '1px solid',
      borderColor: 'divider',
      mt: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ 
          bgcolor: theme.palette.primary.main,
          width: 40,
          height: 40
        }}>
          {userInfo?.name?.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {userInfo?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userInfo?.role}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout}>
          <ExitToApp fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const UserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: { width: 220, mt: 1.5 }
      }}
    >
      <MenuItem onClick={() => navigate('/profile')}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={() => navigate('/settings')}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>


      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ height: 40 }}
            />
           
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit" 
              sx={{ 
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Avatar 
              sx={{ 
                cursor: 'pointer',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {userInfo?.name?.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src="/assembly-logo.png" 
              alt="Logo"
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="h6" color="primary" fontWeight={600}>
              Assembly
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ mb: 2 }} />

        <List>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>

        <UserProfile />
      </StyledDrawer>

      <Main className='main_side'>
        <DrawerHeader />
        <Outlet />
      </Main>

      <UserMenu />

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            mt: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 300
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="inherit" noWrap>
            New staff member added
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="inherit" noWrap>
            Report generated successfully
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="inherit" noWrap>
            System update available
          </Typography>
        </MenuItem>
      </Menu>

      <HODModal
        open={showHODModal}
        onClose={handleHODModalClose}
      />



      <HODAssignmentModal
        open={showHODAssignmentModal}
        onClose={handleHODAssignmentModalClose}
      />

      <DepartmentUserModal
        open={showDepartmentUserModal}
        onClose={handleDepartmentUserModalClose}
        hodId={userInfo?.id}
        departmentId={userInfo?.department_id}
      />
    </Box>
  );
}

export default MainLayout;