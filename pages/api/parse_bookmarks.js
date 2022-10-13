
import search from './twitter/search'
import supabase from '/utils/supabase'

const MAX_WEEKS = 48

// Time to do a Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
// of an array [0 ... total_tweets]. 
function shuffle_indeces(max_index) {
  var index_array = Array.from(Array(max_index).keys())

  for (var i = index_array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [index_array[i], index_array[j]] = [index_array[j], index_array[i]];
  }

  return index_array
}

function cluster_tweets(tweets) {
  const total_tweets = tweets.length
  var clusters = []
  const cluster_shuffle = shuffle_indeces(total_tweets)

  for (var cluster_idx = 0; cluster_idx * 5 < total_tweets; cluster_idx++) {
    // If there are fewer than 5 tweets left, just add them all to the cluster
    if (total_tweets - (cluster_idx * 5) < 5) {

    }

    const indecies = cluster_shuffle.slice(cluster_idx * 5, (cluster_idx + 1) * 5)
    // Create a 5 tweet long array, consisted of the 5 tweets at the indecies in the indecies array
    const cluster = indecies.map((i) => tweets[i])
    clusters.push(cluster)
  
  }

  return clusters
}

function get_friday(weeks) {
  const date = new Date()
  const day = date.getDay()

  // Friday is 5. So if it's Friday or earlier, we just add however many more days until
  // Friday (5 - that day index). If it's later than Friday, subtract from the next Friday (12 - that day index))
  // Also add in the week index 

  const nth_friday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + (day <= 5 ? 5 - day : 12 - day) + (weeks * 7)
  )

  return nth_friday.toDateString()

}

export default async function handler (req, res) {
    const bookmarks = await search(req, res)

    // const bookmarks = ["a", "b", "c", "d", "e", "f", "g", "h"]

    // CLUSTER BOOKMARKS: Cluster our results into groups of 5 tweets. We 
    // will generate up to the next MAX_WEEKS worth of emails. This is a limitation
    // to look into later, because what we're doing is at sign-up time saving at most MAX_WEEKS*5 random bookmarks into 
    // the database (if they have have, then less). What I want instead is to have the bookmarks sync at with 
    // the twitter API before sending. But this is a "sign up and forget" service, and the twitter API requiers 
    // an active session. So I'm not sure how to do this, and for now I'll stick with generating emails at sign up time.
    const clusters = cluster_tweets(bookmarks.data)

    // Username from twitter api. Email has to come from input cause twitter doesn't give it to us.
    if (!req.body || !req.body.email) {
      res.status(400).send("No email provided")
      return
    }
    const email = req.body.email
    const user = req.body.user ? req.body.user : "Friend"

    var date = null

    var week_index = 0

    // Save to the database.
    // Database fields (type):
    // - user (text)
    // - tweet_list (json) {"tweets": [tweet1, tweet2, tweet3, tweet4, tweet5]}"}
    // - send_date (date)
    // - email (text)
    for (var cluster of clusters) {
      if (week_index >= MAX_WEEKS) {
        break
      }

      date = get_friday(week_index)

      const { data, error } = await supabase
        .from('emails')
        .insert([
          { user: user, email: email, date: date, tweet_list: cluster }
        ])

      if (error) {
        res.status(500).json({ error: error.message })
        return
      }

      week_index += 1
    }

    const data = "success"
    res.status(200).send(data)

}
