const DiscordRPC = require('discord-rpc');
const Banner = require('./Lib/banner');
const fs = require('fs');

const config = Object.assign(JSON.parse(fs.readFileSync('./conf.json', 'utf8')));

const AppID = config.appid;
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

let currentArray, channel, details;

function update() {
    if (currentlyAwake()) return setActivity({
        details: config.rpc.awake.details || undefined,
        state: config.rpc.awake.state || undefined,
        largeImageKey: config.rpc.awake.largeImageKey || undefined,
        largeImageText: config.rpc.awake.largeImageText || undefined,
        endTimestamp: config.rpc.awake.endTimestamp ? sleepWhen() : undefined,
        joinSecret: config.rpc.awake.joinButton ? true : false,
        spectateSecret: config.rpc.awake.spectateButton ? true : false
    })
    else if (currentlyAsleep()) return setActivity({
        details: config.rpc.sleep.details || undefined,
        state: config.rpc.sleep.state || undefined,
        largeImageKey: config.rpc.sleep.largeImageKey || undefined,
        largeImageText: config.rpc.sleep.largeImageText || undefined,
        endTimestamp: config.rpc.sleep.endTimestamp ? awakeWhen() : undefined,
        joinSecret: config.rpc.sleep.joinButton ? true : false,
        spectateSecret: config.rpc.sleep.spectateButton ? true : false
    })

}

rpc.on('ready', async() => {
    Banner.render();
    setInterval(function() {
        try {
            update();
        } catch (e) {
            console.log(e)
        }
    }, config.interval * 1000);

});

rpc.login({ clientId: AppID }).catch(console.error);

function setActivity(array) {
    if (JSON.stringify(array, null, 4) == JSON.stringify(currentArray, null, 4)) return; // array == currentArray, prevents API spamming
    currentArray = array;

    let time = new Date();

    array = {
        details: array.details,
        state: array.state,
        startTimestamp: array.startTimestamp ? time : undefined,
        endTimestamp: array.endTimestamp,
        largeImageKey: array.largeImageKey,
        largeImageText: array.largeImageText,
        smallImageKey: array.smallImageKey,
        smallImageText: array.smallImageText,
        partyId: AppID,
        joinSecret: array.joinSecret ? AppID + "JOIN" : undefined,
        spectateSecret: array.spectateSecret ? AppID + "SPEC" : undefined,
        instance: true
    }
    rpc.setActivity(array)
}


/** CURRENTLY ASLEEP FUNCTION **/
function getSleepTimes() {
    let day = (new Date().getHours() > 12 ? ((new Date().getDay() + 1) == 8 ? 1 : new Date().getDay() + 1) : new Date().getDay()) - 1;

    if (config.sleepTime) return config.sleepTime[day]
    else return null;
}

function currentlyAsleep() {
    let sleepTimes = getSleepTimes();

    if (!sleepTimes) return false; // the user don't want the sleep module

    if (new Date().getHours() < sleepTimes[1] || new Date().getHours() >= sleepTimes[0]) {
        return true;
    }
    return false;
}

function awakeWhen() {
    let time = new Date();
    let awakeTime = new Date();

    if (time.getHours() > 12) {
        awakeTime.setDate(awakeTime.getDate() + 1)
    }

    awakeTime.setHours(getSleepTimes()[1], 0, 0, 0);
    return awakeTime;
}


/** CURRENTLY AWAKE FUNCTION **/
function getAwakeTimes() {
    let day = (new Date().getHours() > 12 ? ((new Date().getDay() + 1) == 8 ? 1 : new Date().getDay() + 1) : new Date().getDay()) - 1;

    if (config.awakeTime) return config.awakeTime[day]
    else return null;
}

function currentlyAwake() {
    let awakeTimes = getAwakeTimes();

    if (!awakeTimes) return false; // the user don't want the sleep module

    if (new Date().getHours() < awakeTimes[1] || new Date().getHours() >= awakeTimes[0]) {
        return true;
    }
    return false;
}

function sleepWhen() {
    let time = new Date();
    let sleepTime = new Date();

    if (time.getHours() > 12) {
        sleepTime.setDate(sleepTime.getDate() + 1)
    }

    sleepTime.setHours(getAwakeTimes()[1], 0, 0, 0);
    return sleepTime;
}