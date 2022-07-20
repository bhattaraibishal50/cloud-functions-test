const functions = require('firebase-functions');
const algoliasearch = require("algoliasearch");

const ALGOLIA_ID = "LMD9RAD38T";
const ALGOLIA_ADMIN_KEY = "4861d0c26738baf04c5057cff6d47055";
const ALGOLIA_INDEXES = 'dev_jobs';

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const industryList = {
  foodBeverage: "飲食",
  customerService: "清掃/接客/サービス/販売",
  lightWork: "軽作業/工場",
};

const prefectureList= {
  Hokkaido: "北海道",
  Aomori: "青森県",
  Tokyo: "東京都",
};

const workingPeriodList= {
  shortTerm: "短期",
  MidTerm: "中期",
  longTerm: "長期"
};

exports.jobUpdate = functions.firestore.document('Jobs/{jobId}')
  .onWrite((change, context) => {
  const job = change.after.data();
  try {
    job.industryForSearch = `${job.industry} ${industryList[job.industry]}`;
    job.prefectureForSearch = `${job.prefecture} ${prefectureList[job.prefecture]}`;
    job.workingPeriodForSearch = `${job.workingPeriod} ${workingPeriodList[job.workingPeriod]}`;
    job.updatedAtForSearch = job.updatedAt.seconds;
    job.createdAtForSearch = job.createdAt.seconds;
    job.objectID = context.params.jobId;
    job.id = context.params.jobId;
    const index = client.initIndex(ALGOLIA_INDEXES);
    return index.saveObject(job);
  } catch (e) {
    console.log(context.params.jobId, e.message);
    return true;
  }
});

