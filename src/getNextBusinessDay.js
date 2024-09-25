function getNextBusinessDay(date) {
    const nextDay = new Date(date);
    nextDay.setDate(new Date(date).getDate() + 1);
  
    // 金曜日の場合、2日後の月曜日
    if (nextDay.getDay() === 5) {
      nextDay.setDate(nextDay.getDate() + 2);
    }
  
    return nextDay;
  }

  module.exports = getNextBusinessDay;