const SHAROOD_AREA_CODE = 87330000;
const TEHRAN_AREA_CODE = 11320000;
const date = "2026-08-15";

const requestBody = {
    from: SHAROOD_AREA_CODE,
    to: TEHRAN_AREA_CODE,
    // from: TEHRAN_AREA_CODE,
    // to: SHAROOD_AREA_CODE,
    date,
    includeClosed: true,
    includePromotions: true,
    loadFromDbOnUnavailability: true,
    includeUnderDevelopment: true,
};

module.exports = {
    requestBody,
};
