import { getToken } from "next-auth/jwt"

export default async function search(req, res) {
  const token = await getToken({ req })
  const response = await fetch(
    `https://api.twitter.com/2/users/${token.sub}/bookmarks`,
    { headers: { Authorization: `Bearer ${token.twitter.access_token}` } }
  )
  const data = await response.json()
  return data
}
