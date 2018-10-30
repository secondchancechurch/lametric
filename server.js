const micro = require('micro')
const axios = require('axios')

const server = micro(async (req, res) => {
  let body
  let statusCode
  const salvations = await axios.get(
    process.env.SALVATIONS_ENDPOINT,
    {
      headers: {
        'Authorization-Token': process.env.ROCK_AUTH_TOKEN
      }
    }
  )
    .then(function (response) {
      if (response.data && response.data.length) return response.data[0].YValueTotal;
      return 0;
    })
    .catch(function (error) {
      statusCode = 500;
      body = { error: 'unknown' };
    });
  statusCode = 200
  body = {
    frames: [
      {
        text: `${salvations}`,
        icon: 'i23983'
      }
    ]
  }

  micro.send(res, statusCode, body)
})

module.exports = server
