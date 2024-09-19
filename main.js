require('dotenv').config();
const axios = require('axios');

// 前営業日を取得する関数
function getPreviousBusinessDay(today) {
  if (!(today instanceof Date)) {
    throw new TypeError('Argument must be a Date object');
  }

  const dayOfWeek = today.getDay();

  // 今日が月曜なら、前の金曜日（3日前）を取得
  if (dayOfWeek === 1) {
    today.setDate(today.getDate() - 3);
  }
  // 今日が日曜なら、前の金曜日（2日前）を取得
  else if (dayOfWeek === 0) {
    today.setDate(today.getDate() - 2);
  }
  // 今日が土曜なら、前の金曜日（1日前）を取得
  else if (dayOfWeek === 6) {
    today.setDate(today.getDate() - 1);
  }
  // 平日なら1日前を取得
  else {
    today.setDate(today.getDate() - 1);
  }

  return today;
}

// 次の営業日を取得する関数
function getNextBusinessDay(date) {
  // 新しいDateオブジェクトを作成
  const nextDay = new Date(date);

  // 曜日情報を取得（日曜: 0, 土曜: 6）
  const dayOfWeek = nextDay.getDay();

  // 次の日を設定
  nextDay.setDate(nextDay.getDate() + 1);

  // 次の日が土曜または日曜の場合、平日まで調整
  if (dayOfWeek === 5) { // 金曜日の場合、2日後の月曜日
    nextDay.setDate(nextDay.getDate() + 2);
  } else if (dayOfWeek === 6) { // 土曜日の場合、1日後の月曜日
    nextDay.setDate(nextDay.getDate() + 2);
  } else if (dayOfWeek === 0) { // 日曜日の場合、1日後の月曜日
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

// 日付を YYYYMMDD 形式にフォーマットする関数
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// 本日が営業日かどうかを判定する関数
function isBusinessDay(date) {
  const dayOfWeek = date.getDay();
  // 土曜日（6）と日曜日（0）は営業日ではない
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

// 営業日判定後の処理
async function checkAndRun() {
  // 今日の日付を設定
  const today = new Date(); // 今日の日付

  // 本日が営業日かどうかを判定
  if (isBusinessDay(today)) {
    console.log('本日は営業日です');
    await myFunction(); // 本日が営業日ならmyFunctionを実行
  } else {
    console.log('本日は営業日ではありません');
  }
}

// メイン処理
async function myFunction() {
  // 今日の日付を設定し、前営業日を取得する
  const today = new Date(); // 今日の日付
  const previousBusinessDay = getPreviousBusinessDay(new Date(today)); // 前営業日を取得
  const formattedDate = formatDate(previousBusinessDay);

  console.log('前営業日:', previousBusinessDay);

  // 次の営業日を取得して、フォーマット変更し、新しいタイトルを作成
  const nextBusinessDay = getNextBusinessDay(previousBusinessDay);
  console.log('本日の営業日:', nextBusinessDay);
  const nextFormattedDate = formatDate(nextBusinessDay);
  const newTitle = `第2開発_Cチーム朝会_${nextFormattedDate}`;

  // URL を組み立てる
  const url = `https://api.docbase.io/teams/u001/posts?q=title:第2開発_Cチーム朝会_${formattedDate}`;
  const token = process.env.DOCBASE_TOKEN;

  try {
    // API リクエストを行う
    const response = await axios.get(url, {
      headers: {
        'X-DocBaseToken': token
      }
    });

    // レスポンスデータを取得
    const data = response.data;

    // 最初のポストを取得
    const post = data.posts[0];

    const body = post.body;
    const draft = post.draft;
    const scope = post.scope;
    const tags = post.tags.map(tag => tag.name);

    // 新規投稿を作成する
    const postUrl = 'https://api.docbase.io/teams/u001/posts';
    const postData = {
      title: newTitle,
      body: body,
      draft: draft,
      tags: tags,
      scope: scope,
      notice: false
    };

    const newPostResponse = await axios.post(postUrl, postData, {
      headers: {
        'X-DocBaseToken': token,
        'Content-Type': 'application/json'
      }
    });

    // 新規投稿のレスポンスデータを取得
    const newPostData = newPostResponse.data;
    console.log('新規投稿のデータ:', newPostData);

  } catch (error) {
    // エラー処理
    console.error('Error:', error);
  }
}

// 営業日判定後の処理を実行
checkAndRun();
