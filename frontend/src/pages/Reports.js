import React, { useState } from 'react';
import { Card, Row, Col } from 'antd';
import DefaultLayout from '../components/DefaultLayout';
import '../resources/reports.css';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';

const Reports = () => {
  const [selectedChart, setSelectedChart] = useState('bar');

  const chartOptions = [
    {
      value: 'bar',
      label: 'Bar Chart',
      icon: <BarChartOutlined />,
      description: 'Compare expenses across categories'
    },
    {
      value: 'pie',
      label: 'Pie Chart',
      icon: <PieChartOutlined />,
      description: 'View expense distribution'
    },
    {
      value: 'line',
      label: 'Line Chart',
      icon: <LineChartOutlined />,
      description: 'Track expenses over time'
    },
    {
      value: 'area',
      label: 'Area Chart',
      icon: <AreaChartOutlined />,
      description: 'Analyze cumulative spending'
    }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return <div>Bar Chart Component</div>;
      case 'pie':
        return <div>Pie Chart Component</div>;
      case 'line':
        return <div>Line Chart Component</div>;
      case 'area':
        return <div>Area Chart Component</div>;
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="reports-container">
        <h2>Expense Reports</h2>
        
        <Row gutter={[16, 16]} className="chart-selector">
          {chartOptions.map(option => (
            <Col xs={24} sm={12} md={6} key={option.value}>
              <Card
                className={`chart-option ${selectedChart === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedChart(option.value)}
                hoverable
              >
                <div className="chart-icon">{option.icon}</div>
                <h3>{option.label}</h3>
                <p>{option.description}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="chart-container">
          {renderChart()}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Reports;