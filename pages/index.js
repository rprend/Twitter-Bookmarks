import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
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
    <div className={styles.container}>
      <Head>
        <title>Twitter Newsletter</title>
        <meta name="description" content="Five bookmarked tweets delivered to your inbox, every Thursday." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Twitter Newsletter
        </h1>

        <div>
          <button onClick={send_email}>Send Email</button>
        </div>

        <div>
          <button onClick={run_cron}>Run Cron</button>
        </div>
        {session &&
        <div>
          <form onSubmit={handleSubmit} method="POST">
            <input type="email" placeholder="Email" name="email" required />
            <button type="submit">Sign Up for the Newsletter!</button>
          </form>
        </div>
        }
        
        <p className={styles.description}>
        {session && <>
            Signed in as {session.user.name} <br />
            <button onClick={() => signOut()}>Sign out</button>
            <button onClick={get_bookmarks}>Get Twitter Bookmarks</button>
         </>}
        </p>

        {loading && <p>Loading...</p>}

        {!session && <>
          Not signed in <br />
          <button onClick={() => signIn('twitter')}>Sign in</button>
        </>}
        
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
