import React, { useMemo } from 'react';
import '../css/Table.css';

const TableComponent = ({ data, filters }) => {



  // Function to calculate CR%
  const calculateCR = (pinVerSucCount, pinGenSucCount) => {
    if (pinGenSucCount === 0) return '0%';
    return `${((pinVerSucCount / pinGenSucCount) * 100).toFixed(0)}%`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const groupedData = useMemo(() => {
    return data.reduce((acc, item) => {
      const dateOnly = item.timestamp.split(' ')[0]; 
      if (!acc[dateOnly]) acc[dateOnly] = []; 
      acc[dateOnly].push(item); 
      return acc;
    }, {});
  }, [data]);
  
  const areFiltersApplied = Object.values(filters).some(filter =>
    filter !== '' && (typeof filter === 'object' ? filter.from || filter.to : true)
  );

  if (!areFiltersApplied) {
    return <p>Please apply filters to see the data.</p>;
  }

  // Check if groupedData has entries
  if (Object.keys(groupedData).length === 0) {
    return <p>No data available</p>;
  }

  // Get unique hours (for header)
  const hours = Array.from({ length: 24 }, (_, i) => `${i + 1}`);
  console.log(hours)

  return (
    <div>
      {/* Display Filters */}
      <div className="filters-display">
        <h3>Applied Filters:</h3>
        <ul>
          <li>Service Owner: {filters.serviceOwner || 'All'}</li>
          <li>Date Range: {filters.dateRange.from} - {filters.dateRange.to}</li>
          <li>Service Name: {filters.serviceName || 'All'}</li>
          <li>Territory: {filters.territory || 'All'}</li>
          <li>Operator: {filters.operator || 'All'}</li>
          <li>Partner Name: {filters.partnerName || 'All'}</li>
        </ul>
      </div>

      <table>
        <thead>
          {Object.keys(groupedData).map((date, idx) => (
            <React.Fragment key={idx}>
              <tr>
                <th>{formatDate(date)}</th>
                <th >Total CR</th>

                {hours.map((hour, hourIdx) => (
                  <th key={hourIdx}>{hour}</th>
                ))}
              </tr>

              {/* CR% Row */}
              <tr>
                <td className="static">CR%</td>
                <td>
                  {calculateCR(
                    groupedData[date].reduce((sum, item) => sum + item.pinVerSucCount, 0),
                    groupedData[date].reduce((sum, item) => sum + item.pinGenSucCount, 0)
                  )}
                </td>
                {hours.map((hour) => {
                  const item = groupedData[date].find((d) => `${d.hrs + 1}` === hour);
                  return (
                    <td key={hour}>
                      
                      {item ? calculateCR(item.pinVerSucCount, item.pinGenSucCount) : 'NA'}
                    </td>
                  );
                })}
              </tr>

              {/* Pin Gen Row */}
              <tr>
                <td className="static">Pin Gen</td>
                <td>
                  {groupedData[date].reduce((sum, item) => sum + item.pinGenSucCount, 0)}
                </td>
                {hours.map((hour) => {
  const item = groupedData[date].find((d) => String(d.hrs + 1) === hour);
  return (
    <td key={hour}>
      {item ? item.pinGenSucCount : 0}
    </td>
  );
})}

              </tr>

              {/* Pin Ver Row */}
              <tr className="last-row">
                <td className="static">Pin Ver</td>
                <td>
                  {groupedData[date].reduce((sum, item) => sum + item.pinVerSucCount, 0)}
                </td>
                {hours.map((hour) => {
                  const item = groupedData[date].find((d) => `${d.hrs + 1}` === hour);
                  return <td key={hour}>{item ? item.pinVerSucCount : 0}</td>;
                })}
              </tr>

              {/* Gap between date groups */}
              <tr>
                <td colSpan={2}></td>
                <td colSpan={hours.length}></td>
              </tr>
            </React.Fragment>
          ))}
        </thead>
      </table>
    </div>
  );
};

export default TableComponent;
