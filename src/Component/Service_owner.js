import React, { useMemo, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
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
      const itemDate = new Date(item.actDate);
      const dateFrom = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
      const dateTo = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
  
      return (
        (!filters.serviceOwner || item.service_owner === filters.serviceOwner) &&
        (!dateFrom || itemDate >= dateFrom) &&
        (!dateTo || itemDate <= dateTo) &&  // Make sure to check if `itemDate` falls on or before `dateTo`
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
      let dateOnly = item.actDate; // Get the original date
      
      // Increment the date by 1 day for correct grouping
      let nextDate = new Date(dateOnly);
      nextDate.setDate(nextDate.getDate() );
      const incrementedDate = nextDate.toISOString().split('T')[0]; // Convert back to 'YYYY-MM-DD' format
  
      if (!acc[incrementedDate]) {
        acc[incrementedDate] = {};
      }
      if (!acc[incrementedDate][item.appServiceId]) {
        acc[incrementedDate][item.appServiceId] = [];
      }
      acc[incrementedDate][item.appServiceId].push(item);
      
      return acc;
    }, {});
  }, [filteredData]);

// The rest of the component remains as it is

  

  const hours = Array.from({ length: 24 }, (_, i) => `${i }`);

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
      sheetData.push(['Date', flattenedData[0]?.actDate || 'N/A']);  // Ensure actDate is correctly handled
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
        const item = flattenedData.find((d) => `${d.hrs }` === hour);
        crRow.push(item ? calculateCR(item.pinVerSucCount, item.pinGenSucCount) : 'NA');
      });
      sheetData.push(crRow);
  
      // Pin Gen Row
      const pinGenRow = ['Pin Gen'];
      pinGenRow.push(flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0));
      hours.forEach((hour) => {
        const item = flattenedData.find((d) => `${d.hrs }` === hour);
        pinGenRow.push(item ? item.pinGenSucCount : 0);
      });
      sheetData.push(pinGenRow);
  
      // Pin Ver Row
      const pinVerRow = ['Pin Ver'];
      pinVerRow.push(flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0));
      hours.forEach((hour) => {
        const item = flattenedData.find((d) => `${d.hrs }` === hour);
        pinVerRow.push(item ? item.pinVerSucCount : 0);
      });
      sheetData.push(pinVerRow);
  
      sheetData.push([]); // Add another blank row for separation
    });
  
    // Create a worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
  
    // Get the service owner and activation date for export
    const serviceOwner = exportData[Object.keys(exportData)[0]][0]?.service_owner || 'UnknownOwner';
    const actDate = exportData[Object.keys(exportData)[0]][0]?.actDate || 'UnknownDate';
  
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Traffic Data');
  
    // Export the workbook with the correct filename
    XLSX.writeFile(workbook, `${serviceOwner}_${actDate}.xlsx`);
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
      {Object.keys(groupedData).map((date) => {
  // Extract the first service's data to get the common actDate
  const serviceIds = Object.keys(groupedData[date]);
  const firstServiceId = serviceIds[0];
  const firstFlattenedData = groupedData[date][firstServiceId];
  const actDate = firstFlattenedData[0]?.actDate || 'N/A'; 

  return (
    <div key={date} className="date-section">
      <div className="section-header">
        <span>{actDate}</span> {/* Display the actDate once */}
        <button className="export-btn" onClick={() => handleExport(date)}>
          <FontAwesomeIcon icon={faFileExport} /> Export
        </button>
      </div>

      {serviceIds.map((serviceId) => {
        const flattenedData = groupedData[date][serviceId];

        return (
          <React.Fragment key={`${date}-${serviceId}`}>
            <table className="styled-table">
              <thead>
                <tr className='head'>
                  <th className='content-head' colSpan={hours.length + 2}>
                    Service ID: {serviceId} | Service Name: {flattenedData[0]?.serviceName || 'N/A'} | Territory: {flattenedData[0]?.territory || 'N/A'} | Operator: {flattenedData[0]?.operatorname || 'N/A'} | Partner Name: {flattenedData[0]?.partnerName || 'N/A'} | Service Owner: {flattenedData[0]?.service_owner || 'N/A'} |
                    <button onClick={() => openModal(serviceId, date, flattenedData)}>
                      <FontAwesomeIcon icon={faChartBar}/>
                    </button>
                  </th>
                </tr>

                <tr className="header-row">
                  <th>{actDate}</th> {/* Display `actDate` in the table */}
                  <th>Total CR</th>
                  {hours.map((hour) => {
                    const nextHour = Number(hour) + 1; // Ensure hour is treated as a number
                    return (
                      <th key={hour}>{`${hour}-${nextHour}`}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="cr-row">
                  <td>CR%</td>
                  <td>{calculateCR(
                    flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0),
                    flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)
                  )}</td>
                  {hours.map((hour) => {
                    const item = flattenedData.find((d) => String(d.hrs) === hour);
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
                    const item = flattenedData.find((d) => String(d.hrs) === hour);
                    return <td key={hour}>{item ? item.pinGenSucCount : 0}</td>;
                  })}
                </tr>

                <tr className="last-row">
                  <td>Pin Ver</td>
                  <td>{flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0)}</td>
                  {hours.map((hour) => {
                    const item = flattenedData.find((d) => String(d.hrs) === hour);
                    return <td key={hour}>{item ? item.pinVerSucCount : 0}</td>;
                  })}
                </tr>

                <tr className="gap-row">
                  <td colSpan={2}></td>
                  <td colSpan={hours.length}></td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
      })}
    </div>
  );
})}



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
