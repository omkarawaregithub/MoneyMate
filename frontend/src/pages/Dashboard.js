import { DatePicker, message, Select, Table, Row, Col, Button } from 'antd'; // Added Row, Col, Button
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import AddEditTransactions from '../components/AddEditTransactions';
import DefaultLayout from '../components/DefaultLayout';
import Spinner from '../components/Spinner';
import '../resources/dashboard.css';
import {
  UnorderedListOutlined,
  AreaChartOutlined,
  EditOutlined,
  DeleteOutlined,
  WalletOutlined, // New icon for Balance
  RiseOutlined, // New icon for Income
  FallOutlined, // New icon for Expense
} from '@ant-design/icons';
import Analytics from '../components/Analytics';

const Dashboard = () => {
  const [showAndEditTransactionModal, setShowAndEditTransactionModal] =
    useState(false);

  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://Money-mate.vercel.app'
      : 'http://localhost:5000';

  const [loading, setLoading] = useState(false);
  const [transactionsData, setTransactionsData] = useState([]);
  const [frequency, setFrequency] = useState('7');
  const { RangePicker } = DatePicker;
  const [selectedRange, setSelectedRange] = useState([]);
  const [type, setType] = useState('all');
  const [viewType, setViewType] = useState('table'); // 'table' or 'analytics'
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  // Calculate summary data (placeholders, will need actual logic)
  const totalIncome = transactionsData
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactionsData
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;


  const renameKey = (transactions) => {
    return transactions.map(obj => ({ ...obj, key: obj._id }));
  };

  const getTransactions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('Cashbook-User'));
      if (!user) {
        message.error('User not found. Please login again.');
        // navigate('/login'); // Consider navigating to login
        return;
      }
      setLoading(true);
      const response = await axios.post(
        `${host}/api/transactions/get-all-transactions`,
        {
          userid: user._id,
          frequency,
          ...(frequency === 'custom' && { selectedRange }),
          type,
        }
      );
      const processedData = renameKey(response.data);
      setTransactionsData(processedData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Failed to fetch transactions. Please try again.');
      console.error("Fetch transactions error:", error);
    }
  }, [frequency, selectedRange, type, host]); // Added host to dependencies

  const deleteTransactions = async (record) => {
    try {
      setLoading(true);
      await axios.post(`${host}/api/transactions/delete-transaction`, {
        transactionId: record.key,
      });
      message.success('Transaction deleted successfully');
      getTransactions(); // Refresh data
      // setLoading(false); // getTransactions will set loading to false
    } catch (error) {
      setLoading(false);
      message.error('Failed to delete transaction.');
    }
  };

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (text) => <span>{moment(text).format('YYYY-MM-DD')}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (text, record) => <span>{record.amount} {record.currency}</span>, // Assuming currency is part of record
    },
    {
      title: 'Category',
      dataIndex: 'category',
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record) => (
        <div className="actions-group">
          <EditOutlined
            className="action-icon"
            onClick={() => {
              setSelectedItemForEdit(record);
              setShowAndEditTransactionModal(true);
            }}
          />
          <DeleteOutlined
            className="action-icon delete-icon"
            onClick={() => deleteTransactions(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      {loading && <Spinner />}

      <div className="dashboard-header mb-3">
        <h2>Dashboard Overview</h2>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-3">
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <div className="card summary-card">
            <div className="card-icon income"><RiseOutlined /></div>
            <h3>Total Income</h3>
            <p className="amount">₹{totalIncome.toFixed(2)}</p>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <div className="card summary-card">
            <div className="card-icon expense"><FallOutlined /></div>
            <h3>Total Expenses</h3>
            <p className="amount">₹{totalExpense.toFixed(2)}</p>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <div className="card summary-card">
            <div className="card-icon balance"><WalletOutlined /></div>
            <h3>Balance</h3>
            <p className="amount">₹{balance.toFixed(2)}</p>
          </div>
        </Col>
      </Row>

      {/* Dashboard Image */}
      <div className="dashboard-image-container mb-3">
        <img
          src="/assets/moneymate.png"
          alt="MoneyMate Logo"
          className="dashboard-hero-image"
          onError={(e) => {
            console.error('Image failed to load:', e);
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {showAndEditTransactionModal && (
        <AddEditTransactions
          showAndEditTransactionModal={showAndEditTransactionModal}
          setShowAndEditTransactionModal={setShowAndEditTransactionModal}
          getTransactions={getTransactions}
          selectedItemForEdit={selectedItemForEdit}
          setSelectedItemForEdit={setSelectedItemForEdit} // Pass this to clear after edit/add
        />
      )}
    </DefaultLayout>
  );
};

export default Dashboard;