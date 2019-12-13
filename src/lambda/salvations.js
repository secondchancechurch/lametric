import axios from "axios"
import moment from "moment"
import thousands from "thousands"

require('dotenv').config()

const baptismCategory = 475846
const attendanceCategory = 414275

export async function handler(event, context) {
  let totalSalvations = 0
  let totalBaptisms = 0
  let youtubeAttendance = 0
  let facebookAttendance = 0
  let churchOnlineAttendance = 0
  let physicalAttendance = 0
  let momentDate = moment().startOf('week').format('YYYY-MM-DD')

  try {
    let salvationResponse = []
    const salvationResponse1 = await axios.get(
      process.env.SALVATIONS_ENDPOINT,
      {
        headers: {
          'X-Auth-User': process.env.CM_AUTH_USER,
          'X-Auth-Key': process.env.CM_AUTH_TOKEN
        }
      }
    ).then(response => {
      salvationResponse.push(...response.data)
    })

    const salvationResponse2 = await axios.get(
      process.env.SALVATIONS_ENDPOINT + '&page=2',
      {
        headers: {
          'X-Auth-User': process.env.CM_AUTH_USER,
          'X-Auth-Key': process.env.CM_AUTH_TOKEN
        }
      }
    ).then(response => {
      if (response.data && response.data.length) {
        salvationResponse.push(...response.data)
      }
    })

    const salvationResponse3 = await axios.get(
      process.env.SALVATIONS_ENDPOINT + '&page=3',
      {
        headers: {
          'X-Auth-User': process.env.CM_AUTH_USER,
          'X-Auth-Key': process.env.CM_AUTH_TOKEN
        }
      }
    ).then(response => {
      if (response.data && response.data.length) {
        salvationResponse.push(...response.data)
      }
    })

    salvationResponse.map((week) => {
      totalSalvations = totalSalvations + week.value
    })

    const attendance = await axios.get(
      `https://churchmetrics.com/api/v1/records.json?category_id=414275&start_time=${momentDate}`,
      {
        headers: {
          'X-Auth-User': process.env.CM_AUTH_USER,
          'X-Auth-Key': process.env.CM_AUTH_TOKEN
        }
      }
    )

    if (attendance.data && attendance.data.length) {
      attendance.data.map((location) => {
        switch (location.campus.id) {
          case 96528:
            return youtubeAttendance = youtubeAttendance + location.value
          case 92904:
            return physicalAttendance = physicalAttendance + location.value
          case 86424:
            return churchOnlineAttendance = churchOnlineAttendance + location.value
          case 92905:
            return facebookAttendance = facebookAttendance + location.value
        }
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ frames: [
          {
            text: `${totalSalvations}`,
            icon: 'i23983'
          },{
            text: '16',
            icon: 'i23983'
          },{
            text: `${thousands(physicalAttendance)}`,
            icon: 'i1966'
          },{
            text: `${thousands(facebookAttendance)}`,
            icon: 'i125'
          },{
            text: `${thousands(churchOnlineAttendance)}`,
            icon: 'i30476'
          },{
            text: `${thousands(youtubeAttendance)}`,
            icon: 'i5268'
          }
        ]
      })
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
