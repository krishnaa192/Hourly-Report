import React, { useMemo } from 'react';
import '../css/Table.css';

const TableComponent = ({ data,filters }) => {
  // Grouping data by date
  const groupedData = useMemo(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.timestamp]) acc[item.timestamp] = [];
      acc[item.timestamp].push(item);
      return acc;
    }, {});
  }, [data]);

  // Function to calculate CR%
  const calculateCR = (pinVerSucCount, pinGenSucCount) => {
    if (pinVerSucCount === 0) return '0%';
    return `${((pinVerSucCount / pinGenSucCount) * 100).toFixed(0)}%`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculatetotalCr = (pgsCount, pvsCount) => {
    return `${((pvsCount / pgsCount) * 100).toFixed(0)}% `;
  };
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
  if (Object.keys(groupedData).length === 0) {
    return <p>No data available</p>; 
  }
  return (
    <table>
      <thead>
        {Object.keys(groupedData).map((date, idx) => (
          <React.Fragment key={idx}>
            <tr>
             
              <th>{formatDate(date)}</th> 
              <th>Total CR</th>
              {hours.map((hour, hourIdx) => (
                <th key={hourIdx}>{hour}</th>
              ))}
            </tr>

            {/* CR% Row */}
            <tr>
              <td>CR%</td> 
              <td>60%</td> 
              {hours.map((hour) => {
                const item = groupedData[date].find((d) => `${d.hrs + 1}` === hour);
                return (
                  <td key={hour}>
                    {item ? calculateCR(item.pinGenSucCount, item.pinGenReqCount) : 'NA'}
                  </td>
                );
              })}
            </tr>

            {/* Pin Gen Row */}
            <tr>
              <td>Pin Gen</td> 
              <td>220</td> 
              {hours.map((hour) => {
                const item = groupedData[date].find((d) => `${d.hrs}-${d.hrs + 1}` === hour);
                return <td key={hour}>{item ? item.pinGenReqCount : 0}</td>;
              })}
            </tr>

            {/* Pin Ver Row (Last Row) */}
            <tr className="last-row">
              <td>Pin Ver</td> 
              <td>120</td>
              {hours.map((hour) => {
                const item = groupedData[date].find((d) => `${d.hrs}-${d.hrs + 1}` === hour);
                return <td key={hour}>{item ? item.pinVerReqCount : 0}</td>;
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
  );
};

export default TableComponent;