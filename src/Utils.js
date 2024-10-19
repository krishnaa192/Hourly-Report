// utils/apiService.js
export const fetchHourlyInappReport = async () => {
    try {
      const response = await fetch('https://wap.matrixads.in/mglobopay/getHourlyInappReport');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data; // Assuming data is an array
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Propagate the error to handle in the calling component
    }
  };
  