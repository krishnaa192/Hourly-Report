import React, { useState } from 'react';
import  {DateRangePicker} from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file
import '../css/Table.css';  // Custom CSS file
import '../css/filter.css'; // Custom filter CSS file

const Filterdata = ({ setFilters, serviceOwners, serviceNames, territories, operators, partnerNames, data }) => {
  const [serviceOwner, setServiceOwner] = useState('');
  const [filteredServiceNames, setFilteredServiceNames] = useState([]);
  const [filteredTerritories, setFilteredTerritories] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [filteredPartnerNames, setFilteredPartnerNames] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [territory, setTerritory] = useState('');
  const [operator, setOperator] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Filter the other dropdowns based on selected service owner
  const handleServiceOwnerChange = (owner) => {
    setServiceOwner(owner);

    // Filter data based on the selected service owner
    const filteredData = data.filter(item => item.serviceOwner === owner);

    // Set the filtered values for each dropdown
    setFilteredServiceNames([...new Set(filteredData.map(item => item.serviceName))]);
    setFilteredTerritories([...new Set(filteredData.map(item => item.territory))]);
    setFilteredOperators([...new Set(filteredData.map(item => item.operator))]);
    setFilteredPartnerNames([...new Set(filteredData.map(item => item.partnerName))]);

    // Reset the other selected values
    setServiceName('');
    setTerritory('');
    setOperator('');
    setPartnerName('');
  };

  const applyFilters = () => {
    setFilters({
      serviceOwner,
      dateRange,
      serviceName,
      territory,
      operator,
      partnerName,
    });
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);

    setFilters((prevFilters) => ({
      ...prevFilters,
      dateRange: {
        from: startDate,
        to: endDate
      }
    }));
  };

  return (
    <div className="filter-main">
      <div className='filter-container'>
        
        {/* Service Owner Dropdown */}
        <div className='input'>
          <label>Service Owner</label>
          <select value={serviceOwner} onChange={(e) => handleServiceOwnerChange(e.target.value)}>
            <option value="">Select Service Owner</option>
            {serviceOwners.map((owner, idx) => (
              <option key={idx} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Picker */}
        <div className='input'>
          <label>Date Range</label>
          <DateRangePicker
            ranges={dateRange}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            showSelectionPreview={true}
            rangeColors={['#3b5998']} // Customize color
            direction="horizontal"  // Show horizontal view for start and end date
          />
        </div>

        {/* Service Name Dropdown */}
        <div className='input'>
          <label>Service Name</label>
          <select value={serviceName} onChange={(e) => setServiceName(e.target.value)} disabled={!serviceOwner}>
            <option value="">Select Service Name</option>
            {filteredServiceNames.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Territory Dropdown */}
        <div className='input'>
          <label>Territory</label>
          <select value={territory} onChange={(e) => setTerritory(e.target.value)} disabled={!serviceOwner}>
            <option value="">Select Territory</option>
            {filteredTerritories.map((territory, idx) => (
              <option key={idx} value={territory}>
                {territory}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Dropdown */}
        <div className='input'>
          <label>Operator</label>
          <select value={operator} onChange={(e) => setOperator(e.target.value)} disabled={!serviceOwner}>
            <option value="">Select Operator</option>
            {filteredOperators.map((operator, idx) => (
              <option key={idx} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>

        {/* Partner Name Dropdown */}
        <div className='input'>
          <label>Partner Name</label>
          <select value={partnerName} onChange={(e) => setPartnerName(e.target.value)} disabled={!serviceOwner}>
            <option value="">Select Partner Name</option>
            {filteredPartnerNames.map((partner, idx) => (
              <option key={idx} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="filter-btn" onClick={applyFilters}>Apply Filters</button>
    </div>
  );
};

export default Filterdata;
