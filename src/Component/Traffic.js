import React, { useMemo, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'; // Import PropTypes
import debounce from 'lodash.debounce';
import '../css/Table.css'; // assuming the CSS is linked here
import ServiceOwner from './Service_owner';

const TrafficDataComponent = ({ data, filters, onClearFilters, onExport }) => {
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Function to calculate CR%
  const calculateCR = useMemo(() => (pinVerSucCount, pinGenSucCount) => {
    if (pinGenSucCount === 0) return '0%';
    return `${((pinVerSucCount / pinGenSucCount) * 100).toFixed(0)}%`;
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1); // Subtract one day
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Use useEffect to simulate data loading
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate loading delay, replace with actual API call if necessary
        const timer = setTimeout(() => {
          setLoading(false);
        }, 1000); // 1 second delay for demonstration
        return () => clearTimeout(timer);
      } catch (err) {
        setError("Error loading data."); // Handle error
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(item => {
      return (
        (!filters.partnerName || item.partnerName === filters.partnerName) &&
        (!filters.dateRange.from || new Date(item.timestamp) >= new Date(filters.dateRange.from)) &&
        (!filters.dateRange.to || new Date(item.timestamp) <= new Date(filters.dateRange.to)) &&
        (!filters.serviceName || item.serviceName === filters.serviceName) &&
        (!filters.territory || item.territory === filters.territory) &&
        (!filters.operator || item.operatorName === filters.operator)
      );
    });
  }, [data, filters]);

  // Memoized grouped data
  const groupedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return {};
    return filteredData.reduce((acc, item) => {
      const dateOnly = item.timestamp.split(' ')[0];
      if (!acc[dateOnly]) {
        acc[dateOnly] = {};
      }
      if (!acc[dateOnly][item.appServiceId]) {
        acc[dateOnly][item.appServiceId] = [];
      }
      acc[dateOnly][item.appServiceId].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  const hours = Array.from({ length: 24 }, (_, i) => `${i + 1}`);

  // Check if filters are applied
  const areFiltersApplied = filters && (
    filters.dateRange.from || filters.serviceName ||
    filters.territory || filters.operator || filters.partnerName
  );

  // If no filters are applied, display a message
  if (!areFiltersApplied) {
    return <p>Please apply filters to see the data.</p>;
  }

  // Show loading indicator if data is being loaded
  if (loading) {
    return <div className="loading-spinner">Loading data...</div>;
  }

  // Show error message if there's an error
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="table-container">
      <div className="filters-display">
        <ul>
          <li>Date Range: {filters.dateRange.from} - {filters.dateRange.to}</li>
          <li>Service Name: {filters.serviceName || 'All'}</li>
          <li>Territory: {filters.territory || 'All'}</li>
          <li>Operator: {filters.operatorname || 'All'}</li>
          <li>Partner Name: {filters.partnerName || 'All'}</li>
        </ul>

        <div className="actions">
          <button className="export-btn" onClick={onExport}>
            <FontAwesomeIcon icon={faFileExport} /> Export
          </button>
        </div>
      </div>

      <table className="styled-table">
        <thead>
          {Object.keys(groupedData).map((date) => (
            Object.keys(groupedData[date]).map((serviceId) => {
              const flattenedData = groupedData[date][serviceId];
              const { serviceName, territory, operatorname, partnerName,serviceOwner } = flattenedData[0] || {};

              return (
                <React.Fragment key={`${date}-${serviceId}`}>
                  <tr className='head'>
                    <th className='content-head' colSpan={hours.length + 2}>
                    | Traffic Partner Name: {partnerName || 'N/A'}|  Service ID: {serviceId} | Service Name: {serviceName || 'N/A'} | Territory: {territory || 'N/A'} | Operator: {operatorname || 'N/A'} | Service Owner:{serviceOwner || 'N/A'}
                    </th>
                  </tr>

                  <tr className="header-row">
                    <th>{formatDate(date)}</th>
                    <th>Total CR</th>
                    {hours.map((hour, hourIdx) => (
                      <th key={hourIdx}>{hour}</th>
                    ))}
                  </tr>

                  <tr className="cr-row">
                    <td>CR%</td>
                    <td>{calculateCR(
                      flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0),
                      flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)
                    )}</td>
                    {hours.map((hour) => {
                      const item = flattenedData.find((d) => `${d.hrs + 1}` === hour);
                      return (
                        <td key={hour}>
                          {item ? calculateCR(item.pinVerSucCount, item.pinGenSucCount) : 'NA'}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td>Pin Gen</td>
                    <td>{flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)}</td>
                    {hours.map((hour) => {
                      const item = flattenedData.find((d) => String(d.hrs + 1) === hour);
                      return <td key={hour}>{item ? item.pinGenSucCount : 0}</td>;
                    })}
                  </tr>

                  <tr className="last-row">
                    <td>Pin Ver</td>
                    <td>{flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0)}</td>
                    {hours.map((hour) => {
                      const item = flattenedData.find((d) => `${d.hrs + 1}` === hour);
                      return <td key={hour}>{item ? item.pinVerSucCount : 0}</td>;
                    })}
                  </tr>

                  <tr className="gap-row">
                    <td colSpan={2}></td>
                    <td colSpan={hours.length}></td>
                  </tr>
                </React.Fragment>
              );
            })
          ))}
        </thead>
      </table>
    </div>
  );
};



export default TrafficDataComponent;
