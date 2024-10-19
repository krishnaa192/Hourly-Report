import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ThreeLinearChart from './TrafficGraph' // Assuming your D3 chart is in this file

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

        // Check if initialData is an array, otherwise set an empty array as fallback
        const result = Array.isArray(initialData) ? initialData : [];

        // Log the initialData and result for debugging
        console.log('Initial Data:', initialData);
        console.log('Processed Result:', result);

        // Initialize accumulator for grouping data
        const acc = {};

        // Process the result
        result.forEach((item) => {
          if (!item || !item.appServiceId || !item.timestamp) {
            console.warn('Skipping invalid item:', item); // Skip any invalid data
            return;
          }

          const serviceId = item.appServiceId.toString(); // Ensure it's a string
          const date = formatDate(item.timestamp); // Use custom date formatting

          // Initialize the service ID in the accumulator if it doesn't exist
          if (!acc[serviceId]) {
            acc[serviceId] = {};
          }

          // Initialize the date in the accumulator for this service ID if it doesn't exist
          if (!acc[serviceId][date]) {
            acc[serviceId][date] = { hours: [] }; // Initialize hours as an empty array
          }

          // Calculate CR
          const cr = item.pinGenSucCount > 0 ? (item.pinVerSucCount / item.pinGenSucCount) * 100 : 0; // Calculate CR

          // Add hours data for the service ID and date with CR, pinGenSucCount, and pinVerSucCount
          acc[serviceId][date].hours.push({
            hour: item.hrs,
            cr: cr, // Store CR directly
            pinGenSucCount: item.pinGenSucCount, // Store pinGenSucCount
            pinVerSucCount: item.pinVerSucCount, // Store pinVerSucCount
            date: date, // Store the date as well
          });
        });

        // Log the processed data for debugging
        console.log('Processed Data:', acc);

        // Filter data based on the selected serviceID and formatted selectedDate
        const formattedSelectedDate = formatDate(selectedDate);
        const filteredData = acc[serviceID] ? acc[serviceID][formattedSelectedDate]?.hours || [] : [];

        // Sort the filtered data based on hour
        const sortedData = filteredData.sort((a, b) => a.hour - b.hour);

        // Log the filtered and sorted data for debugging
        console.log('Sorted Filtered Data:', sortedData);

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
      {/* Loading state */}
      {loading ? (
        <div>
          <p>Loading...</p>
          <button onClick={onRequestClose}>Cancel</button>
        </div>
      ) : (
        <>
          <h2>Service ID: {serviceID}</h2>
          <h3>Date: {formatDate(selectedDate)}</h3>
          {data.length > 0 ? (
            <ThreeLinearChart
              data={data}
              title={`Graph for Service ID ${serviceID} on ${formatDate(selectedDate)}`}
            />
          ) : (
            <p>No data available for the selected service ID and date.</p>
          )}
          <button onClick={onRequestClose}>Close</button>
        </>
      )}
    </Modal>
  );
};

export default ThreeDataGraph;
