import React, { useEffect, useState, useCallback } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import { DatePicker, message, Select, Table, Row, Col, Button } from 'antd';
import axios from 'axios';
import moment from 'moment';
import Spinner from '../components/Spinner';
import AddEditTransactions from '../components/AddEditTransactions';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import '../resources/dashboard.css'; // Can reuse dashboard styles for filters and table

const { RangePicker } = DatePicker;

function ExpenseHistory() {
  const [loading, setLoading] = useState(false);
  const [transactionsData, setTransactionsData] = useState([]);
  const [frequency, setFrequency] = useState('7'); // Default to last 7 days
  const [selectedRange, setSelectedRange] = useState([]);
  const [type, setType] = useState('all'); // 'all', 'income', 'expense'

  const [showAndEditTransactionModal, setShowAndEditTransactionModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://Money-mate.vercel.app'
      : 'http://localhost:5000';

  const renameKey = (transactions) => {
    return transactions.map(obj => ({ ...obj, key: obj._id }));
  };

  const getTransactions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('Cashbook-User'));
      if (!user) {
        message.error('User not found. Please login again.');
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
      message.error('Failed to fetch transactions.');
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
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (text, record) => <span style={{ color: record.type === 'income' ? 'green' : 'red' }}>
        {record.type === 'income' ? '+' : '-'} {record.amount} {record.currency}
      </span>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: [
        { text: 'Income', value: 'income' },
        { text: 'Expense', value: 'expense' },
      ],
      onFilter: (value, record) => record.type.includes(value),
      render: (text) => <span>{text.charAt(0).toUpperCase() + text.slice(1)}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
    },
    {
      title: 'Description',
      dataIndex: 'description',
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
      <div className="page-header mb-3">
        <h2>History</h2>
      </div>

      {loading && <Spinner />}

      {/* Filters */}
      <div className="filter-controls card mb-3">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label htmlFor="frequency-select-history">Select Frequency</label>
              <Select id="frequency-select-history" className="form-select" value={frequency} onChange={(value) => setFrequency(value)}>
                <Select.Option value='7'>Last 1 Week</Select.Option>
                <Select.Option value='30'>Last 1 Month</Select.Option>
                <Select.Option value='365'>Last 1 Year</Select.Option>
                <Select.Option value='custom'>Custom Range</Select.Option>
              </Select>
            </div>
          </Col>
          {frequency === 'custom' && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="form-group">
                <label htmlFor="range-picker-history">Select Range</label>
                <RangePicker id="range-picker-history" className="form-input" value={selectedRange} onChange={(values) => setSelectedRange(values)} />
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="form-group">
              <label htmlFor="type-select-history">Select Type</label>
              <Select id="type-select-history" className="form-select" value={type} onChange={(value) => setType(value)}>
                <Select.Option value='all'>All</Select.Option>
                <Select.Option value='income'>Income</Select.Option>
                <Select.Option value='expense'>Expense</Select.Option>
              </Select>
            </div>
          </Col>
           <Col xs={24} md={8} lg={6} style={{ textAlign: 'right', marginTop: '10px' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="btn btn-primary"
              onClick={() => {
                setSelectedItemForEdit(null); 
                setShowAndEditTransactionModal(true);
              }}
            >
              Add Transaction
            </Button>
          </Col>
        </Row>
      </div>

      {/* Transaction Table */}
      <div className="content-display-area card">
        <div className='table-container'>
          <Table dataSource={transactionsData} columns={columns} bordered responsive scroll={{ x: 'max-content' }} />
        </div>
      </div>

      {showAndEditTransactionModal && (
        <AddEditTransactions
          showAndEditTransactionModal={showAndEditTransactionModal}
          setShowAndEditTransactionModal={setShowAndEditTransactionModal}
          getTransactions={getTransactions}
          selectedItemForEdit={selectedItemForEdit}
          setSelectedItemForEdit={setSelectedItemForEdit}
        />
      )}
    </DefaultLayout>
  );
}

export default ExpenseHistory;