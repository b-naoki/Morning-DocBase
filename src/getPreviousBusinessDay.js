function getPreviousBusinessDay(today) {
    if (!(today instanceof Date)) {
      throw new TypeError('Argument must be a Date object');
    }
  
    // 今日が月曜なら、前の金曜日（3日前）を取得
    if (today.getDay() === 1) {
      today.setDate(today.getDate() - 3);
    // それ以外なら1日前を取得
    } else {
      today.setDate(today.getDate() - 1);
    }
  
    return today;
  }

  module.exports = getPreviousBusinessDay;