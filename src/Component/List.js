import React, { useEffect, useState } from 'react';
import Filterdata from './Filter';
import TableComponent from './Table';

const Hourlydata = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  console.log(data);

  // Apply filters logic
  const applyFilters = () => {
    let filtered = data || [];

    // Filter by Service Owner
    if (filters.serviceOwner) {
      filtered = filtered.filter((item) => item.service_owner === filters.serviceOwner);
    }

    // Filter by Date Range
    if (filters.dateRange.from && filters.dateRange.to) {
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.timestamp.split(' ')[0]);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }

    // Filter by Service Name
    if (filters.serviceName) {
      filtered = filtered.filter((item) => item.serviceName === filters.serviceName);
    }

    // Filter by Territory
    if (filters.territory) {
      filtered = filtered.filter((item) => item.territory === filters.territory);
    }

    // Filter by Operator
    if (filters.operator) {
      filtered = filtered.filter((item) => item.operatorname === filters.operator);
    }

    // Filter by Partner Name
    if (filters.partnerName) {
      filtered = filtered.filter((item) => item.partnerName === filters.partnerName);
    }

    setFilteredData(filtered);
  };

  // Helper function to extract unique values for dropdowns based on current filters
  const getUniqueValues = (key) => {
    let filteredForOptions = data;

    // If serviceOwner is selected, filter options based on serviceOwner
    if (filters.serviceOwner) {
      filteredForOptions = data.filter((item) => item.service_owner === filters.serviceOwner);
    }

    return [...new Set(filteredForOptions.map((item) => item[key]))];
  };

  const serviceOwners = getUniqueValues('service_owner');
  const serviceNames = getUniqueValues('serviceName');
  const territories = getUniqueValues('territory');
  const operators = getUniqueValues('operatorname');
  const partnerNames = getUniqueValues('partnerName');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
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
