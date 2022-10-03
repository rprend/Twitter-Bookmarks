const sgMail = require('@sendgrid/mail');
import { getToken } from "next-auth/jwt"

export default async function email(req, res) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const bookmarks = await search(req, res)
    
    const formatted_bookmarks = bookmarks.data.map((bookmark) => {
        return bookmark.text
    })

    const body_string = formatted_bookmarks.join("\n\n")

    const msg = {
        to: 'rprendergast1121@gmail.com', 
        from: 'rprendergast1121@gmail.com',
        subject: 'Sending with SendGrid is Fun',
        text: body_string,
        html: body_string
    }
    sgMail
    .send(msg)
    .then(() => {
        res.status(200)
    })
    .catch((error) => {
        res.send(error)
    })  

    res.status(200)
  
} 

async function search(req, res) {
  const token = await getToken({ req })
  const response = await fetch(
    `https://api.twitter.com/2/users/${token.sub}/bookmarks`,
    { headers: { Authorization: `Bearer ${token.twitter.access_token}` } }
  )
  const data = await response.json()
  return data
}
