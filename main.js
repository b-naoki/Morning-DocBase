require('dotenv').config();
const axios = require('axios');

async function myFunction() {
  // 昨日の日付を取得する。
  const today = new Date();
  const yesterday = new Date(today.setDate(today.getDate() - 1));
  
  // 日付を YYYYMMDD 形式でフォーマットする
  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
  const dd = String(yesterday.getDate()).padStart(2, '0');
  const formattedDate = `${yyyy}${mm}${dd}`;

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

    // 現在のタイトルから日付を +1 日する
    const currentTitle = post.title;
    const currentDateStr = currentTitle.match(/(\d{8})$/)[0]; // 末尾の YYYYMMDD を抽出
    const currentDate = new Date(
      `${currentDateStr.slice(0, 4)}-${currentDateStr.slice(4, 6)}-${currentDateStr.slice(6, 8)}`
    );
    const nextDay = new Date(currentDate.setDate(currentDate.getDate() + 1));
    
    const yyyyNext = nextDay.getFullYear();
    const mmNext = String(nextDay.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
    const ddNext = String(nextDay.getDate()).padStart(2, '0');
    const newDateStr = `${yyyyNext}${mmNext}${ddNext}`;
    
    const newTitle = currentTitle.replace(/(\d{8})$/, newDateStr);

    const body = post.body;
    const draft = post.draft;
    const scope = post.scope;
    const tags = post.tags.map(tag => tag.name);

    // 各項目をコンソールに出力
    console.log('変更前のTitle:', currentTitle);
    console.log('変更後のTitle:', newTitle);     
    console.log('Body:', body);
    console.log('Draft:', draft);
    console.log('Tags:', tags);
    console.log('Tags:', tags);
    console.log('Scope:', scope);

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

myFunction();
