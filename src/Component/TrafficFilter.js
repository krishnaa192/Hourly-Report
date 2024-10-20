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
  const [dateError, setDateError] = useState(''); 

  const applyFilters = () => {
    if (!dateRange.from || !dateRange.to) {
      setDateError('Dates are required.');
      return;
    }
    if (new Date(dateRange.from) > new Date(dateRange.to)) {
      setDateError('The "from" date cannot be later than the "to" date.');
      return;
    }

    // Clear the error message
    setDateError('');

    // Apply the filters
    setFilters({
      dateRange,
      serviceName,
      territory,
      operator,
      partnerName,
    });

    setDateError('');
  };

  const clearFilters = () => {
 
    setDateRange({ from: '', to: '' });
    setServiceName('');
    setTerritory('');
    setOperator('');
    setPartnerName('');

    // Clear filters in the parent component as well
    setFilters({
  
      dateRange: { from: '', to: '' },
      serviceName: '',
      territory: '',
      operator: '',
      partnerName: '',
    });
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
            <div className='date-input'>
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
        <div className='op'> 
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
        <div className='partner'>
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
