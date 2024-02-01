
const { getDocs, ObjectId } = require("./../config/mongoCollections");
const { closeConnection } = require("./../config/mongoConnection");
const moment = require("moment")

let count = 14;
let curDate = moment();
let schedules = [];
while (count--) {
    const daySchedule = {
        day: curDate.format('DD'),
        month: curDate.format('MM'),
        year: curDate.format('Y'),
        dayOfWeek: curDate.format('ddd'),
        monthName: curDate.format('MMM'),
        available: true,
        startDay: '09:00',
        endDay: '18:00',
        sessionTime: 30,
        breakTimes: [],
        workTimes: []
    }
    schedules.push(daySchedule);
    curDate.add(1, 'days');
}

const schedule = async () => {
  var docs = await getDocs();
  docs = await docs.distinct("_id");
  var docs_id = []
  docs.forEach(element => {
      docs_id.push(element)
  });



  const doctorCollection = await getDocs();

  for (let i = 0; i < docs_id.length; i++) {
        await doctorCollection.updateOne({_id: new ObjectId(docs_id[i])}, {$set:{"schedules": schedules}})
  }
  await closeConnection();


  console.log(docs_id);
};


schedule();



