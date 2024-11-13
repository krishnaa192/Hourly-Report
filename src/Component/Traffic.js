import React, { useMemo, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import ThreeGraphModal from './threeGraphData';
import '../css/Table.css'; // assuming the CSS is linked here
import * as XLSX from 'xlsx';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import Nofilter from './Nofilter';
import  LinearProgressWithLabel from './Loader'


const TrafficDataComponent = ({ data, filters, onClearFilters, onExport }) => {
  const [loading, setLoading] = useState(false); 
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedServiceID, setSelectedServiceID] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [graphData, setGraphData] = useState(null); 
  const [error, setError] = useState(null); 

  const openModal = (serviceID, date, data) => {
    setSelectedServiceID(serviceID);
    setSelectedDate(date);
    setGraphData(data || []);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setGraphData(null);
  };

  const calculateCR = useMemo(() => (pinVerSucCount, pinGenSucCount) => {
    if (pinGenSucCount === 0) return '0%';
    const cr = (pinVerSucCount / pinGenSucCount) * 100;
    return `${Math.min(cr, 100).toFixed(0)}%`;
  }, []);
  

  const getCRColor = (crPercentage) => {
    const crValue = parseFloat(crPercentage);
    if (crValue <= 25) return 'red';
    if (crValue <= 50) return 'orange';
    return 'green';
  };


const handleExport = (date) => {
  const exportData = groupedData[date];
  if (!exportData) return;

  // Prepare data for the worksheet
  const sheetData = [];
  Object.keys(exportData).forEach((serviceId) => {
      const flattenedData = exportData[serviceId];

      // Add service details to sheetData
      sheetData.push(['Service ID', serviceId]);
      sheetData.push(['Date', flattenedData[0].actDate]);
      sheetData.push(['Service Name', flattenedData[0]?.serviceName || 'N/A']);
      sheetData.push(['Territory', flattenedData[0]?.territory || 'N/A']);
      sheetData.push(['Operator', flattenedData[0]?.operatorname || 'N/A']);
      sheetData.push(['Partner Name', flattenedData[0]?.partnerName || 'N/A']);
      sheetData.push(['Service Owner', flattenedData[0]?.service_owner || 'N/A']);
      sheetData.push([]); // Add a blank row for separation
//hours row
// Hours row: push headers for each hour
sheetData.push(['Hours','CR', ...hours.map(hour => ` ${hour}`)]); 
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
  const partnerName = exportData[Object.keys(exportData)[0]][0]?.partnerName || 'UnknownPartner'; // Get the partner name for export

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Traffic Data');

  // Export the workbook
  XLSX.writeFile(workbook, `${partnerName}_${9}.xlsx`);
};





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
        (!filters.partnerName || item.partnerName === filters.partnerName) &&
        (!filters.dateRange.from || new Date(item.actDate) >= new Date(filters.dateRange.from)) &&
        (!filters.dateRange.to || new Date(item.actDate) <= new Date(filters.dateRange.to)) &&
        (!filters.serviceName || item.serviceName === filters.serviceName) &&
        (!filters.territory || item.territory === filters.territory) &&
        (!filters.operator || item.operatorname === filters.operator)
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

  const hours = Array.from({ length: 24 }, (_, i) => `${i}`);

  const areFiltersApplied = filters && (
    filters.dateRange.from || filters.serviceName ||
    filters.territory || filters.operatorname || filters.partnerName
  );

  if (!areFiltersApplied) {
    return <p>
      <Nofilter/>

    </p>;
  }

  if (loading) {
    return <LinearProgressWithLabel/>;
  }

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
      </div>
      {Object.keys(groupedData).length === 0 ? (
  <p>No data available for the selected filters.</p>
) : (
  Object.keys(groupedData).map((date) => {
    // Extract the first service's data to get the common actDate
    const serviceIds = Object.keys(groupedData[date]);
    const firstServiceId = serviceIds[0];
    const firstFlattenedData = groupedData[date][firstServiceId];
    const actDate = firstFlattenedData[0]?.actDate || 'N/A'; 

    return (
      <div key={date} className="date-section">
        <div className="section-header">
          <span>{actDate}</span> {/* Display actDate once */}
          <button className="export-btn" onClick={() => handleExport(date)}>
            <FontAwesomeIcon icon={faFileExport} /> Export
          </button>
        </div>

        <table className="styled-table">
          <thead>
            {serviceIds.map((serviceId) => {
              const flattenedData = groupedData[date][serviceId];
              const { serviceName, territory, operatorname, partnerName, service_owner } = flattenedData[0] || {};

              return (
                <React.Fragment key={`${date}-${serviceId}`}>
                  <tr className='head'>
                    <th className='content-head' colSpan={hours.length + 2}>
                      Service ID: {serviceId} | Service Name: {serviceName || 'N/A'} | Territory: {territory || 'N/A'} | Operator: {operatorname || 'N/A'} | Partner Name: {partnerName || 'N/A'} | Service Owner: {service_owner || 'N/A'} |  
                      <button onClick={() => openModal(serviceId, date, flattenedData)}>
                        <FontAwesomeIcon icon={faChartBar} />
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

                <tr className="cr-row">
  <td>CR%</td>
  <td style={{ color: getCRColor(parseFloat(calculateCR(
    flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0),
    flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)
  ).replace('%', ''))) }}>
    {calculateCR(
      flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0),
      flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)
    )}
  </td>
  {hours.map((hour) => {
    const item = flattenedData.find((d) => String(d.hrs) === hour);
    const crValue = item ? parseFloat(calculateCR(item.pinVerSucCount, item.pinGenSucCount).replace('%', '')) : null;
    return (
      <td key={hour} style={{ color: crValue !== null ? getCRColor(crValue) : 'black' }}>
        {crValue !== null ? `${crValue}%` : 'NA'}
      </td>
    );
  })}
</tr>

                  <tr>
                    <td>Pin Gen</td>
                    <td>{flattenedData.reduce((sum, item) => sum + item.pinGenSucCount, 0)}</td>
                    {hours.map((hour) => {
                      const item = flattenedData.find((d) => String(d.hrs ) === hour);
                      return <td key={hour}>{item ? item.pinGenSucCount : 0}</td>;
                    })}
                  </tr>

                  <tr className="last-row">
                    <td>Pin Ver</td>
                    <td>{flattenedData.reduce((sum, item) => sum + item.pinVerSucCount, 0)}</td>
                    {hours.map((hour) => {
                      const item = flattenedData.find((d) => `${d.hrs }` === hour);
                      return <td key={hour}>{item ? item.pinVerSucCount : 0}</td>;
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </thead>
        </table>
      </div>
    );
  })
)}

     
<ThreeGraphModal 
        serviceID={selectedServiceID} 
        selectedDate={selectedDate} 
        initialData={graphData}  
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        
      />
      
    </div>
  );
};

export default TrafficDataComponent;
