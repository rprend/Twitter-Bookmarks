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

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
