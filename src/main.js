require('dotenv').config();
const axios = require('axios');

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

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function getNextBusinessDay(date) {
  const nextDay = new Date(date);
  nextDay.setDate(new Date(date).getDate() + 1);

  // 金曜日の場合、2日後の月曜日
  if (nextDay.getDay() === 5) {
    nextDay.setDate(nextDay.getDate() + 2);
  }

  return nextDay;
}

async function docbaseGetAndPost(today) {

  const previousBusinessDay = getPreviousBusinessDay(new Date(today));
  console.log('前営業日:', previousBusinessDay);
  const formattedDate = formatDate(previousBusinessDay);

  const url = `https://api.docbase.io/teams/u001/posts?q=title:第2開発_Cチーム朝会_${formattedDate}`;
  const token = process.env.DOCBASE_TOKEN;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-DocBaseToken': token
      }
    });

    const data = response.data;
    const post = data.posts[0];
    console.log('前営業日の投稿:', post);

    const nextBusinessDay = getNextBusinessDay(previousBusinessDay);
    console.log('本日の営業日:', nextBusinessDay);
    const newTitle = `第2開発_Cチーム朝会_${formatDate(today)}`;

    const postUrl = 'https://api.docbase.io/teams/u001/posts';
    const postData = {
      title: newTitle,
      body: post.body,
      draft: post.draft,
      tags: post.tags.map(tag => tag.name),
      scope: post.scope,
      notice: false
    };

    const newPostResponse = await axios.post(postUrl, postData, {
      headers: {
        'X-DocBaseToken': token,
        'Content-Type': 'application/json'
      }
    });

    const newPostData = newPostResponse.data;
    console.log('新規投稿のデータ:', newPostData);

  } catch (error) {
    console.error('Error:', error);
  }
}

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

async function bussinessdayCheckAndDocBaseManagement() {

  const today = new Date();

  if (await isBusinessDayCheck(today) === true) {
    console.log('本日は営業日です');
    await docbaseGetAndPost(today);
  } else {
    console.log('本日は営業日ではありません');
    return;
  }
}

bussinessdayCheckAndDocBaseManagement();