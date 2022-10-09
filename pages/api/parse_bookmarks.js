
import search from './twitter/search'

export default async function handler (req, res) {
    const bookmarks = await search(req, res)
    req.json(bookmarks)
}
