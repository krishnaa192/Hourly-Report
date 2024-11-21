import React, { useState,useEffect } from 'react';
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
  const [dateError, setDateError] = useState(''); 

  useEffect(() => {
    const savedServiceOwner = localStorage.getItem('serviceOwner');
  const savedPartnerName = localStorage.getItem('partnerName');
  const savedTerritory = localStorage.getItem('territory');
  const savedServiceName = localStorage.getItem('serviceName');
  const savedOperator = localStorage.getItem('operator');
  const savedDateRange = JSON.parse(localStorage.getItem('dateRange'));

  if (savedServiceOwner) setServiceOwner(savedServiceOwner);
  if (savedPartnerName) setPartnerName(savedPartnerName);
  if (savedTerritory) setTerritory(savedTerritory);
  if (savedServiceName) setServiceName(savedServiceName);
  if (savedOperator) setOperator(savedOperator);
  if (savedDateRange) setDateRange(savedDateRange);
  }, []);

  // Extract unique values for dropdowns based on selected service owner
  const getUniqueValues = (key, uppercase = false) => {
    if (!data) return []; // Return an empty array if data is undefined
  
    // Filter data based on serviceOwner, if it's provided
    const filteredData = serviceOwner
      ? data.filter((item) => item.service_owner === serviceOwner)
      : data;
  
    // Normalize to uppercase before creating a set to avoid case-sensitive duplicates
    let uniqueValues = [...new Set(filteredData.map((item) =>
      uppercase ? item[key].toUpperCase() : item[key]
    ))];
  
    // Return the final array, ensuring all values are uppercase if needed
    return uppercase ? uniqueValues.map(value => value.toUpperCase()) : uniqueValues;
  };
  
  const serviceNames = getUniqueValues('serviceName');
  const territories = getUniqueValues('territory',true);
  const operators = getUniqueValues('operatorname',true);
  const partnerNames = getUniqueValues('partnerName');

  const applyFilters = () => {
    if (!dateRange.from || !dateRange.to) {
      setDateError('Dates are required.');
      return;
    }
  
    if (new Date(dateRange.to) >  new Date() ||  new Date(dateRange.from) > new Date()) {
      setDateError('Invalid date selection');
      return;
    }
    // Clear the error message
    setDateError('');
    // Save selected values to localStorage
    localStorage.setItem('partnerName', partnerName);
    localStorage.setItem('territory', territory);
    localStorage.setItem('serviceName', serviceName);
    localStorage.setItem('operator', operator);
    localStorage.setItem('serviceOwner', serviceOwner);
    localStorage.setItem('dateRange', JSON.stringify(dateRange));
    // Apply the filters
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

    // Clear the error message
    setDateError('');
    localStorage.removeItem('partnerName');
    localStorage.removeItem('territory');
    localStorage.removeItem('serviceName');
    localStorage.removeItem('operator');
    localStorage.removeItem('dateRange');
    localStorage.removeItem('serviceOwner')
  };

  return (
    <>
      <div className="filter-obj">
        <div className="filter-container">
          {/* Service Owner Dropdown */}
          <div className="service-owner">
          <label>Service Owner*</label>
          <select value={serviceOwner} onChange={(e) => setServiceOwner(e.target.value)}>
            {serviceOwner === '' ? (
              // If no partner is selected, show the placeholder text
              <option value="">Select Service Owner</option>
            ) : null}
            {serviceOwner === '' && serviceOwners.map((owner, idx) => (
              <option key={idx} value={owner}>
                {owner}
              </option>
            ))}
            {serviceOwner && (
              // If a partner is selected, show only the selected partner
              <option value={serviceOwner}>{serviceOwner}</option>
            )}
          </select>
        </div>


          {/* Date Range Input */}
          <div className="date">
            <label>Date Range*</label>
            <div className="date-input">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className={dateError ? 'error' : ''}
                required
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className={dateError ? 'error' : ''}
                required
              />
            </div>
            {/* Display red warning message if there's a validation error */}
            {dateError && <p className="error-message">{dateError}</p>}
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
          <div className="terr">
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
          <div className="op">
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
          <div className="partner">
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
