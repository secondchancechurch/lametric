import axios from "axios"
import moment from "moment"
import thousands from "thousands"

require('dotenv').config()

const salvationCategory = 414277
const baptismCategory = 475846
const attendanceCategory = 414275

export async function handler(event, context) {
  let totalSalvations = 0
  let totalBaptisms = 0

  try {
    let salvationResponse = []
    let baptismResponse = []

    const salvationEndpoint = `${process.env.SALVATIONS_ENDPOINT}&category_id=${salvationCategory}`

    const salvationResponse1 = await axios.get(
      salvationEndpoint,
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
      salvationEndpoint + '&page=2',
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
      salvationEndpoint + '&page=3',
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
