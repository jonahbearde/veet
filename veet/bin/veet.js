
const createServer = require('../index')

createServer().listen(4000, () => {
	console.log('Vite app is running at http://localhost:4000'); 
})