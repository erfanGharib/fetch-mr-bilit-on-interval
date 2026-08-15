const axios = require("axios");
const { exec } = require("child_process");
const { requestBody } = require("./configs.js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const url = "https://bus.mrbilit.ir/api/GetBusServices";
const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json-patch+json",
    priority: "u=1, i",
    "sec-ch-ua":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    Referer: "https://mrbilit.com/",
};

let lastBuses = [];

function getDate(bus) {
    return {
        from:
            new Date(bus?.departureTime)?.getHours() +
            ":" +
            new Date(bus?.departureTime)?.getMinutes(),
        to:
            new Date(bus?.arrivalTime)?.getHours() +
            ":" +
            new Date(bus?.arrivalTime)?.getMinutes(),
    };
}

function diffBuses(oldList, newList) {
    const changes = [];

    const oldMap = new Map(oldList.map((b) => [b.id, b]));
    const newMap = new Map(newList.map((b) => [b.id, b]));

    for (const [id, newBus] of newMap.entries()) {
        if (!oldMap.has(id)) {
            changes.push({ type: "added", time: getDate(newBus) });
        } else {
            const oldBus = oldMap.get(id);
            // check for field changes (example: capacity or price)
            if (oldBus.capacity !== newBus.capacity) {
                changes.push({
                    time: getDate(oldBus),
                    type: "capacityChanged",
                    id,
                    from: oldBus.capacity,
                    to: newBus.capacity,
                });

                exec(
                    "open /Users/erfan/Projects/fetch-mr-bilit-on-interval/sound.mp3",
                );
            }
            if (oldBus.price !== newBus.price) {
                changes.push({
                    type: "priceChanged",
                    id,
                    from: oldBus.price,
                    to: newBus.price,
                });
            }
        }
    }

    for (const [id, oldBus] of oldMap.entries()) {
        if (!newMap.has(id)) {
            changes.push({ type: "removed", bus: getDate(oldBus) });
        }
    }

    return changes;
}

async function fetchData() {
    try {
        const res = await axios.post(url, requestBody, { headers });
        const buses = res.data.buses || [];

        if (lastBuses.length > 0) {
            const changes = diffBuses(lastBuses, buses);
            if (changes.length > 0) {
                console.log("🔄 Changes detected:");
                console.dir(changes, { depth: null });
            }
        }
        console.log(`Fetched: ${buses.length} buses`);

        lastBuses = buses;
    } catch (err) {
        console.log("err", err);
        console.error("❌ Error fetching:", err.message);
    }
}

setInterval(fetchData, 60_000);

fetchData();
