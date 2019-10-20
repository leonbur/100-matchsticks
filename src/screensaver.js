/* 
screen saver
 */
// const randomColor = () => {
//     const r = Math.random() * 255
//     const g = Math.random() * 255
//     const b = Math.random() * 255
//     return 'rgb(' + r + ',' + g + ',' + b + ')'
// }

// let x = 0
// let y = 0
// let xd = 5
// let yd = 5


// const animateScreenSaver = () => {
//     requestAnimationFrame(animateScreenSaver)

//     c.fillStyle = randomColor()
//     c.fillRect(x, y, xd, yd)

//     if (x > innerWidth || x < 0) {
//         xd = -xd
//     }
//     if (y > innerHeight || y < 0) {
//         yd = -yd
//     }

//     x += xd
//     y += yd

//     // console.log(`x: ${x}, y: ${y}`)
// }

// window.addEventListener('resize', (event) => {
//     canvas.width = window.innerWidth
//     canvas.height = window.innerHeight

//     // init()
// })


// animateScreenSaver()