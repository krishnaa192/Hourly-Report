import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import LinearChart from './Single'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const GraphModal = ({ serviceID, selectedDate, isOpen, onRequestClose, initialData }) => {
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

        // Process the result
        result.forEach((item) => {
          if (!item || !item.appServiceId || !item.actDate) {
            console.warn('Skipping invalid item:', item); // Skip any invalid data
            return;
          }

          const serviceId = item.appServiceId.toString(); // Ensure it's a string
          const date = new Date(item.actDate);
         
          const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

          // Initialize the service ID in the accumulator if it doesn't exist
          if (!acc[serviceId]) {
            acc[serviceId] = {};
          }

          // Initialize the date in the accumulator for this service ID if it doesn't exist
          if (!acc[serviceId][formattedDate]) {
            acc[serviceId][formattedDate] = { hours: [] }; // Initialize hours as an empty array
          }

          // Calculate CR
          const cr = item.pinGenSucCount > 0 ? ((item.pinVerSucCount / item.pinGenSucCount) * 100).toFixed(2) : "0.00";
 ; // Calculate CR

          // Add hours data for the service ID and date with CR, pinGenSucCount, and pinVerSucCount
          acc[serviceId][formattedDate].hours.push({
            hour: item.hrs,
            cr: cr, // Store CR directly
            pinGenSucCount: item.pinGenSucCount, // Store pinGenSucCount
            pinVerSucCount: item.pinVerSucCount, // Store pinVerSucCount
            date: formattedDate, // Store the formatted date
          });
        });
        // Filter data based on the selected serviceID and formatted selectedDate
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setDate(selectedDateObj.getDate()); // Subtract one day
        const formattedSelectedDate = `${String(selectedDateObj.getDate()).padStart(2, '0')}-${String(selectedDateObj.getMonth() + 1).padStart(2, '0')}-${selectedDateObj.getFullYear()}`;

        const filteredData = acc[serviceID] ? acc[serviceID][formattedSelectedDate]?.hours || [] : [];

        // Sort the filtered data based on hour
        const sortedData = filteredData.sort((a, b) => a.hour - b.hour);

        // Log the filtered and sorted data for debugging
    

        setData(sortedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    // Fetch the data only if the modal is open
    if (isOpen) {
      fetchData();
    }
  }, [serviceID, selectedDate, isOpen, initialData]);

  // Error state
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      {loading ? (
        <div>
          <p>Loading...</p>
          <button onClick={onRequestClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ) : (
        <>
          <button onClick={onRequestClose} className='cancel'>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2>Service ID: {serviceID}</h2>  
          <h3>Date: {data.length > 0 ? data[0].date : ''}</h3> {/* Display actDate from data */}
          {data.length > 0 ? (
            <LinearChart
              data={data}
              title={`Graph for Service ID ${serviceID} on ${data[0].date}`}
            />
          ) : (
            <p>No data available for the selected service ID and date.</p>
          )}
        </>
      )}
    </Modal>
  );
  
};

export default GraphModal;
