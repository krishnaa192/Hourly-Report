import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ThreeLinearChart from './TrafficGraph'; // Assuming your D3 chart is in this file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Custom date formatting function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1); // Subtract one day
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ThreeDataGraph = ({ serviceID, selectedDate, isOpen, onRequestClose, initialData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = Array.isArray(initialData) ? initialData : [];
        const acc = {};

        result.forEach((item) => {
          if (!item || !item.appServiceId || !item.timestamp) {
            console.warn('Skipping invalid item:', item); 
            return;
          }

          const serviceId = item.appServiceId.toString();
          const date = formatDate(item.timestamp);

          if (!acc[serviceId]) {
            acc[serviceId] = {};
          }

          if (!acc[serviceId][date]) {
            acc[serviceId][date] = { hours: [] };
          }

          const cr = item.pinGenSucCount > 0 ? ((item.pinVerSucCount / item.pinGenSucCount) * 100).toFixed(2) : "0.00";

          acc[serviceId][date].hours.push({
            hour: item.hrs,
            cr: parseFloat(cr),
            pinGenSucCount: item.pinGenSucCount,
            pinVerSucCount: item.pinVerSucCount,
            date: date,
          });
        });

        const formattedSelectedDate = formatDate(selectedDate);
        const filteredData = acc[serviceID] ? acc[serviceID][formattedSelectedDate]?.hours || [] : [];
        const sortedData = filteredData.sort((a, b) => a.hour - b.hour);

        setData(sortedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [serviceID, selectedDate, isOpen, initialData]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      {loading ? (
        <div>
          <p>Loading...</p>
          <button onClick={onRequestClose}>Cancel</button>
        </div>
      ) : (
        <>
          <button onClick={onRequestClose} className='cancel'>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2>Service ID: {serviceID} |   </h2>
          <h3>Date: {formatDate(selectedDate)}</h3>

          {/* Legend */}
          <div className="legend" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '15px', height: '15px', backgroundColor: '#1f77b4', marginRight: '5px' }}></span>
              <span>CR (%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '15px', height: '15px', backgroundColor: '#ff7f0e', marginRight: '5px' }}></span>
              <span>PinGenSucCount</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '15px', height: '15px', backgroundColor: '#2ca02c', marginRight: '5px' }}></span>
              <span>PinVerSucCount</span>
            </div>
          </div>

          {data.length > 0 ? (
            <ThreeLinearChart
              data={data}
              title={`Graph for Service ID ${serviceID} on ${formatDate(selectedDate)}`}
            />
          ) : (
            <p>No data available for the selected service ID and date.</p>
          )}
        </>
      )}
    </Modal>
  );
};

export default ThreeDataGraph;
