const micro = require('micro')
const axios = require('axios')

const server = micro(async (req, res) => {
  let body
  let statusCode
  let totalSalvations = 0

  const salvations = await axios.get(
    process.env.SALVATIONS_ENDPOINT,
    {
      headers: {
        'X-Auth-User': process.env.CM_AUTH_USER,
        'X-Auth-Key': process.env.CM_AUTH_TOKEN
      }
    }
  )
    .then(function (response) {
      console.log(response.data);
      if (response.data && response.data.length) {
        response.data.map((week) => {
          totalSalvations = totalSalvations + week.value
        })
      };
      return 0;
    })
    .catch(function (error) {
      console.log(error);
      statusCode = 500;
      body = { error: 'unknown' };
    });
  statusCode = 200
  body = {
    frames: [
      {
        text: `${totalSalvations}`,
        icon: 'i23983'
      }
    ]
  }

  micro.send(res, statusCode, body)
})

module.exports = server
