
import supabase from '/utils/supabase'
const postmark = require("postmark");


async function read_database() {
  const { data } = await supabase.from('emails').select('*')
  return data
}

export default async function handler (req, res) {
  if (req.method === 'POST') {
    const { authorization } = req.headers

    if (authorization !== process.env.EMAIL_API_SECRET) {
      console.log(authorization)
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    // For signed up user, send email. We should already have the 5 tweets for the 
    // email (this is done in the signup process), so we just need to format them
    // and send them. 
    var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

    const { data } = await supabase.from('emails').select('*')
    console.log(data)
    client.sendEmail({
      "From": "newsletter@tweetnewsletter.xyz",
      "To": "newsletter@tweetnewsletter.xyz",
      "Subject": "Test",
      "TextBody": "THIS IS A CRON JOB EMAIL BRO"
    });

    res.status(200).json({ data: 'Emails sent' })


  } else {

    // FOR TESTING ONLY, DO NOT USE IN PRODUCTION
    // This is a hacky way to test out the cron job. Do not use 

    // const a = await read_database()
    // console.log(a)
    // res.json(a)
  
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }

}