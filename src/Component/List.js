import React, { useEffect, useState } from 'react';
import Filterdata from './Filter'; 
import TableComponent from './Table'; 

const Hourlydata = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    serviceOwner: '',
    dateRange: { from: '', to: '' },
    serviceName: '',
    territory: '',
    operator: '',
    partnerName: '',
  });

  useEffect(() => {
    // Fetch data from API
    fetch('https://wap.matrixads.in/mglobopay/getHourlyInappReport')
      .then((response) => response.json())
      .then((result) => {
        setData(result); // Assuming result is an array
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  // Apply filters logic
  const applyFilters = () => {
    let filtered = data || [];

    // ... your existing filter logic ...

    setFilteredData(filtered);
  };

  // Helper function to extract unique values for dropdowns
  const getUniqueValues = (key) => {
    return [...new Set(data.map((item) => item[key]))];
  };

  const serviceOwners = getUniqueValues('service_owner');
  const serviceNames = getUniqueValues('serviceName');
  const territories = getUniqueValues('territory');
  const operators = getUniqueValues('operatorname');
  const partnerNames = getUniqueValues('partnerName');

  return (
    <div>
      <h2>Hourly Data</h2>
      <Filterdata
        setFilters={setFilters}
        serviceOwners={serviceOwners}
        serviceNames={serviceNames}
        territories={territories}
        operators={operators}
        partnerNames={partnerNames}
      />
      <TableComponent data={filteredData} filters={filters} /> {/* Ensure filters are passed */}
    </div>
  );
};

export default Hourlydata;
