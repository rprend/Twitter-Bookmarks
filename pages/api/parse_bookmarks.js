
import search from './twitter/search'
import supabase from '/utils/supabase'

const MAX_WEEKS = 48

function cluster_tweets(tweets) {
  total_tweets = tweets.length
  
  // Time to do a Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
  // of an array [0 ... totoa_tweets]. Then we can those indes 5 at a time.


  return clusters
}

export default async function handler (req, res) {
    const bookmarks = await search(req, res)
    console.log(bookmarks)
    // CLUSTER BOOKMARKS: Cluster our results into groups of 5 tweets. We 
    // will generate up to the next MAX_WEEKS worth of emails. This is a limitation
    // to look into later, because what we're doing is at sign-up time saving at most MAX_WEEKS*5 random bookmarks into 
    // the database (if they have have, then less). What I want instead is to have the bookmarks sync at with 
    // the twitter API before sending. But this is a "sign up and forget" service, and the twitter API requiers 
    // an active session. So I'm not sure how to do this, and for now I'll stick with generating emails at sign up time.

    // Save to the database.
    // Database fields (type):
    // - user (text)
    // - tweet_list (json) {"tweets": [tweet1, tweet2, tweet3, tweet4, tweet5]}"}
    // - send_date (date)
    // - email (text)
    const { data, error } = await supabase.from('emails').insert([
      {
        tweet_list: {tweets: bookmarks.data},
      }
    ])

    if (error) {
      res.status(500).send(error)
    }
    res.status(200).send(data)

}
