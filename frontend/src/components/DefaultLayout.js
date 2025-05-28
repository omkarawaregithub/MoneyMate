import React, { useState, useEffect } from 'react';
import '../resources/default-layout.css';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle'; // Import ThemeToggle
import {
  DashboardOutlined, // Changed from LayoutDashboardOutlined
  PlusCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined, // Import BarChartOutlined for Reports
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Button } from 'antd'; // Added Button for toggle

const DefaultLayout = (props) => {
  const user = JSON.parse(localStorage.getItem('Cashbook-User'));
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.title = 'MoneyMate – Smart Personal Finance Management'; // Set the document title
  }, []);

  if (!user) {
    // Redirect to login if user is not found
    navigate('/login');
    return null; // or a loading spinner
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />, // Changed from LayoutDashboardOutlined
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/add-new',
      icon: <PlusCircleOutlined />,
      label: 'Add New',
      onClick: () => navigate('/add-new'),
    },
    {
      key: '/history',
      icon: <UnorderedListOutlined />,
      label: 'History',
      onClick: () => navigate('/history'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />, // Changed to BarChartOutlined
      label: 'Reports',
      onClick: () => navigate('/reports'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  const userMenu = (
    <Menu
      items={[
        {
          key: 'username',
          icon: <UserOutlined />,
          label: user.name.charAt(0).toUpperCase() + user.name.substring(1),
          disabled: true,
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: () => {
            localStorage.removeItem('Cashbook-User');
            navigate('/login');
          },
        },
      ]}
    />
  );

  return (
    <div className={`layout-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          {collapsed ? (
            <h1 className="logo-text-collapsed">MM</h1>
          ) : (
            <h1 className="logo-text-full">MoneyMate</h1>
          )}
        </div>
        <Menu
          theme="light" // Or "dark" based on Montra theme
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          inlineCollapsed={collapsed}
        />
      </div>
      <div className="main-content">
        <div className="header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle-btn"
          />
          <div className="header-right">
            <ThemeToggle />
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} className="user-menu-btn">
                {!collapsed && (user.name.charAt(0).toUpperCase() + user.name.substring(1))}
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="content-area">{props.children}</div>
      </div>
    </div>
  );
};

export default DefaultLayout;
