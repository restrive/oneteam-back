import express from 'express';
import { db } from '../../db';
import bcrypt from 'bcrypt';

import md5 from 'md5';
import verify from '../../utils/verify';
import uploadFile from '../../utils/uploadFile';
import { cLog } from '../../utils/logger';
import jsonDecoder from '../../utils/jsonDecoder';
import statusCode from '../../utils/statusCodeSender';
import { getAsanaUsers } from '../../utils/asanaData';
import { calculateBaseRating ,getPastPenalties} from '../../utils/asanaRatings';
const router = express.Router();
// viewuserinfo queries the database on the user using the id located in the accessToken
// Statuscode.CodeSender grabs a list of statuscode from the relative json file and returns that code in PROD while in DEV it returns the code and a description

// ! User Routes
router.get('/viewUserRatings', async (req, res) => {
    const userArray = [];
    const users = await db.selectAllUsersGid();
    if (users.length < 1) return res.send("no users found");
    for (let i = 0; i < users.length; i++) {
        if (users[i].gid) {
            const user = await db.selectSingleUserRating(users[i].gid, new Date());
            if (user !== false) {
                const penalties = await getPastPenalties(users[i].gid);
                if (users[i].status === 1) {
                    user[0].name = users[i].name;
                    user[0].day = user[0].day.toString();
                    user[0].penalties = penalties[0];
                    userArray.push(user[0]);
                }
            }

        }
    }
    return res.send(userArray);
});


export = router;



