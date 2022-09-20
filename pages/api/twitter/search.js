import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'
import Twitter from 'twitter-lite'


const search = async (req, res) => {

    const session = await getSession({ req });
    const token = await getToken({
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    // console.log(session);
    // console.log(token);

    const client = new Twitter({
        version: '2',
        consumer_key: process.env.CLIENT_ID,
        consumer_secret: process.env.CLIENT_SECRET,
        access_token_key: token.twitter.access_token,
        access_token_secret: token.twitter.refresh_token,
        extension: false,
    });

    console.log("URL: ", client.url);
    console.dir(client, {depth: null, colors: true});
    debugger;
    try {
        const results = await client.get(`users/${token.sub}/bookmarks`);

        console.log("RESULTS!!!")
        console.log(results);

        return res.status(200).json({
            status: 'Ok',
            data: results
        });
    } catch(e) {
        console.log("Error")
        console.dir(e, {depth: null, colors: true});
        return res.status(400).json(e);
    }
}

export default search;