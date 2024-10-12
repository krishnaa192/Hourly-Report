import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons'; // Importing icons
import '../css/Table.css'; // assuming the CSS is linked here

const TableComponent = ({ data, filters, onClearFilters, onExport }) => {
  // Function to calculate CR%
  const calculateCR = (pinVerSucCount, pinGenSucCount) => {
    if (pinGenSucCount === 0) return '0%';
    return `${((pinVerSucCount / pinGenSucCount) * 100).toFixed(0)}%`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Memoizing grouped data
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return {};

    return data.reduce((acc, item) => {
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
  }, [data]);

  const hours = Array.from({ length: 24 }, (_, i) => `${i + 1}`);

  // Check if filters are applied
  const areFiltersApplied = filters && (
    filters.serviceOwner || filters.dateRange.from || filters.serviceName || 
    filters.territory || filters.operator || filters.partnerName
  );

  // If no filters are applied, display a message
  if (!areFiltersApplied) {
    return <p>Please apply filters to see the data.</p>;
  }

  return (
    <div className="table-container">
      <div className="filters-display">
   
        <ul>
          <li>Service Owner: {filters.serviceOwner || 'All'}</li>
          <li>Date Range: {filters.dateRange.from} - {filters.dateRange.to}</li>
          <li>Service Name: {filters.serviceName || 'All'}</li>
          <li>Territory: {filters.territory || 'All'}</li>
          <li>Operator: {filters.operator || 'All'}</li>
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

              // Extract details from the first item in the flattenedData array
              const { serviceName, territory, operatorname, partnerName, service_owner } = flattenedData[0] || {};

              return (
                <React.Fragment key={`${date}-${serviceId}`}>
                  <tr className='head'>
                    <th className='content-head' colSpan={hours.length + 2}>
                      Service ID: {serviceId} | Service Name: {serviceName || 'N/A'} | Territory: {territory || 'N/A'} | Operator: {operatorname || 'N/A'} | Partner Name: {partnerName || 'N/A'} | Service Owner: {service_owner || 'N/A'}
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

export default TableComponent;
