const { getDocs, ObjectId, MongoError } = require("../config/mongoCollections");

async function searchD(query) {
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [0, 0],
        },
        distanceField: "calcDistance",
        query: query,
        spherical: true,
      },
    },
    {
      $project: {
        email: 0,
        password: 0,
      },
    },
  ];

  let docs = await getDocs();
  const aggCursor = docs.aggregate(pipeline);

  await aggCursor.forEach((element) => {
    console.log(element);
  });
}

searchD({firstname: "Shawna"});
