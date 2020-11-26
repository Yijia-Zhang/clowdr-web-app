/* global Parse */
// ^ for eslint

const { callWithRetry, validateRequest } = require("./utils");
const { isUserInRoles, getRoleByName } = require("./role");
const { getProfileOfUser, getUserProfileById } = require("./user");
const { getConfig } = require("./config");
const { createTextChat } = require("./textChat");
const Twilio = require("twilio");
const { logRequestError } = require("./errors");


async function getRouletteRoom(data) {
    let userId = data.params.userId;
    let id;
    let roomQuery = new Parse.Query("VideoRoom");
    roomQuery
        .equalTo("mode", "roulette");
    const roomResults = await(await roomQuery.find({ useMasterKey: true })).filter(room => room.get("participants").length === 1);
    if (roomResults.length !== 0) {
        const historyQuery = new Parse.Query("RouletteHistory");
        const historyResult =  await (await historyQuery.find({ useMasterKey: true })).filter(history => history.get("participants").includes(userId));
        let set = new Set();
        for (let i = 0; i < historyResult.length; i++) {
            set.add(historyResult[i].get("participants")[0]);
            set.add(historyResult[i].get("participants")[1]);
        }
        for (let i = 0; i < roomResults.length; i++) {
            if (!set.has(roomResults[i].get("participants")[0])) {
                id = roomResults[i].id;
                let newObject = new Parse.Object("RouletteHistory", {
                    conference: roomResults[i].get("conference"),
                    participants: [roomResults[i].get("participants")[0],userId],
                    connected: false
                });
                await newObject.save(null, { useMasterKey: true });
                break;
            }
        }
    }
    return id;
}

Parse.Cloud.define("getRouletteRoom", getRouletteRoom);