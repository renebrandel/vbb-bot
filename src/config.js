// Base url
const url = 'http://demo.hafas.de/openapi/vbb-proxy'

// Access token
const token = process.env.VBB_SECRET // <-- Add token here!
function getToken () {
  // Complain if the token wasn't entered
  if (!token) {
    throw new Error('Get an access token first')
  }
  return token
}

export default {
  getToken,
  url,
}
