const rawRest = {
  adminDashboardBackgroundUrl: "http://example.com/image.png",
  admindashboardbackgroundurl: null
};
const mockData = {
  adminDashboardBackgroundUrl: ''
};

const rest: any = {};
for (const k in rawRest) {
    rest[k] = rawRest[k];
    if (k.toLowerCase() !== k) {
        rest[k.toLowerCase()] = rawRest[k];
    }
}

const merged = { ...mockData };
for (const k in mockData) {
    const val = rest[k] !== undefined ? rest[k] : rest[k.toLowerCase()];
    if (val !== null && val !== undefined) {
        (merged as any)[k] = val;
    } else if ((merged as any)[k] !== undefined) {
        (merged as any)[k] = (merged as any)[k];
    }
}
console.log(merged);
