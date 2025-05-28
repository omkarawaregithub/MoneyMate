import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const CurrencySelector = () => {
  const handleChange = (value) => {
    console.log(`Selected currency: ${value}`);
    // Logic to change currency will be added here
  };

  // Placeholder currencies - can be expanded with country flags/icons
  const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  return (
    <Select
      defaultValue="INR"
      style={{ width: 120, marginRight: '15px' }}
      onChange={handleChange}
      aria-label="Select Currency"
    >
      {currencies.map(currency => (
        <Option key={currency.code} value={currency.code}>
          {/* Add flag icons later */}
          {currency.code} ({currency.symbol})
        </Option>
      ))}
    </Select>
  );
};

export default CurrencySelector;