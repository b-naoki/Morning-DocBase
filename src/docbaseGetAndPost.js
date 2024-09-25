const { formatDate } = require('./formatDate');
const { getNextBusinessDay } = require('./getNextBusinessDay');
const { getPreviousBusinessDay } = require('./getPreviousBusinessDay');
const axios = require('axios');
require('dotenv').config();

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

module.exports = docbaseGetAndPost;