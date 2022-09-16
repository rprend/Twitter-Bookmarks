import NextAuth from 'next-auth'
import TwitterProvider from "next-auth/providers/twitter"

export const authOptions = {
  providers: [
  TwitterProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    version: "2.0",
    authorization: {
      url: "https://twitter.com/i/oauth2/authorize",
      params: {
        scope: "users.read tweet.read offline.access bookmark.read",
      },
    },

  })
],
callbacks: {
  async jwt({ token, user, account, profile, isNewUser }) {
    console.log(token)
    console.log(account)
    return token
  }

}
}

export default NextAuth(authOptions)
