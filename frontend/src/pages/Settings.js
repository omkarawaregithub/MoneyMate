import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Spin, Row, Col } from 'antd';
import axios from 'axios';
import DefaultLayout from '../components/DefaultLayout';
import Spinner from '../components/Spinner'; // Using the consistent Spinner
import ThemeToggle from '../components/ThemeToggle'; // Import ThemeToggle
// import '../resources/settings.css'; // Create this file for specific styles if needed

const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');


  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://Money-mate.vercel.app'
      : 'http://localhost:5000';

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('Cashbook-User'));
    if (currentUser) {
      setUser(currentUser);
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        preferredCurrency: currentUser.preferredCurrency || 'INR', // Default to INR
      });
    }
    // Listen to theme changes from localStorage (e.g., if changed by ThemeToggle in header)
    const handleStorageChange = () => {
        setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [form]);

  const onFinish = async (values) => {
    if (!user) {
        message.error("User data not loaded. Please try again.");
        return;
    }
    setLoading(true);
    try {
      // The API endpoint might need adjustment based on your backend routes
      const response = await axios.post(`${host}/api/users/update-profile`, {
        userId: user._id, // Ensure userId is sent, or backend derives from token
        name: values.name,
        preferredCurrency: values.preferredCurrency,
        // Email is typically not updated here or requires a separate flow
      });
      localStorage.setItem('Cashbook-User', JSON.stringify(response.data.user || response.data)); // Adjust based on backend response structure
      message.success('Profile updated successfully!');
      setUser(response.data.user || response.data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile.');
      console.error("Profile update error:", error);
    }
    setLoading(false);
  };

  const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  if (!user && !loading) { // Show spinner only if user is null and not already loading from submit
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      </DefaultLayout>
    );
  }
  
  if (!user && loading) { // If submit was hit before user loaded (edge case)
     return (
      <DefaultLayout>
        <Spinner />
      </DefaultLayout>
    );
  }


  return (
    <DefaultLayout>
      <div className="page-header mb-3">
        <h2>Settings</h2>
      </div>

      {loading && <Spinner />}

      <Row gutter={[16, 16]}>
        {/* Profile Settings Card */}
        <Col xs={24} md={12}>
          <div className="card p-3">
            <h3 className="mb-3">User Profile</h3>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input className="form-input" placeholder="Your full name" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: "Please input a valid email!" }]}
              >
                <Input className="form-input" disabled />
              </Form.Item>
              <Form.Item
                label="Preferred Currency"
                name="preferredCurrency"
                rules={[{ required: true, message: "Please select your preferred currency!" }]}
              >
                <Select className="form-select" placeholder="Select your currency">
                  {currencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.code} ({currency.name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="btn btn-primary">
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

        {/* Appearance Settings Card */}
        <Col xs={24} md={12}>
          <div className="card p-3">
            <h3 className="mb-3">Appearance</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Theme Mode:</span>
              <ThemeToggle />
            </div>
            <p className="text-secondary mt-2">
              Current mode: {isDarkMode ? 'Dark' : 'Light'}. Changes will apply across the app.
            </p>
            {/* Add other appearance settings here if needed */}
          </div>
        </Col>
      </Row>
      {/* Add more settings sections/cards as needed, e.g., Notifications, Security */}
    </DefaultLayout>
  );
};

export default Settings;