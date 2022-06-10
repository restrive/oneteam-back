import * as dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';

import verify from './utils/verify';
import statusCodeSender from "./utils/statusCodeSender";
import {updateTasksTimeout,UpdateTasks,insertAsanaTasks,insertAsanaUsers,getTask,UpdateOverDueTasks,getUnassignedTasks} from "./utils/asanaData";
import {calculateBaseRating,InsertRating,insertUserCurrentRating,getOldScores,updateScores,calculateScoreAVG,ScoreAvg,getPastPenalties} from "./utils/asanaRatings";
// calculateBaseRating(1200136891130799);
// updateScores();
// getOldScores();
// const date1 = new Date('2010-01-01');
// ScoreAvg(1200552057897551,date1);
updateTasksTimeout();
// calculateScoreAVG(1200552057897551);
// insertAsanaTasks();
// getPastPenalties(1200552057897551);
// UpdateOverDueTasks();
// getUnassignedTasks();/
statusCodeSender.start();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

// Import Routes


// Import users
import user from './route/user/user.js'

// Import frontend


// Import admin


// Import Chat


 // Routes Middlewares
app.use('/public', verify.user, express.static('./public'));

// USER ROUTES
app.use('/v1/user', user);
// FRONT END LOG ROUTE

// ADMIN ROUTES

// Chat ROUTES

app.listen(process.env.PORT || 3000, () => { console.log("\u001B[42m\u001B[30m>-", " Started up ", "-<\u001B[0m\u001B[40m"), console.log('> \u001B[32mlistening on port: \u001B[0m' + process.env.PORT || 3000) });