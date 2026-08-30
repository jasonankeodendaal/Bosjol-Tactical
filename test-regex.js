const str = "data:image/png;base64," + "A".repeat(5000000);
console.log("Start match");
const matches = str.match(/^data:(image\/\w+);base64,(.+)$/);
console.log("End match");
