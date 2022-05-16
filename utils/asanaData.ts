import { db } from '../db';
import axios from 'axios';
import { cLog } from './logger';
import { User } from '../models/TypeUser';
import { Task } from '../models/TypeTask';
import { updateScores } from './asanaRatings';
export async function getAsanaUsers() {
    let val = false;
    let nextpage: any = {};
    const userArray = [];
    const resp = await axios.get(`https://app.asana.com/api/1.0/users?limit=10&workspace=4671273652034`, {
        headers: {
            Authorization: "Bearer " + process.env.Asana_API_Key
        }
    });
    nextpage = resp.data.next_page;

    for (let i = 0; i < resp.data.data.length; i++) {
        userArray.push(resp.data.data[i]);
    }
    do {
        if (nextpage !== null) {
            const resp1 = await axios.get(nextpage.uri, {
                headers: {
                    Authorization: "Bearer " + process.env.Asana_API_Key
                }
            });
            for (let i = 0; i < resp1.data.data.length; i++) {
                userArray.push(resp1.data.data[i]);
            }
            nextpage = resp1.data.next_page;
        } else {
            val = true;
        }
    } while (val === false)
    cLog("getAsanaUsers", JSON.stringify(userArray));
    return userArray;
}


export async function getUserTask(userGid: number) {
    let val = false;
    let nextpage: any = {};
    const userArray = [];
    const resp = await axios.get(`https://app.asana.com/api/1.0/tasks?opt_fields=modified_at,name,created_at,completed_at,completed,gid,due_on,tags&assignee=${userGid}&limit=100&workspace=4671273652034`, {
        headers: {
            Authorization: "Bearer " + process.env.Asana_API_Key
        }
    });
    nextpage = resp.data.next_page;
    let pagenumber = 1;
    /* cLog("getUserTask", "got page " + pagenumber); */

    for (let i = 0; i < resp.data.data.length; i++) {
        userArray.push(resp.data.data[i]);
    }
    do {
        if (nextpage != null) {
            const resp1 = await axios.get(nextpage.uri, {
                headers: {
                    Authorization: "Bearer " + process.env.Asana_API_Key
                }
            });
            pagenumber++;
            /* cLog("getUserTask", "got page " + pagenumber); */
            for (let i = 0; i < resp1.data.data.length; i++) {
                userArray.push(resp1.data.data[i]);
            }
            nextpage = resp1.data.next_page;
        } else {
            val = true;
            cLog("getUserTask", `Got All (${pagenumber})`);
        }
    } while (val === false)

    return userArray;
}

export async function getModifiedUserTask(fromDate: Date, userGid: number) {
    let val = false;
    let nextpage: any = {};
    const userArray = [];

    const resp = await axios.get(`https://app.asana.com/api/1.0/tasks?opt_fields=modified_at,name,created_at,completed_at,completed,gid,due_on,tags&modified_since=${fromDate.toISOString()}&assignee=${userGid}&limit=100&workspace=4671273652034`, {
        headers: {
            Authorization: "Bearer " + process.env.Asana_API_Key
        }
    });
    nextpage = resp.data.next_page;
    let pagenumber = 1;
    /* cLog("getModifiedUserTask", "got page " + pagenumber); */

    for (let i = 0; i < resp.data.data.length; i++) {
        userArray.push(resp.data.data[i]);
    }
    do {
        if (nextpage != null) {
            const resp1 = await axios.get(nextpage.uri, {
                headers: {
                    Authorization: "Bearer " + process.env.Asana_API_Key
                }
            });
            pagenumber++;
            /* cLog("getModifiedUserTask", "got page " + pagenumber); */
            for (let i = 0; i < resp1.data.data.length; i++) {
                userArray.push(resp1.data.data[i]);
            }
            nextpage = resp1.data.next_page;
        } else {
            val = true;
            // cLog("getModifiedUserTask", `Got All (${pagenumber})`);
        }
    } while (val === false)

    return userArray;
}

export async function insertAsanaUsers() {
    const userArray = await getAsanaUsers();

    for (let i = 0; i < userArray.length; i++) {
        const res = await db.insertUser(userArray[i]);
        if (res === false) {
            return false;
        }
    }
}

export async function insertAsanaTasks() {
    const userArray = await db.selectAllUsersGid();
    if (!userArray) return false;
    cLog("insertAsanaTasks", "inserting user tasks");
    for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].gid) {
            cLog("insertAsanaTasks", userArray[i].gid);
            const userTasks = await getUserTask(userArray[i].gid);


            for (let j = 0; j < userTasks.length; j++) {
                const misc = { "tags": userTasks[j].tags };
                const res = await db.insertTask(userTasks[j], userArray[i].gid, JSON.stringify(misc))

            }
        }
    }
}

export async function UpdateTasks() {
    cLog("UpdateTasks", "tasks update start");
    const userArray = await db.selectAllUsersGid();

    if (!userArray) return false;
    for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].gid) {
            cLog("UpdateTasks", userArray[i].gid);
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const userTasks = await getModifiedUserTask(date, userArray[i].gid);
            const dbTasks = await db.selectUserModifiedTask(date, userArray[i].gid);

            for (let j = 0; j < userTasks.length; j++) {
                let found = false;
                for (let x = 0; x < dbTasks.length; x++) {
                    if (userTasks[j].gid === dbTasks[x].gid.toString()) {
                        found = true;
                    }
                }

                if (found === true) {
                    const misc = { "tags": userTasks[j].tags };

                    const res = await db.UpdateTask(userTasks[j], userArray[i].gid, JSON.stringify(misc));
                } else {
                    const misc = { "tags": userTasks[j].tags };
                    const res = await db.insertTask(userTasks[j], userArray[i].gid, JSON.stringify(misc));
                }
            }
        }
    }
    cLog("UpdateTasks", "taks update end");
    return true;
}

export async function getTask(taskId: number) {
    try {
        const resp = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
            headers: {
                Authorization: "Bearer " + process.env.Asana_API_Key
            }
        });
        // console.log(resp.data);
        if (typeof resp.data.data !== "undefined" && resp.data.data !== null) {
            return resp.data.data;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }

}

export async function UpdateOverDueTasks() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const overDueTasks = await db.selectAllOverDueTasks(date);

    for (let i = 0; i < overDueTasks.length; i++) {
        // console.log(overDueTasks[i].user_gid);
        if (overDueTasks[i].user_gid !== 0) {
            const task = await getTask(overDueTasks[i].gid);

            const misc = { "tags": task.tags };
            let assignee = 0;
            if (task.assignee !== null && typeof task.assignee !== "undefined") {
                assignee = task.assignee.gid
                const res = await db.UpdateTask(task, assignee, JSON.stringify(misc));
                // console.log(task.assignee, res);
            } else {
                const res = await db.UpdateTask(overDueTasks[i], assignee, JSON.stringify(misc));
                // console.log(task.assignee, res);
            }
        }

    }
    return overDueTasks;
}

export async function getUnassignedTasks() {
    console.log("UpdateOverDueTasks");
    await UpdateOverDueTasks();
    setTimeout(() => {
        getUnassignedTasks()
    }, 28800000 )
}
let run = false;
export async function updateTasksTimeout() {
    await UpdateTasks();
    await updateScores();
    if (run === false) {
        getUnassignedTasks();
        run = true;
    }
    setTimeout(() => {
        updateTasksTimeout()
    }, 1200000)
}