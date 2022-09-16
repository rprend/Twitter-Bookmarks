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

  /*
  * Sample response from Twitter OAuth 2.0:
  Data:  {
    token: {
      name: 'Ryan',
      email: undefined,
      picture: '<PIC_LINK>',
      sub: '123456789',
    },
    user: {
      id: '123456789',
      name: 'Ryan',
      email: undefined,
      image: 'IMG_LINK'
    },
    account: {
      provider: 'twitter',
      type: 'oauth',
      providerAccountId: '123456789',
      token_type: 'bearer',
      expires_at: 123456789,
      access_token: '123456789',
      scope: 'users.read tweet.read offline.access bookmark.read',
      refresh_token: '123456789',
    },
    profile: {
      data: {
        profile_image_url: 'IMG_LINK',
        id: '123456789',
        username: 'pseudorandom',
        name: 'Ryan'
      }
    },
    isNewUser: undefined
  }
  */
  callbacks: {
    async jwt({token, user, account={}, profile, isNewUser}) {
      // We want to return a token which containts an object called 
      // provider (eg Twitter), along with the access_token and
      // the refresh_token. 
      if (account.provider && !token[account.provider] ) {
        token[account.provider] = {};
      }

      if (account.access_token) {
        token[account.provider].access_token = account.access_token;
      }

      if (account.refresh_token) {
        token[account.provider].refresh_token = account.refresh_token;
      }

      return token
    },
    secret: process.env.NEXTAUTH_SECRET,

  }
}

export default NextAuth(authOptions)
