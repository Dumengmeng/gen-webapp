



const fix = ['-', '\\', '/']
let num = 0
let loadTimer = setInterval(() => {
    process.stdout.write(`\r${fix[(num++) % 3]}`)
}, 200)