import React, { useState, useEffect } from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to apply the theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    applyTheme(savedTheme);
  }, []);

  const handleThemeChange = (checked) => {
    const newTheme = checked ? 'dark' : 'light';
    setIsDarkMode(checked);
    applyTheme(newTheme);
  };

  return (
    <Switch
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
      checked={isDarkMode}
      onChange={handleThemeChange}
      aria-label="Toggle light and dark mode"
    />
  );
};

export default ThemeToggle;