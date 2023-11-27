const { expressjwt: jwt } = require('express-jwt');
const secret = process.env.SECRET
const baseUrl = process.env.BASE_API

function authJwt(){
  return jwt({ 
    secret, 
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [
    {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
      {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
      {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
      `${baseUrl}/users/login`,
      `${baseUrl}/users/register`
    ]
  })
}

async function isRevoked(req, payload, done) {
  if(!payload.isAdmin) return done(null, true);

  done();
}

module.exports = authJwt;