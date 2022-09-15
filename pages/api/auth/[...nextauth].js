import NextAuth from 'next-auth'
import TwitterProvider from "next-auth/providers/twitter"

export const authOptions = {
  providers: [
  TwitterProvider({
    clientId: process.env.API_KEY,
    clientSecret: process.env.API_SECRET
  })
  ]
}

export default NextAuth(authOptions)
