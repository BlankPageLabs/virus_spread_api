var cass = require('../lib/cassandra-api').db;


exports.db = function () {
  return {
    create: function (k, cb) {
      params = [k.id, k.lt, k.ln, k.time, k.kissedBy, k.kissedOn]
      cass.exec_with_params("INSERT INTO kisses " +
        "(id, lt, ln, time, kissedBy, kissedOn) " +
        "VALUES (?, ?, ?, ?, ?, ?);",
        params, cb);
    },
    updateMeetUp: function (hisId, myId, cb) {
      console.log([myId, hisId])
      cass.exec_with_params("SELECT count(*) FROM kisses WHERE " +
        "kissedOn = " + myId + " and kissedBy = " + hisId + ";", [], // myId, hisId
        function (res, errs) {
          if(errs) {
            cb(null, errs);
            return;
          }
          if(res && res.rows && res.rows[0].count) {
            console.log(res.rows[0].count)
            var newCount = parseInt(res.rows[0].count);
            console.log(newCount);
            cass.exec_with_params(
              "SELECT kissedOn, kissedBy FROM meeting_count WHERE kissedBy = ? and kissedOn = ?",
              [hisId, myId], function (res, errs) {
                if(errs) {
                  cb(null, errs);
                  return;
                }
                if(res && res.rows.length >= 1) {
                  cass.exec_with_params(
                    "UPDATE meeting_count SET count = ? WHERE kissedBy = ? and kissedOn = ? ",
                    [ newCount, hisId, myId], cb)
                } else {
                  console.log('S6')
                  cass.exec_with_params(
                    "INSERT INTO meeting_count (kissedBy, kissedOn, count) VALUES (?, ?, 1)",
                    [hisId, myId], cb)
                }
              });
          }
        });
    },
    findBy: function (param, id, cb) {
      params = {
                c: 'kisses',
                k: param,
                v: id
               };
      cass.findBy(params, cb);
    }
  }
}