import { getSession } from 'next-auth/react'
import { getToken } from 'next-auth/jwt'

const search = async (req, res) => {
    const session = await getSession({ req });
    const token = await getToken({
        req, secret: process.env.NEXTAUTH_SECRET 
    });

    console.log(session);
    console.log(token);

    try {
        return res.status(200).json({
            status: 'Ok',
            data: []
        });
    } catch(e) {
        return res.status(400).json({
            status: e.message
        });
    }
}

export default search;