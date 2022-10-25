import Head from 'next/head'
import { useSession, signIn, signOut } from "next-auth/react"
import React from 'react'

export default function Home() {
  const { data: session } = useSession()
  const [loading, setLoading] = React.useState(false)
  const [bookmarks, setBookmarks] = React.useState(null)

  function get_bookmarks() {
      setLoading(true)
      fetch('/api/twitter/search')
        .then((res) => res.json())
        .then((data) => {
          setBookmarks(data.data)
          setLoading(false)
        })
  }

  function send_email() {
    fetch('/api/email')
      .then((res) => res.json())
      .then((data) => {
        console.log("Email sent")
      })
  }

  // This is a hacky way to test out the cron job. Do not press!
  function run_cron() {
    fetch('/api/cron')
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
      })

  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const data = {
      email: event.currentTarget.email.value,
      user: session.user.name
    }

    const JSONdata = JSON.stringify(data)
    const endpoint = '/api/parse_bookmarks'

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    console.log(response)

  }


  return (
    <div>
      <Head>
        <title>Twitter Newsletter</title>
        <meta name="description" content="Five bookmarked tweets delivered to your inbox, every Thursday." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
          <div className="header">
            <h1 className="title-header">
              Twitter Newsletter
            </h1>
          </div>

          <div className='content-container'>
            <p>We&apos;ve all saved a funny tweet, or an interesting insight, thinking &quot;oh i&apos;ll check that out later.&quot;
              But later never comes. So i programmed this to read your bookmarks and send them to you in a weekly email. 
              <br />
              Privacy warning 
              You can see the source code <a href="https://github.com/rprend/twitter-bookmarks">here</a>
            </p>
            {!session && <>
              <button onClick={() => signIn('twitter')}>Sign up with twitter</button>
            </>}
              
            {session &&
            <div>
              <p>Please enter the email you&apos;d like to send the newsletter to</p>
              <form onSubmit={handleSubmit} method="POST">
                <input type="email" placeholder="Email" name="email" required />
                <button type="submit">Sign Up for the Newsletter!</button>
              </form>
            </div>
            }

            {session && 
            <p>
              Signed in as {session.user.name} <br />
              <button onClick={() => signOut()}>Sign out</button>
            </p>
            }

          </div>        
  
        {loading && <p>Loading...</p>}

        
        {bookmarks && <>
          <ul>
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id}>{bookmark.text}</li>
            ))
            }
          </ul>
        </>}

      </main>

    </div>
  )
}
