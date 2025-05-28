import React, { useState, useEffect } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import { Form, Input, message, Select, DatePicker, Button, Row, Col } from 'antd';
import axios from 'axios';
import Spinner from '../components/Spinner';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// Ensure specific styles for this page are created or use theme.css classes

const { Option } = Select;

function AddExpense() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState('expense'); // Default to expense
  const [selectedCategory, setSelectedCategory] = useState('');

  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://Money-mate.vercel.app'
      : 'http://localhost:5000';

  // Categories (can be moved to a shared constants file if used elsewhere)
  const incomeCategories = [
    'Salary', 'Freelance', 'Business Income', 'Investment Returns', 'Rental Income',
    'Dividends', 'Interest Income', 'Bonuses', 'Refunds/Reimbursements', 'Gifts', 'Other Income'
  ];

  const expenseCategories = [
    'Rent/Mortgage', 'Groceries', 'Utilities', 'Transportation', 'Insurance', 'Healthcare',
    'Entertainment', 'Subscriptions', 'Dining Out', 'Education', 'Shopping', 'Travel', 'Other Expense'
  ];

  useEffect(() => {
    // Set initial form values, especially for type
    const userPreferredCurrency = JSON.parse(localStorage.getItem('Cashbook-User'))?.preferredCurrency || 'INR';
    form.setFieldsValue({
      type: 'expense', // Default to expense
      currency: userPreferredCurrency,
      date: moment(), // Default to today
    });
  }, [form]);

  const onFinish = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem('Cashbook-User'));
      if (!user) {
        message.error("User not found. Please log in.");
        navigate('/login');
        return;
      }
      setLoading(true);

      const payload = {
        ...values,
        userid: user._id,
        date: values.date ? values.date.toISOString() : moment().toISOString(),
      };

      if (values.category === 'custom' && values.customCategory) {
        payload.category = values.customCategory.trim();
      }
      delete payload.customCategory;

      await axios.post(`${host}/api/transactions/add-transaction`, payload);
      message.success('Transaction added successfully!');
      setLoading(false);
      form.resetFields();
      // Reset type to expense and clear category after successful submission
      setTransactionType('expense');
      setSelectedCategory('');
      const userPreferredCurrency = JSON.parse(localStorage.getItem('Cashbook-User'))?.preferredCurrency || 'INR';
      form.setFieldsValue({
        type: 'expense',
        currency: userPreferredCurrency,
        date: moment(),
      });
      // Optionally navigate to dashboard or history page
      // navigate('/');
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.message || 'Failed to add transaction. Please try again.');
      console.error("Add transaction error:", error);
    }
  };

  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  return (
    <DefaultLayout>
      <div className="page-header mb-3">
        <h2>Add New Transaction</h2>
      </div>
      <div className="card p-3"> {/* Using card style from theme.css */}
        {loading && <Spinner />}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="modern-transaction-form" // Can reuse modal form styles or create new ones
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: 'Please input the amount!' }]}
              >
                <Input type="number" className="form-input" placeholder="Enter amount" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Currency"
                name="currency"
                rules={[{ required: true, message: 'Please select currency!' }]}
              >
                <Select className="form-select" placeholder="Select currency">
                  <Option value='USD'>USD ($) - United States Dollar</Option>
                  <Option value='EUR'>EUR (€) - Euro</Option>
                  <Option value='GBP'>GBP (£) - British Pound</Option>
                  <Option value='INR'>INR (₹) - Indian Rupee</Option>
                  <Option value='JPY'>JPY (¥) - Japanese Yen</Option>
                  <Option value='CAD'>CAD (C$) - Canadian Dollar</Option>
                  <Option value='AUD'>AUD (A$) - Australian Dollar</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select transaction type!' }]}
              >
                <Select className="form-select" onChange={(value) => {
                  setTransactionType(value);
                  form.setFieldsValue({ category: '' }); // Reset category
                  setSelectedCategory('');
                }}>
                  <Option value="expense">Expense</Option>
                  <Option value="income">Income</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Select className="form-select" placeholder="Select category" onChange={(value) => setSelectedCategory(value)}>
                  {currentCategories.map((category) => (
                    <Option key={category} value={category.toLowerCase().replace(/[\s/]+/g, '-')}>
                      {category}
                    </Option>
                  ))}
                  <Option value="custom">Custom...</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedCategory === 'custom' && (
            <Form.Item
              label="Custom Category Name"
              name="customCategory"
              rules={[{ required: true, message: 'Please enter custom category name!' }]}
            >
              <Input type="text" className="form-input" placeholder="Enter custom category" />
            </Form.Item>
          )}

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select the date!' }]}
          >
            <DatePicker className="form-input" style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Reference (Optional)" name="reference">
            <Input type="text" className="form-input" placeholder="E.g., Bill, Payer, Payee" />
          </Form.Item>

          <Form.Item label="Description (Optional)" name="description">
            <Input.TextArea className="form-input" rows={3} placeholder="Add a note for this transaction" />
          </Form.Item>

          <Form.Item className="form-actions mt-3" style={{ textAlign: 'right' }}>
            <Button type="default" onClick={() => form.resetFields()} style={{ marginRight: '10px' }} className="btn">
              RESET
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} className="btn btn-primary">
              {loading ? 'ADDING...' : 'ADD TRANSACTION'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </DefaultLayout>
  );
}

export default AddExpense;