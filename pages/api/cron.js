
export default async function handler (req, res) {
  if (req.method === 'POST') {
    console.log("Cron job running, emails will be sent")
    const { authorization } = req.headers

    if (authorization !== process.env.EMAIL_API_SECRET) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }

}