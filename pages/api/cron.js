
import supabase from '/utils/supabase'
const postmark = require("postmark");

const TESTING_ENABLED = false

const SENDER_EMAIL = "newsletter@tweetnewsletter.xyz"

// Our table has columns:
// created_at 
// user 
// tweet_list
// send_date
// email
async function read_database() {
  const t = new Date()
  // Just the year, month, day. Is there a cleaner way to do this?
  var today = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toDateString()

  // Mildly annoying to have in the codebase, but i want an easy flag to toggle to test this. Here, 
  // if testing is enable we're gonna pretend like it's friday.
  if (TESTING_ENABLED) {
    today = new Date(t.getFullYear(), t.getMonth(), t.getDate() + (5 <= t.getDay() ? 12 - t.getDay() : 5 - t.getDay())).toDateString()
  }

  const { data } = await supabase
    .from('emails')
    .select()
    .eq('date', today)

  return data
}

function generate_email(row) {
  const tweets = row.tweet_list

  // Format the tweets into a string
  var tweet_string = ""
  for (var tweet of tweets) {
    tweet_string += "Tweet ID: " + tweet.id + "\n" + tweet.text + "\n\n"
  }
  return tweet_string
}

function send_emails(data) {
  var email_list = []
  for (const row of data) {
      const email_body = generate_email(row)
      email_list.push({
        "From": SENDER_EMAIL,
        "To": row.email,
        "Subject": row.user + "'s Tweets",
        "TextBody": email_body
      })
  }

  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
  for (var email of email_list) {
    client.sendEmail(email);
  }

} 

export default async function handler (req, res) {
  if (req.method === 'POST') {
    const { authorization } = req.headers

    if (authorization !== process.env.EMAIL_API_SECRET) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const data = await read_database()
    send_emails(data)

    res.status(200).json({ data: 'Emails sent' })


  } else {

    // FOR TESTING ONLY, DO NOT USE IN PRODUCTION
    // This is a hacky way to test out the cron job. Do not use 
    if (TESTING_ENABLED) {
      const a = await read_database()
      send_emails(a)
      res.json(a)
      return
    }

    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }

}