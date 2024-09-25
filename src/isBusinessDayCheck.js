const axios = require('axios');

async function isBusinessDayCheck(date) {
    const year = date.getFullYear();
    
    const response = await axios.get(`https://date.nager.at/Api/v2/PublicHolidays/${year}/JP`);
    const publicHolidays = response.data.map(holiday => new Date(holiday.date));
  
    const dayOfWeek = date.getDay();
  
    // 土曜日（6）または日曜日（0）の場合は何も返さずに終了
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('土日です');
      return false;
    }
  
    if (publicHolidays.some(holiday => holiday.getTime() === date.getTime())) {
      console.log('祝日です');
      return false;
    }
  
    return true;
  }

  module.exports = isBusinessDayCheck;