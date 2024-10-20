import React, { useMemo, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import '../css/Table.css'; // assuming the CSS is linked here
import GraphModal from './GraphData'; // Import your GraphModal
import * as XLSX from 'xlsx';
import Nofilter from './Nofilter';

const ServiceOwner = ({ data, filters, onClearFilters, onExport }) => {
  const [loading, setLoading] = useState(false); 
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedServiceID, setSelectedServiceID] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(null); 
  const [graphData, setGraphData] = useState(null); 

  const openModal = (serviceID, date, data) => {
    setSelectedServiceID(serviceID);
    setSelectedDate(date);
    setGraphData(data);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setGraphData(null);
  };

  // CR% Calculation
  const calculateCR = useMemo(() => (pinVerSucCount, pinGenSucCount) => {
    if (pinGenSucCount === 0) return '0%';
    return `${((pinVerSucCount / pinGenSucCount) * 100).toFixed(0)}%`;
  }, []);

  // Date Formatter
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1); // Subtract one day
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Loading Simulation
  useEffect(() => {
    if (filters) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); // 1 second delay for demonstration
      return () => clearTimeout(timer);
    }
  }, [filters]);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(item => {
      return (
        (!filters.serviceOwner || item.service_owner === filters.serviceOwner) &&
        (!filters.dateRange.from || new Date(item.timestamp) >= new Date(filters.dateRange.from)) &&
        (!filters.dateRange.to || new Date(item.timestamp) <= new Date(filters.dateRange.to)) &&
        (!filters.serviceName || item.serviceName === filters.serviceName) &&
        (!filters.territory || item.territory === filters.territory) &&
        (!filters.operator || item.operatorname === filters.operator) &&
        (!filters.partnerName || item.partnerName === filters.partnerName)
      );
    });
  }, [data, filters]);

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

  if (!filters.serviceOwner) {
    return <Nofilter/>;
  }

  if (loading) {
    return <div className="loading-spinner">Loading data...</div>;
  }
  const handleExport = (date) => {
    const exportData = groupedData[date];
    if (!exportData) return;
  
    // Prepare data for the worksheet
    const sheetData = [];
    Object.keys(exportData).forEach((serviceId) => {
      const flattenedData = exportData[serviceId];
  
      // Add service details to sheetData
      sheetData.push(['Service ID', serviceId]);
      sheetData.push(['Date', formatDate(date)]);
      sheetData.push(['Service Name', flattenedData[0]?.serviceName || 'N/A']);
      sheetData.push(['Territory', flattenedData[0]?.territory || 'N/A']);
      sheetData.push(['Operator', flattenedData[0]?.operatorname || 'N/A']);
      sheetData.push(['Partner Name', flattenedData[0]?.partnerName || 'N/A']);
      sheetData.push(['Service Owner', flattenedData[0]?.service_owner || 'N/A']);
      sheetData.push([]); // Add a blank row for separation
  
      // Hours row: push headers for each hour
      sheetData.push(['Hours', ...hours.map(hour => ` ${hour}`)]); // Assuming `hours` is an array of hour numbers
  
      // CR Row
      const crRow = ['CR%'];
      crRow.push(calculateCR(
        flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0),
        flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)
      ));
  
      // Iterate over hours
      hours.forEach((hour) => {
        const item = flattenedData.find((d) => `${d.hrs + 1}` === hour);
        crRow.push(item ? calculateCR(item.pinVerSucCount, item.pinGenSucCount) : 'NA');
      });
      sheetData.push(crRow);
  
      // Pin Gen Row
      const pinGenRow = ['Pin Gen'];
      pinGenRow.push(flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0));
      hours.forEach((hour) => {
        const item = flattenedData.find((d) => `${d.hrs + 1}` === hour);
        pinGenRow.push(item ? item.pinGenSucCount : 0);
      });
      sheetData.push(pinGenRow);
  
      // Pin Ver Row
      const pinVerRow = ['Pin Ver'];
      pinVerRow.push(flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0));
      hours.forEach((hour) => {
        const item = flattenedData.find((d) => `${d.hrs + 1}` === hour);
        pinVerRow.push(item ? item.pinVerSucCount : 0);
      });
      sheetData.push(pinVerRow);
  
      sheetData.push([]); // Add another blank row for separation
    });
  
    // Create a worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
  
    // Get the service owner for export
    const serviceOwner = exportData[Object.keys(exportData)[0]][0]?.service_owner || 'UnknownOwner';
  
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Traffic Data');
  
    // Export the workbook
    XLSX.writeFile(workbook, `${serviceOwner}_${formatDate(date)}.xlsx`);
  };
  
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
      </div>

      {Object.keys(groupedData).map((date) => (
        <div key={date} className="date-section">
          <div className="section-header">
            <span>{formatDate(date)}</span>
            <button className="export-btn" onClick={() => handleExport(date)}>
                <FontAwesomeIcon icon={faFileExport} /> Export
              </button>
          </div>

          <table className="styled-table">
            <thead>
              {Object.keys(groupedData[date]).map((serviceId) => {
                const flattenedData = groupedData[date][serviceId];
                const { serviceName, territory, operatorname, partnerName, service_owner } = flattenedData[0] || {};

                return (
                  <React.Fragment key={`${date}-${serviceId}`}>
                    <tr className='head'>
                      <th className='content-head' colSpan={hours.length + 2}>
                        Service ID: {serviceId} | Service Name: {serviceName || 'N/A'} | Territory: {territory || 'N/A'} | Operator: {operatorname || 'N/A'} | Partner Name: {partnerName || 'N/A'} | Service Owner: {service_owner || 'N/A'} |  <button onClick={() => openModal(serviceId, date, flattenedData)}>Open Graph Modal</button>
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
              })}
            </thead>
          </table>
        </div>
      ))}
      {/* Render the modal */}
      <GraphModal 
        serviceID={selectedServiceID} 
        selectedDate={selectedDate} 
        initialData={graphData} 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        
      />
    </div>
  );
};

export default ServiceOwner;
