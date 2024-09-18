// require('dotenv').config();
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

// 日付を YYYYMMDD 形式にフォーマットする関数
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// メイン処理
async function myFunction() {
  // 今日の日付を設定し、前営業日を取得する
  const today = new Date(); // 今日の日付
  const previousBusinessDay = getPreviousBusinessDay(new Date(today)); // 前営業日を取得
  const formattedDate = formatDate(previousBusinessDay);

  // URL を組み立てる
  const url = `https://api.docbase.io/teams/u001/posts?q=title:第2開発 Cチーム朝会_${formattedDate}`;
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

    // 現在のタイトルから日付を +1 日する
    const currentTitle = post.title;
    const currentDateStr = currentTitle.match(/(\d{8})$/)[0]; // 末尾の YYYYMMDD を抽出
    const currentDate = new Date(
      `${currentDateStr.slice(0, 4)}-${currentDateStr.slice(4, 6)}-${currentDateStr.slice(6, 8)}`
    );
    const nextDay = new Date(currentDate.setDate(currentDate.getDate() + 1));
    
    const yyyyNext = nextDay.getFullYear();
    const mmNext = String(nextDay.getMonth() + 1).padStart(2, '0');
    const ddNext = String(nextDay.getDate()).padStart(2, '0');
    const newDateStr = `${yyyyNext}${mmNext}${ddNext}`;
    
    const newTitle = currentTitle.replace(/(\d{8})$/, newDateStr);

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

// メイン処理を実行
myFunction();
