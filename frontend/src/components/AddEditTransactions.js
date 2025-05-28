import React, { useState, useEffect } from 'react';
import { Form, Input, message, Modal, Select, DatePicker } from 'antd'; // Added DatePicker
import axios from 'axios';
import Spinner from './Spinner';
import moment from 'moment'; // Required for DatePicker
import '../resources/add-edit-transactions.css'; // Import specific styles for this modal

// Assuming transaction.css might have specific styles for this form, or they are in theme.css
// import '../resources/transaction.css';

const { Option } = Select;

const AddEditTransactions = (props) => {
  const {
    showAndEditTransactionModal,
    setShowAndEditTransactionModal,
    getTransactions,
    selectedItemForEdit,
    setSelectedItemForEdit,
  } = props;

  const [form] = Form.useForm(); // To control form instance

  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://Money-mate.vercel.app' // Corrected host
      : 'http://localhost:5000';

  const [loading, setLoading] = useState(false);
  // Initialize type and category based on selectedItemForEdit or defaults
  const initialType = selectedItemForEdit ? selectedItemForEdit.type : 'income';
  const initialCategory = selectedItemForEdit ? selectedItemForEdit.category : '';

  const [transactionType, setTransactionType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);


  const incomeCategories = [
    'Salary', 'Freelance', 'Business Income', 'Investment Returns', 'Rental Income',
    'Dividends', 'Interest Income', 'Bonuses', 'Refunds/Reimbursements', 'Gifts', 'Other Income'
  ];

  const expenseCategories = [
    'Rent/Mortgage', 'Groceries', 'Utilities', 'Transportation', 'Insurance', 'Healthcare',
    'Entertainment', 'Subscriptions', 'Dining Out', 'Education', 'Shopping', 'Travel', 'Other Expense'
  ];

  useEffect(() => {
    // Reset form fields and state when modal opens or selectedItemForEdit changes
    if (showAndEditTransactionModal) {
      if (selectedItemForEdit) {
        form.setFieldsValue({
          ...selectedItemForEdit,
          date: selectedItemForEdit.date ? moment(selectedItemForEdit.date) : null,
        });
        setTransactionType(selectedItemForEdit.type);
        setSelectedCategory(selectedItemForEdit.category);
      } else {
        form.resetFields();
        const userPreferredCurrency = JSON.parse(localStorage.getItem('Cashbook-User'))?.preferredCurrency || 'INR';
        form.setFieldsValue({ type: 'income', category: '', currency: userPreferredCurrency });
        setTransactionType('income');
        setSelectedCategory('');
      }
    }
  }, [showAndEditTransactionModal, selectedItemForEdit, form]);


  const onFinish = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem('Cashbook-User'));
      if (!user) {
        message.error("User not found. Please log in.");
        return;
      }
      setLoading(true);

      const payload = {
        ...values,
        userid: user._id,
        date: values.date ? values.date.toISOString() : moment().toISOString(), // Ensure date is in ISO format
      };

      if (values.category === 'custom' && values.customCategory) {
        payload.category = values.customCategory.trim();
      }
      delete payload.customCategory;


      if (selectedItemForEdit) {
        await axios.post(`${host}/api/transactions/edit-transaction`, {
          payload,
          transactionId: selectedItemForEdit.key, // Assuming 'key' is the _id
        });
        message.success('Transaction updated successfully');
      } else {
        await axios.post(`${host}/api/transactions/add-transaction`, payload);
        message.success('Transaction added successfully');
      }
      getTransactions();
      setLoading(false);
      setShowAndEditTransactionModal(false);
      setSelectedItemForEdit(null); // Clear selected item
      form.resetFields(); // Reset form after successful submission
      setSelectedCategory('');
      setTransactionType('income');


    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.message || 'Something went wrong');
      console.error("Transaction save error:", error);
    }
  };

  const handleCancel = () => {
    setShowAndEditTransactionModal(false);
    setSelectedItemForEdit(null); // Clear selected item on cancel
    form.resetFields();
    setSelectedCategory('');
    setTransactionType('income');
  };

  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  return (
    <Modal
      title={selectedItemForEdit ? 'Edit Transaction' : 'Add New Transaction'}
      visible={showAndEditTransactionModal}
      onCancel={handleCancel}
      footer={null} // Use custom footer or Form buttons
      destroyOnClose // Reset form state when modal is closed
    >
      {loading && <Spinner />}
      <Form
        form={form}
        layout='vertical'
        className='modern-transaction-form' // Add a class for specific styling if needed
        onFinish={onFinish}
        initialValues={{ // Set initial values here, useEffect will override for edit
          type: 'income',
          category: '',
          currency: JSON.parse(localStorage.getItem('Cashbook-User'))?.preferredCurrency || 'INR',
          date: moment(), // Default to today
        }}
      >
        <Form.Item
          label='Amount'
          name='amount'
          rules={[{ required: true, message: 'Please input the amount!' }]}
        >
          <Input type='number' className="form-input" placeholder="Enter amount" />
        </Form.Item>

        <Form.Item
          label='Currency'
          name='currency'
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
            {/* Add more common currencies */}
          </Select>
        </Form.Item>

        <Form.Item
          label='Type'
          name='type'
          rules={[{ required: true, message: 'Please select transaction type!' }]}
        >
          <Select className="form-select" onChange={(value) => {
            setTransactionType(value);
            form.setFieldsValue({ category: '' }); // Reset category when type changes
            setSelectedCategory('');
          }}>
            <Option value='income'>Income</Option>
            <Option value='expense'>Expense</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label='Category'
          name='category'
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

        {selectedCategory === 'custom' && (
          <Form.Item
            label='Custom Category Name'
            name='customCategory'
            rules={[{ required: true, message: 'Please enter custom category name!' }]}
          >
            <Input type='text' className="form-input" placeholder="Enter custom category" />
          </Form.Item>
        )}

        <Form.Item
          label='Date'
          name='date'
          rules={[{ required: true, message: 'Please select the date!' }]}
        >
          <DatePicker className="form-input" style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label='Reference (Optional)' name='reference'>
          <Input type='text' className="form-input" placeholder="E.g., Bill, Payer, Payee" />
        </Form.Item>

        <Form.Item label='Description (Optional)' name='description'>
          <Input.TextArea className="form-input" rows={3} placeholder="Add a note for this transaction" />
        </Form.Item>

        <Form.Item className="form-actions">
          <button type="button" className="btn btn-outline mr-2" onClick={handleCancel} style={{marginRight: '10px'}}>
            CANCEL
          </button>
          <button className='btn btn-primary' type='submit' disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE TRANSACTION'}
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditTransactions;
