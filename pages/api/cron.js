
import supabase from '/utils/supabase'
import mjml2html from 'mjml'
const postmark = require("postmark");

const TESTING_ENABLED = false

const SENDER_EMAIL = "newsletter@tweetnewsletter.xyz"
const EMAIL_HEADER = "'s forgotten tweets"

const OEMBED_ENDPOINT = "https://publish.twitter.com/oembed"
const TWITTER_URL_FORMAT = "https://twitter.com/twitter/status/"
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

// This is a handy little markup language that handles making a responsive email template
function generate_html_email(tweets) {
  const htmlOutput = mjml2html(`
  <mjml>
    <mj-body>
      <!-- Intro -->
      <mj-section backgrou>
        <mj-column>
          <mj-text>
            here's this week's tweets
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Tweets -->
      <mj-section>
      <mj-column>
      ${
        tweets.map(tweet => {
          return `
          <mj-text>
            ${tweet}
          </mj-text>
          `
        })
      }
      </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`)

return htmlOutput.html
}

// Rewritten to return a promise so we can wait for the oembed call to finish
function generate_email(row) {
  const tweets = row.tweet_list

  var tweets_html_promises = tweets.map(tweet => {
    // Twitter has a nice Embed endpoint to get the HTML for a tweet.
    return fetch(OEMBED_ENDPOINT + "?url=" + TWITTER_URL_FORMAT + tweet.id)
      .then(response => response.json())
  })

  return Promise.all(tweets_html_promises).then((values) => {
    const html_tweets = values.map(tweet => tweet.html)
    return generate_html_email(html_tweets)
  })
}

async function send_emails(data) {
  var email_promises = data.map(row => {
    return generate_email(row).then(email_body => {
      return {
        "From": SENDER_EMAIL,
        "To": row.email,
        "Subject": row.user + EMAIL_HEADER,
        "HtmlBody": email_body
      }
    })
  })

  return Promise.all(email_promises).then((email_list) => {  
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
    client.sendEmailBatch(email_list).then(function (response) {
      console.log(response);
    })
  })

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

    res.status(200).json({ data: 'Emails queued, check logs for any errors' })


  } else {

    // FOR TESTING ONLY, DO NOT USE IN PRODUCTION
    // This is a hacky way to test out the cron job. Do not use. i'm watching u 
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