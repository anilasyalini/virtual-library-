async function test() {
    try {
        console.log("Testing File Type Filter (pdf)...");
        const resPdf = await fetch('http://localhost:3000/api/resources?fileType=pdf');
        console.log("Status:", resPdf.status);
        const dataPdf = await resPdf.json();
        console.log("PDF count:", dataPdf.length);
        if (dataPdf.length > 0) {
            console.log("First item type:", dataPdf[0].fileType);
        }

        console.log("\nTesting Date Modified Filter (today)...");
        const resToday = await fetch('http://localhost:3000/api/resources?dateRange=today');
        console.log("Status:", resToday.status);
        const dataToday = await resToday.json();
        console.log("Today count:", dataToday.length);
        
        console.log("\nTesting Course Filter (Course=MCA)...");
        const resCourse = await fetch('http://localhost:3000/api/resources?course=MCA');
        console.log("Status:", resCourse.status);
        const dataCourse = await resCourse.json();
        console.log("Course count:", dataCourse.length);
        
    } catch(e) {
        console.error(e);
    }
}
test();
