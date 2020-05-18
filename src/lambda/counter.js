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

  try {
    const salvationResponse = await getPaginatedResults(1)
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

    // text: '16',
    return {
      statusCode: 200,
      body: JSON.stringify({ frames: [
          {
            text: `${totalSalvations}`,
            icon: 'i23983'
          },{
            text: `${totalBaptisms}`,
            icon: 'a24116'
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
