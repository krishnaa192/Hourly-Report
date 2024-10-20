import React, { useState, useEffect } from 'react';
import '../css/Table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../css/filter.css';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Filterdata = ({ setFilters, serviceOwners, data }) => {
  const [serviceOwner, setServiceOwner] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [serviceName, setServiceName] = useState('');
  const [territory, setTerritory] = useState('');
  const [operator, setOperator] = useState('');
  const [partnerName, setPartnerName] = useState('');

  // Extract unique values for dropdowns based on selected service owner
  const getUniqueValues = (key) => {
    const filteredData = data.filter((item) => item.service_owner === serviceOwner);
    return [...new Set(filteredData.map((item) => item[key]))];
  };

  const serviceNames = getUniqueValues('serviceName');
  const territories = getUniqueValues('territory');
  const operators = getUniqueValues('operatorname');
  const partnerNames = getUniqueValues('partnerName');

  const applyFilters = () => {
    if (new Date(dateRange.from) > new Date(dateRange.to)) {
      alert('The "from" date cannot be later than the "to" date.');
      return;
    }

    setFilters({
      serviceOwner,
      dateRange,
      serviceName,
      territory,
      operator,
      partnerName,
    });
  };
  const clearFilters = () => {
    setServiceOwner('');
    setDateRange({ from: '', to: '' });
    setServiceName('');
    setTerritory('');
    setOperator('');
    setPartnerName('');

    // Clear filters in the parent component as well
    setFilters({
      serviceOwner: '',
      dateRange: { from: '', to: '' },
      serviceName: '',
      territory: '',
      operator: '',
      partnerName: '',
    });
  };

  return (
    <>
      <div className="filter-obj">
        <div className="filter-container">
          {/* Service Owner Dropdown */}
          <div className="service-owner">
            <label>Service Owner*</label>
            <select value={serviceOwner} onChange={(e) => setServiceOwner(e.target.value)}>
              <option value="">Select Service Owner</option>
              {serviceOwners.map((owner, idx) => (
                <option key={idx} value={owner}>
                  {owner}
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

          {/* Territory Dropdown */}
          <div className='terr' >
            <label>Territory</label>
            <select  value={territory} onChange={(e) => setTerritory(e.target.value)}>
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

          {/* Partner Name Dropdown */}
          <div className='partner'>
            <label>Partner Name</label>
            <select value={partnerName} onChange={(e) => setPartnerName(e.target.value)}>
              <option value="">Select Partner Name</option>
              {partnerNames.map((partner, idx) => (
                <option key={idx} value={partner}>
                  {partner}
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
    </>
  );
};

export default Filterdata;
