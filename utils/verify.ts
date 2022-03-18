import { db } from '../db';
import jwt from 'jsonwebtoken';
export = {
    user: (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
                if (err) {
                    console.log(err, "verify");
                    return res.sendStatus(403)
                }
                req.user = user
                // console.log(req.user);

                next()
            })
        }
        catch (err) {
            return res.sendStatus(403).send('Token Error');
        }
    },
    admin: async (req: any, res: any, next: any) => {

        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err: any, user: any) => {
                if (err) {
                    console.log(err, "verify");
                    return res.sendStatus(403)
                }

                req.user = user;
                const result = await db.asyncPool(`SELECT * FROM roles WHERE name = 'admin'`,[]);
                if(result.length < 1) {
                    return res.sendStatus(404);
                }

                if (req.user.role_id !== result[0].id) {
                    return res.sendStatus(401);
                }
                next()
            })
        }
        catch (err) {
            return res.sendStatus(403).send('Token Error');
        }
    }
}