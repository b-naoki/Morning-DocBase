const { docbaseGetAndPost } = require('./utils');
const { isBusinessDayCheck } = require('./isBusinessDayCheck');

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
