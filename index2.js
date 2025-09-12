const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// fetch("https://bus.mrbilit.ir/api/GetBusServices", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzcmMiOiIyIiwidWlkIjoiMjYyNDI1MSIsInR5cGUiOiIzIiwidHJ1c3RlZCI6IkZhbHNlIiwidmVyIjoiMSIsImx2bCI6IkxldmVsMSIsImJ1cyI6IjRmIiwidHJuIjoiMTciLCJleHAiOjE3NzE0OTEwMjgsImlzcyI6Imh0dHBzOi8vYXV0aC5tcmJpbGl0LmNvbSJ9.7vwkEZa50h_avvJRdCGE3YpNg6c47sa2DBTVrlF0Zo4",
//     "cache-control": "no-cache",
//     "content-type": "application/json-patch+json",
//     "pragma": "no-cache",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site",
//     "sessionid": "session_d823a8ee-5054-41ca-b55d-869c86cae6c3",
//     "x-playerid": "7b66ef41-851e-4e30-b6ba-7fd9229d2199"
//   },
//   "referrer": "https://mrbilit.com/",
//   "body": "{\"from\":11320000,\"to\":87330000,\"date\":\"2025-09-10\",\"includeClosed\":true,\"includePromotions\":true,\"loadFromDbOnUnavailability\":true,\"includeUnderDevelopment\":true}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "include"
// });

// API config
const url = "https://bus.mrbilit.ir/api/GetBusServices";
const headers = {
  "accept": "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzcmMiOiIyIiwidWlkIjoiMjYyNDI1MSIsInR5cGUiOiIzIiwidHJ1c3RlZCI6IkZhbHNlIiwidmVyIjoiMSIsImx2bCI6IkxldmVsMSIsImJ1cyI6IjRmIiwidHJuIjoiMTciLCJleHAiOjE3NzE0OTEwMjgsImlzcyI6Imh0dHBzOi8vYXV0aC5tcmJpbGl0LmNvbSJ9.7vwkEZa50h_avvJRdCGE3YpNg6c47sa2DBTVrlF0Zo4",
  "cache-control": "no-cache",
  "content-type": "application/json-patch+json",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"macOS\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "sessionid": "session_d823a8ee-5054-41ca-b55d-869c86cae6c3",
  "x-playerid": "7b66ef41-851e-4e30-b6ba-7fd9229d2199"
};

const body = {from:11320000,to:87330000,date:"2025-09-10",includeClosed:true,includePromotions:true,loadFromDbOnUnavailability:true,includeUnderDevelopment:true};

// cache of last buses state
let lastBuses = [];

function getDate(bus) {
  return {
    from: new Date(bus?.from)?.getHours() + ":" + new Date(bus?.from)?.getMinutes(),
    to: new Date(bus?.to)?.getHours() + ":" + new Date(bus?.to)?.getMinutes()
  }
}

// helper to find changes
function diffBuses(oldList, newList) {
  const changes = [];

  const oldMap = new Map(oldList.map((b) => [b.id, b]));
  const newMap = new Map(newList.map((b) => [b.id, b]));

  // check for added or updated
  for (const [id, newBus] of newMap.entries()) {
    if (!oldMap.has(id)) {
      changes.push({ type: "added", bus: newBus });
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

  // check for removed
  for (const [id, oldBus] of oldMap.entries()) {
    if (!newMap.has(id)) {
      changes.push({ type: "removed", bus: getDate(oldBus) });
    }
  }

  return changes;
}

async function fetchData() {
  try {
    const res = await axios.post(url, body, { headers });
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

// run every 5 seconds
console.log("چهارشنبه");
setInterval(fetchData, 120_000);

// initial call
fetchData();
