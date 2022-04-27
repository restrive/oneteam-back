import mysql from 'mysql';
import md5 from 'md5';
import bcrypt from 'bcrypt';
import { cLog } from '../utils/logger';
import { User } from '../models/TypeUser';
import { Task } from '../models/TypeTask';
type value = string | number | undefined | null;


const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASS,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DB,
    port: parseInt(process.env.MYSQL_PORT, 10),
    timezone: '+02:00'
})
const insertUser: (user: User) => Promise<any> = (user) => {
    return new Promise((resolve, reject) => {

        if (!user) return resolve(false);
        if (!user.gid) return resolve(false);
        if (!user.name) return resolve(false);
        // console.log(email,password);

        pool.query(`INSERT IGNORE INTO users (users.gid,users.name) VALUES (?,?)`, [user.gid, user.name], async (err, res) => {
            if (err) {
                return reject(false);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res[0]);
            }
        })
    });
}
const insertTask: (task: Task, userGid: number, misc?: string) => Promise<any> = (task, userGid, misc) => {
    return new Promise((resolve, reject) => {

        if (!task) return resolve("!task");
        if (!task.gid) return resolve("!task.gid");
        if (!task.name) return resolve("!task.name");
        if (typeof task.name !== "string") return resolve("!task.name");
        // console.log(email,password);

        pool.query(`REPLACE INTO tasks (tasks.gid,tasks.name,tasks.user_gid,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.completed,tasks.due_on,tasks.misc) VALUES (?,n?,?,?,?,?,?,?,?)`, [task.gid, task.name.replace(/[\u0800-\uFFFF]/g, ''), userGid, new Date(task.created_at), new Date(task.modified_at), new Date(task.completed_at), task.completed, task.due_on, misc], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.affectedRows < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}

const UpdateTask: (task: Task, userGid: number, misc?: string) => Promise<any> = (task, userGid, misc) => {
    return new Promise((resolve, reject) => {


        if (!task) return resolve("!task");
        if (!task.gid) return resolve("!task.gid");
        if (!task.name) return resolve("!task.name");
        if (typeof task.name !== "string") return resolve("!task.name");
        // console.log(email,password);
        pool.query(`UPDATE tasks SET tasks.name = ?,tasks.user_gid = ?,tasks.created_at = ?,tasks.modified_at = ?,tasks.completed_at = ?,tasks.completed = ?,tasks.due_on = ?,tasks.misc = ? WHERE tasks.gid = ?`, [task.name.replace(/[\u0800-\uFFFF]/g, ''), userGid, new Date(task.created_at), new Date(task.modified_at), new Date(task.completed_at), task.completed, task.due_on, misc,task.gid], async (err, res) => {
                   //
            if (err) {
                return reject(err);
            }

            if (res.affectedRows < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectAllUsersGid: () => Promise<any> = () => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);

        pool.query(`SELECT users.gid,users.name,users.status FROM users`, [], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectUserModifiedTask: (fromDate: Date, userGid: number) => Promise<any> = (fromDate, userGid) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);

        pool.query(`SELECT tasks.gid,tasks.name,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.due_on,tasks.completed FROM tasks WHERE tasks.modified_at > ? AND tasks.user_gid = ?`, [fromDate, userGid], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectUserTask: (userGid: number) => Promise<any> = (userGid) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);

        pool.query(`SELECT tasks.gid,tasks.name,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.due_on,tasks.completed FROM tasks WHERE tasks.user_gid = ?`, [userGid], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectUserCompletedTasks: (fromDate: Date, userGid: number) => Promise<any> = (fromDate, userGid) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);
        pool.query(`SELECT tasks.gid,tasks.name,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.due_on,tasks.completed FROM tasks WHERE tasks.due_on > ? AND tasks.user_gid = ? AND tasks.completed = 1`, [fromDate, userGid], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectUserDueTasks: (fromDate: Date, userGid: number, endDate: Date) => Promise<any> = (fromDate, userGid, endDate) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);

        pool.query(`SELECT tasks.gid,tasks.name,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.scored,tasks.due_on,tasks.completed,tasks.misc FROM tasks WHERE tasks.modified_at >= ? AND tasks.modified_at <= ? AND tasks.user_gid = ?`, [fromDate, endDate, userGid], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}
const selectUserOverDueTasks: (userGid: number, endDate: Date) => Promise<any> = (userGid, endDate) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);

        pool.query(`SELECT tasks.gid,tasks.name,tasks.created_at,tasks.modified_at,tasks.completed_at,tasks.due_on,tasks.completed,tasks.misc FROM tasks WHERE tasks.due_on < ? AND tasks.Completed = "0" AND tasks.user_gid = ?`, [endDate, userGid], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}

const selectUserRating: (userGid: number, fromDate: Date, date: Date) => Promise<any> = (userGid, fromDate, date) => {
    return new Promise((resolve, reject) => {

        pool.query(`SELECT * FROM days WHERE days.user_id = ? AND days.day >= ? AND days.day <= ? ORDER BY completed DESC`, [userGid, fromDate.toISOString().split('T')[0], date], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}

const selectSingleUserRating: (userGid: number, fromDate: Date) => Promise<any> = (userGid, fromDate) => {
    return new Promise((resolve, reject) => {

        pool.query(`SELECT * FROM days WHERE days.user_id = ? AND days.day = ? LIMIT 1`, [userGid, fromDate.toISOString().split('T')[0]], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })
    });
}

const insertUserRating: (userGid: number, status: number, day: Date, completed: number, penalties: number, goal: number, score: number,scoreAvg: number,avgScore2: number) => Promise<any> = (userGid, status, day, completed, penalties, goal, score, scoreAvg, avgScore2) => {
    return new Promise((resolve, reject) => {
        // console.log(email,password);
        // console.log(userGid, status, day, completed, penalties, goal, score,scoreAvg);
        pool.query(`INSERT INTO days (days.user_id,days.status,days.day,days.completed,days.penalties,days.goal,days.score,days.score_avg,days.score_avg_2) VALUES (?,?,?,?,?,?,?,?,?)`, [userGid, status, day.toISOString().split('T')[0], completed, penalties, goal, score, scoreAvg, avgScore2], async (err, res) => {
            if (err) {
                return resolve(err);
            }

            if (res.affectedRows < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })

        /*  pool.query(`UPDATE days SET days.completed = ?,days.penalties = ?,days.goal = ?,days.score = ? WHERE gid = ? AND `, [], async (err, res) => {
             if (err) {
                 return resolve(err);
             }

             if (res.affectedRows < 1) return resolve(false)
             else {
                 return resolve(res);
             }
         }) */


    });
}

const updateUserRating: (userGid: number, status: number, day: Date, completed: number, penalties: number, goal: number, score: number,scoreAvg: number,avgScore2: number) => Promise<any> = (userGid, status, day, completed, penalties, goal, score, scoreAvg,avgScore2) => {
    return new Promise((resolve, reject) => {
        console.log(avgScore2);
        pool.query(`UPDATE days SET days.status = ?,days.completed = ?,days.penalties = ?,days.goal = ?,days.score = ?,days.score_avg=?,days.score_avg_2=? WHERE user_id = ? AND day = ?`, [status, completed, penalties, goal, score, scoreAvg, avgScore2, userGid, day.toISOString().split('T')[0]], async (err, res) => {
            if (err) {
                return resolve(err);
            }

            if (res.affectedRows < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })

    });
}

const updateTaskScored: (gid: number, scored: number) => Promise<any> = (gid, scored) => {
    return new Promise((resolve, reject) => {

        pool.query(`UPDATE tasks SET tasks.scored = ? WHERE gid = ?`, [scored, gid], async (err, res) => {
            if (err) {
                return resolve(err);
            }

            if (res.affectedRows < 1) return resolve(false)
            else {
                return resolve(res);
            }
        })

    });
}

const AuthGetUser: (email: string, password: any) => Promise<any> = (email, password) => {
    return new Promise((resolve, reject) => {

        if (!email) return resolve(false);
        if (!password) return resolve(false);
        // console.log(email,password);

        pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email], async (err, res) => {
            if (err) {
                return reject(err);
            }

            if (res.length < 1) return resolve(false)
            if (!res[0].password) return resolve(false);
            if (res[0].password === '') return resolve(false);


            const authed: any = await AuthCheckPassword(password.toString(), res[0].password, res[0].id);
            if (authed) {
                delete res.password;
                return resolve(res[0]);
            }
            else {
                return resolve(false);
            }
        })
    });
}

const AuthCheckRefreshtoken: (id: string | number, refreshTokenState: string) => Promise<any> = (id, refreshTokenState) => {
    return new Promise((resolve, reject) => {

        if (id) {
            pool.query('SELECT * FROM users WHERE id=?', [id], (err, res) => {
                if (err) {

                    return resolve(false)
                }
                const userInfo = res[0];

                const userState: string = md5(`${userInfo.id}${userInfo.email}${userInfo.password}${userInfo.updated_at}`);

                if (userState === refreshTokenState) {
                    const returndata = {
                        email: userInfo.email,
                        password: userInfo.pwd
                    };
                    return resolve(returndata);
                } else {

                    return resolve(false);
                }

            })
        }
        else {

            return resolve(false);
        }

    })
}

function AuthCheckPassword(check: string, against: string, id: string | number) {
    return new Promise((resolve, reject) => {
        const hash = bcrypt.hashSync(check, 10);

        if (bcrypt.compareSync(check, against)) {
            return resolve(true)

        } else {

            if (check === against) {
                // console.log("GTEST 14")
                if (id) {
                    // console.log("GTEST 15")
                    pool.query('UPDATE users SET password=? WHERE id=?', [hash, id], (err, res) => {
                        if (err) {
                            return resolve(false)
                        }
                        return resolve(true);
                    })
                }
                else {
                    return resolve(true);
                }
            }
            else {
                return resolve(false);
            }
        }
    })
}

const asyncPool: (sql: string, args: value[]) => Promise<any> = (sql: string, args: value[]) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, args, (err: any, res: any) => {
            if (err) {
                console.log(err)
                return reject(err)
            }
            return resolve(res);
        })
    })
}



export const db = {
    AuthGetUser,
    AuthCheckRefreshtoken,
    asyncPool,
    insertUser,
    selectAllUsersGid,
    insertTask,
    selectUserModifiedTask,
    selectUserCompletedTasks,
    selectUserDueTasks,
    insertUserRating,
    selectUserRating,
    updateUserRating,
    selectUserTask,
    selectUserOverDueTasks,
    updateTaskScored,
    UpdateTask,
    selectSingleUserRating
};
