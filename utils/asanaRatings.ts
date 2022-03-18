import { db } from '../db';
import axios from 'axios';
import { cLog } from './logger';
import { User } from '../models/TypeUser';
import { Task } from '../models/TypeTask';

export async function calculateBaseRating(userGid: number, date: Date = new Date(), endDate: Date = new Date()) {
    if (typeof userGid === undefined) return "userGid === undefined";
    let negativePoints = 0;
    let completed = 0;

    const endDateVar: any = new Date(endDate);
    const dateVar: any = new Date(endDate);
    const tagPenalty: any = process.env.Tag_Pentalty;
    const completedPenalty: any = process.env.Completed;
    const reward: any = process.env.Reward;
    endDateVar.setHours(23, 59, 59, 0);

    dateVar.setHours(0, 0, 0, 0);

    const userTasks = await db.selectUserDueTasks(dateVar, userGid, endDateVar);

    const completedTasks = [];
    if (userTasks.length < 1) return 1;
    for (let i = 0; i < userTasks.length; i++) {
        if (userTasks[i].completed === "1" && userTasks[i].scored === 0) {
            completed = completed + parseInt(completedPenalty,10);
            // completedTasks.push(userTasks[i]);
            const resp = await db.updateTaskScored(userTasks[i].gid, 1);
            if (userTasks[i].misc !== null) {
                const misc = JSON.parse(userTasks[i].misc)
                if (misc.tags !== null && typeof misc.tags !== "undefined") {
                    for (let j = 0; j < misc.tags.length; j++) {
                         if (misc.tags && typeof misc.tags !== undefined && misc.tags[j].gid === "1201982702908529") {
                            completed = completed + parseInt(reward,10);
                        }
                    }

                }
            }
        }
    }

    const overDueTasks = await db.selectUserOverDueTasks(userGid, dateVar);

    if (overDueTasks.length < 1) return 1;
    for (let i = 0; i < overDueTasks.length; i++) {

        if (overDueTasks[i].completed === "0" && overDueTasks[i].due_on < dateVar) {
            negativePoints = negativePoints - 1;
        }
        if (overDueTasks[i].misc !== null) {
            const misc = JSON.parse(overDueTasks[i].misc)

            if (misc.tags !== null && typeof misc.tags !== "undefined") {

                for (let j = 0; j < misc.tags.length; j++) {

                    if (misc.tags && typeof misc.tags !== undefined && misc.tags[j].gid === "1201976172399152") {
                        negativePoints = negativePoints - parseInt(tagPenalty,10);
                        console.log('penalty');
                    }
                }

            }
        }

    }

    const rating: any = { "completed": completed, "penalties": negativePoints }

    return rating;
}


export async function CalculateGoal(userGid: number, fromDate: Date, toDate: Date = new Date()) {

    const daysArray = await db.selectUserRating(userGid, fromDate, toDate);
    if (daysArray.length < 1 || daysArray === false) return 0;

    let counter = daysArray.length;
    let sum = 0;
    let divi = 0;
    for (let i = 0; i < daysArray.length; i++) {
        sum += daysArray[i].completed * counter;
        divi += counter;
        counter--;
    }
    sum = sum / divi;
    return sum;

}

export async function CalculateScore(userGid: number, fromDate: Date, toDate: Date = new Date()) {
    const rating = await calculateBaseRating(userGid, toDate, toDate);
    const goal = await CalculateGoal(userGid, fromDate, toDate);

    const date = { "completed": 0, "penalties": 0, "goal": 0, "score": 0 }
    let score = 0;
    score = rating.completed + rating.penalties;
    if (score > 0 && goal > 0) {
        score = score / goal;
        if (score < 0) {
            score = 0;
        }
    } else {
        score = 0
    }
    date.completed = rating.completed;
    date.penalties = rating.penalties;
    date.goal = goal;
    date.score = score;
    return date;
}

export async function InsertRating() {

    const users = await db.selectAllUsersGid();
    if (users.length < 1) return false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].gid) {
            const rating = await calculateBaseRating(users[i].gid);
            const ratingObject = { "rating": rating, "gid": users[i].gid, "closed": 0 };
            /*  const res = await insertUserCurrentRating(users[i].gid, JSON.stringify(ratingObject));
             console.log(res); */
        }
    }

}

export async function calculateScoreAVG(userGid: number, toDate: Date = new Date()) {
    const week1 = new Date(toDate);
    week1.setDate(week1.getDate() - 7);
    const week2 = new Date(toDate);
    week2.setDate(week2.getDate() - 14);
    const week1Array = await db.selectUserRating(userGid, week1, toDate);
    const scoreWaitedAVG = await ScoreAvg(userGid, week2, toDate);
    if (week1Array.length < 1 || week1Array === false) return 0;

    let week1Counter = week1Array.length;
    let week1Sum = 0;
    let week1Divi = 0;
    for (let i = 0; i < week1Array.length; i++) {

        week1Sum += week1Array[i].completed * week1Counter;
        week1Divi += week1Counter;
        week1Counter--;
    }
    week1Sum = week1Sum / week1Divi;
    const date1 = new Date(toDate)
    date1.setDate(date1.getDate() - 8);
    const week2Array = await db.selectUserRating(userGid, week2, toDate);

    if (week2Array.length < 1 || week2Array === false) return 0;

    let week2Counter = week2Array.length;
    let week2Sum = 0;
    let week2Divi = 0;
    for (let i = 0; i < week2Array.length; i++) {

        week2Sum += week2Array[i].completed * week2Counter;
        week2Divi += week2Counter;
        week2Counter--;
    }
    week2Sum = week2Sum / week2Divi;

    const sum = (week1Sum - week2Sum);

    let total = scoreWaitedAVG * sum;
    console.log(week1Sum , week2Sum,total,scoreWaitedAVG);
    total = total + scoreWaitedAVG;
    return total;
}

export async function ScoreAvg(userGid: number, fromDate: Date, toDate: Date = new Date()) {

    const daysArray = await db.selectUserRating(userGid, fromDate, toDate);
    if (daysArray.length < 1 || daysArray === false) return 0;

    let counter = daysArray.length;
    let sum = 0;
    let divi = 0;
    for (let i = 0; i < daysArray.length; i++) {
        sum += daysArray[i].score * counter;
        divi += counter;
        counter--;
    }
    sum = sum / divi;
    return sum * 1000;

}
/* export async function insertUserCurrentRating(userGid: number, rating: string) {

    const ratingArray: any = []; // TODO make models
    const cleanRatingArray: any = [];
    const resp = await db.selectUserRating(userGid);
    const respArray = JSON.parse(resp[0].rating);
    // console.log(respArray,1);

    if (respArray.length >= 1) {
        for (let i = 0; i < respArray.length; i++) {

            if (respArray[i].closed === 1) {
                ratingArray.push(respArray[i])
            }

        }
    }

    ratingArray.push(JSON.parse(rating));
    const insertResp = await db.insertUserRating(userGid, JSON.stringify(ratingArray));
    return insertResp;
} */

export async function insertUserCurrentRating(userGid: number, updating: number = 1, status: number = 0, date: Date, fromDate: Date) {

    // rating = await calculateBaseRating(userGid, date, date);
    // const goal = await CalculateGoal(userGid, fromDate, date);

    const score = await CalculateScore(userGid, fromDate, date);
    const avgScore = await calculateScoreAVG(userGid,date);

    // const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    if (updating === 0) {// insert
        const res = await db.insertUserRating(userGid, status, date, score.completed, score.penalties, score.goal, score.score, avgScore);// TODO get final score

        if (res.affectedRows > 0) {
            return true;
        }
    } else {// update
        const res = await db.updateUserRating(userGid, status, date, score.completed, score.penalties, score.goal, score.score, avgScore);// TODO get final score

        if (res.affectedRows > 0) {
            return true;
        }
    }
}

export async function getOldScores() {

    const users = await db.selectAllUsersGid();

    for (let i = 0; i < users.length; i++) {

        const userTasks = await db.selectUserTask(users[i].gid);

        let temp = new Date();
        for (let x = 0; x < userTasks.length; x++) {

            if (new Date(userTasks[x].completed_at) < temp && userTasks[x].completed === "1") {

                temp = new Date(userTasks[x].completed_at);
            }

        }

        const oldDate: any = new Date(temp);
        const fromDate: any = new Date(temp);
        fromDate.setMonth(fromDate.getMonth() - 1);
        const newDate: any = new Date();
        const diffTime = Math.abs(newDate - oldDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let j = 0; j < diffDays; j++) {

            oldDate.setDate(oldDate.getDate() + 1);
            fromDate.setDate(fromDate.getDate() + 1);

            const res = await insertUserCurrentRating(users[i].gid, 0, 1, oldDate, fromDate);
        }
    }

    // let res = await insertUserCurrentRating(1200552057897551, 1, 1, date, date1);
}

export async function updateScores() {

    const users = await db.selectAllUsersGid();

    for (let i = 0; i < users.length; i++) {
        console.log(`updating ${users[i].gid}`);
        const newDate: any = new Date();
        const fromDate: any = new Date(newDate);
        fromDate.setMonth(fromDate.getMonth() - 1);
        const userRating = await db.selectSingleUserRating(users[i].gid, newDate);

        let status: number = 0;
        if (newDate.getHours() > 22) {
            status = 1;
        }
        if (userRating.length < 1 || userRating === false) {
            const res = await insertUserCurrentRating(users[i].gid, 0, 0, newDate, fromDate);
        } else {
            if (userRating.status !== 1) {
                const res = await insertUserCurrentRating(users[i].gid, 1, 0, newDate, fromDate);
            }
        }



    }

    // let res = await insertUserCurrentRating(1200552057897551, 1, 1, date, date1);
}