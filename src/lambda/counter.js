import axios from "axios"

require('dotenv').config()

const salvationCategory = 414277
const baptismCategory = 475846

const getPaginatedResults = (endpoint, page, data = []) => {
  // const baseEndpoint = `${process.env.SALVATIONS_ENDPOINT}&category_id=${salvationCategory}&page=${page}`
  const baseEndpoint = `${endpoint}&page=${page}`
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

      return getPaginatedResults(endpoint, page + 1, data)
    })
}

export async function handler(event, context) {
  let totalSalvations = 0
  let totalBaptisms = 0

  try {
    const salvationResponse = await getPaginatedResults(`${process.env.SALVATIONS_ENDPOINT}&category_id=${salvationCategory}`, 1)
    const baptismResponse = await getPaginatedResults(`${process.env.SALVATIONS_ENDPOINT}&category_id=${baptismCategory}`, 1)

    salvationResponse.map((week) => {
      totalSalvations = totalSalvations + week.value
    })

    // const baptismResponse1 = await axios.get(
    //     `${process.env.SALVATIONS_ENDPOINT}&category_id=${baptismCategory}`,
    //     {
    //       headers: {
    //         'X-Auth-User': process.env.CM_AUTH_USER,
    //         'X-Auth-Key': process.env.CM_AUTH_TOKEN
    //       }
    //     }
    // ).then(response => {
    //   if (response.data && response.data.length) {
    //     baptismResponse.push(...response.data)
    //   }
    // })

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
