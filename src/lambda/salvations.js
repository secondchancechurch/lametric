import axios from "axios"
import moment from "moment"
import thousands from "thousands"

require('dotenv').config()

const salvationCategory = 414277
const baptismCategory = 475846
const attendanceCategory = 414275

const getPaginatedResults = (page, data = []) => {
  const baseEndpoint = `${process.env.SALVATIONS_ENDPOINT}&category_id=${salvationCategory}&page=${page}`
  return axios.get(baseEndpoint,
    {
      headers: {
        'X-Auth-User': process.env.CM_AUTH_USER,
        'X-Auth-Key': process.env.CM_AUTH_TOKEN
      }
    }
    )
    .then(response => {
      data.push(...response.data)

      if (!response.data.length) {
        return data
      }

      return getPaginatedResults(page + 1, data)
    })
}

export async function handler(event, context) {
  let totalSalvations = 0
  let totalBaptisms = 0
  let youtubeAttendance = 0
  let facebookAttendance = 0
  let churchOnlineAttendance = 0
  let physicalAttendance = 0
  let momentDate = moment().startOf('week').format('YYYY-MM-DD')

  try {
    let salvationResponse =  await getPaginatedResults(1)
    let baptismResponse = []

    salvationResponse.map((week) => {
      totalSalvations = totalSalvations + week.value
    })

    const baptismResponse1 = await axios.get(
        `${process.env.SALVATIONS_ENDPOINT}&category_id=${baptismCategory}`,
        {
          headers: {
            'X-Auth-User': process.env.CM_AUTH_USER,
            'X-Auth-Key': process.env.CM_AUTH_TOKEN
          }
        }
    ).then(response => {
      if (response.data && response.data.length) {
        baptismResponse.push(...response.data)
      }
    })

    baptismResponse.map((week) => {
      totalBaptisms = totalBaptisms + week.value
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
            text: `${totalBaptisms}`,
            icon: 'a24116'
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
