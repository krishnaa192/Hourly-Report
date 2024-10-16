import React, { useState } from 'react';
import '../css/Table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../css/filter.css';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const TrafficFilterdata = ({ setFilters, serviceNames, territories, operators, partnerNames }) => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [serviceName, setServiceName] = useState('');
  const [territory, setTerritory] = useState('');
  const [operator, setOperator] = useState('');
  const [partnerName, setPartnerName] = useState('');

  const applyFilters = () => {
    // Check for valid date range
    if (dateRange.from && dateRange.to && new Date(dateRange.from) > new Date(dateRange.to)) {
      alert('The "from" date cannot be later than the "to" date.');
      return;
    }

    // Pass filters to parent component
    setFilters({
      partnerName,
      dateRange,
      serviceName,
      territory,
      operator,
    });
  };

  const clearFilters = () => {
    setDateRange({ from: '', to: '' });
    setServiceName('');
    setTerritory('');
    setOperator('');
    setPartnerName('');
    setFilters({}); 
  };

  return (
    <div className="filter-obj">
      <div className="filter-container">
        {/* Traffic Partner Dropdown */}
        <div>
          <label>Traffic Partner</label>
          <select value={partnerName} onChange={(e) => setPartnerName(e.target.value)}>
            <option value="">Select Partner Name</option>
            {partnerNames.map((partner, idx) => (
              <option key={idx} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Input */}
        <div className="date">
          <label>Date Range</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
        
        {/* Territory Dropdown */}
        <div>
          <label>Territory</label>
          <select value={territory} onChange={(e) => setTerritory(e.target.value)}>
            <option value="">Select Territory</option>
            {territories.map((territory, idx) => (
              <option key={idx} value={territory}>
                {territory}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Dropdown */}
        <div>
          <label>Operator</label>
          <select value={operator} onChange={(e) => setOperator(e.target.value)}>
            <option value="">Select Operator</option>
            {operators.map((operator, idx) => (
              <option key={idx} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>

        {/* Service Name Dropdown */}
        <div>
          <label>Service Name</label>
          <select value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
            <option value="">Select Service Name</option>
            {serviceNames.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="action-btn">
        <button onClick={applyFilters}>Apply Filters</button>
        <button className="clear-filters-btn" onClick={clearFilters}>
          <FontAwesomeIcon icon={faTimesCircle} /> Clear Filters
        </button>
      </div>
    </div>
  );
};

export default TrafficFilterdata;
