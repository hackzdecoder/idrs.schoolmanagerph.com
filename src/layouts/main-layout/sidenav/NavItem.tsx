import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Box, Collapse } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import { cssVarRgba } from 'lib/utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { COLLAPSE_NAVBAR } from 'reducers/SettingsReducer';
import paths from 'routes/paths';
import { SubMenuItem } from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import { OnLoader } from 'components/dialogs/Dialog';
import { useNavContext } from '../NavProvider';
import NavItemPopper from './NavItemPopper';

interface NavItemProps {
  item: SubMenuItem;
  level: number;
}

interface NavItemCollapseProps {
  item: SubMenuItem;
  level: number;
}

const NavItem = ({ item, level }: NavItemProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [openPopperMenu, setOpenPopperMenu] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { post } = useRouteApiSetup();
  const { setOpenItems, openItems, isNestedItemOpen } = useNavContext();
  const { currentBreakpoint, up } = useBreakpoints();
  const upLg = up('lg');
  const {
    config: { sidenavCollapsed, openNavbarDrawer },
    configDispatch,
    handleDrawerToggle,
  } = useSettingsContext();

  const hasNestedItems = useMemo(() => Object.prototype.hasOwnProperty.call(item, 'items'), [item]);

  // ✅ Get user role from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // ✅ Get the correct login page based on role
  const getLoginPageByRole = (role: string): string => {
    switch (role) {
      case 'Super Admin':
      case 'Admin':
        return paths.admin_login;
      case 'Student':
        return paths.authenticate_login;
      default:
        return paths.login;
    }
  };

  // ✅ Logout handler - uses role-based redirect
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setLogoutModalOpen(true);
    setIsLoggingOut(true);

    try {
      await post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('access_expires_at');
      localStorage.removeItem('student_info');
      localStorage.removeItem('existing_student_data');
      localStorage.removeItem('existing_student_school_code');

      setLogoutModalOpen(false);

      // ✅ Redirect based on user role
      navigate(getLoginPageByRole(userRole), { replace: true });

      setIsLoggingOut(false);
    }
  };

  const expandIcon = (
    <IconifyIcon
      icon="material-symbols:expand-more-rounded"
      className="expand-icon"
      sx={[
        {
          fontSize: 12,
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
        },
        openItems[level] === item.pathName && {
          transform: 'rotate(180deg)',
        },
        sidenavCollapsed && {
          transform: (theme) => (theme.direction === 'rtl' ? 'rotate(-270deg)' : 'rotate(270deg)'),
          position: 'absolute',
          right: 8,
        },
      ]}
    />
  );

  const toggleCollapseItem = () => {
    // ✅ Handle logout special case
    if (item.name === 'Logout') {
      handleLogout();
      return;
    }

    if (!hasNestedItems) {
      if (openNavbarDrawer) {
        handleDrawerToggle();
      } else if (!upLg && !sidenavCollapsed) {
        configDispatch({ type: COLLAPSE_NAVBAR });
      }
      return;
    }

    if (!sidenavCollapsed) {
      if (hasNestedItems) {
        if (openItems[level] === item.pathName) {
          setOpenItems(openItems.slice(0, level));
        } else {
          const updatedOpenItems = [...openItems];
          updatedOpenItems[level] = item.pathName;
          setOpenItems(updatedOpenItems);
        }
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenPopperMenu(false);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopperMenu(true);
  };

  useEffect(() => {
    if (isNestedItemOpen(item.items)) {
      setOpenItems((prev) => {
        const updatedOpenItems = [...prev];
        updatedOpenItems[level] = item.pathName;
        return updatedOpenItems;
      });
    }
  }, [currentBreakpoint]);

  return (
    <>
      <ListItem key={item.pathName} disablePadding>
        <ListItemButton
          component={item.items ? 'div' : item.name === 'Logout' ? 'div' : NavLink}
          to={item.name === 'Logout' ? undefined : item.path}
          onClick={toggleCollapseItem}
          target={item.target ? item.target : undefined}
          onMouseEnter={sidenavCollapsed ? handleMouseEnter : undefined}
          onMouseLeave={sidenavCollapsed ? handleClose : undefined}
          aria-expanded={openPopperMenu}
          selected={
            pathname === item.path ||
            (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
            (sidenavCollapsed && isNestedItemOpen(item.items)) ||
            (openItems[level] !== item.pathName && isNestedItemOpen(item.items))
          }
          sx={[
            (theme) => ({
              p: theme.spacing('3.5px', 2),
              '&.Mui-selected': {
                [`& .${listItemTextClasses.primary}`]: {
                  color: 'primary.main',
                },
              },
            }),
            !item.active && {
              [`& .${listItemTextClasses.primary}`]: {
                color: 'text.disabled',
              },
              [`& .${listItemIconClasses.root}`]: {
                color: 'text.disabled',
              },
            },
            sidenavCollapsed && {
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              textAlign: 'center',
              p: 1,
            },
            (!sidenavCollapsed || level !== 0) && {
              minWidth: 180,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              textAlign: 'left',
            },
            openPopperMenu && {
              backgroundColor: ({ vars }) =>
                level === 0 ? cssVarRgba(vars.palette.primary.mainChannel, 0.36) : 'action.hover',
            },
          ]}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                '& .iconify': {
                  fontSize: sidenavCollapsed ? 24 : 14,
                },
              }}
            >
              <IconifyIcon icon={item.icon} sx={item.iconSx} />
            </ListItemIcon>
          )}

          <Box
            sx={[
              {
                flex: 1,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              level === 0 &&
                sidenavCollapsed && {
                  px: 1,
                },
            ]}
          >
            <ListItemText
              sx={[
                {
                  [`& .${listItemTextClasses.primary}`]: {
                    typography: 'caption',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                    color: level === 0 ? 'text.primary' : 'text.secondary',
                  },
                },
                sidenavCollapsed && {
                  [`& .${listItemTextClasses.primary}`]: {
                    lineClamp: 1,
                    wordBreak: 'break-all',
                    whiteSpace: 'normal',
                  },
                },
              ]}
            >
              {item.name}
            </ListItemText>
            {hasNestedItems && expandIcon}
          </Box>
          {hasNestedItems && sidenavCollapsed && (
            <NavItemPopper
              handleClose={handleClose}
              anchorEl={anchorEl as HTMLElement}
              open={!!anchorEl && openPopperMenu}
              level={level + 1}
            >
              <List
                dense
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {item.items!.map((nestedItem) => (
                  <NavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
                ))}
              </List>
            </NavItemPopper>
          )}
        </ListItemButton>
      </ListItem>

      {hasNestedItems && !sidenavCollapsed && <NavItemCollapse item={item} level={level} />}

      {/* ✅ Logout Loading Overlay */}
      <OnLoader open={logoutModalOpen} title="Logging Out..." size={40} thickness={4} />
    </>
  );
};

export default NavItem;

const NavItemCollapse = ({ item, level }: NavItemCollapseProps) => {
  const { openItems } = useNavContext();

  return (
    <Collapse in={openItems[level] === item.pathName} timeout="auto" unmountOnExit>
      <List
        dense
        disablePadding
        sx={{ pl: level === 0 ? 4 : 2, display: 'flex', flexDirection: 'column', gap: '2px' }}
      >
        {item.items!.map((nestedItem) => (
          <NavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
        ))}
      </List>
    </Collapse>
  );
};
