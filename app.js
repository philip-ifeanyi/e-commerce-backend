require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const bodyParser = require('body-parser')
const morgan = require('morgan');
const authJwt = require('./helpers/verifyJwt')
const errorHandler = require('./helpers/errorHandler')

const productRouter = require('./routes/products');
const categoryRouter = require('./routes/categories');
const userRouter = require('./routes/users');

const app = express()
const baseURL = process.env.BASE_API
const port = process.env.PORT
const dbURL = process.env.DB_URL

//Middlewares
app.use(cors())
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('public/uploads', express.static(__dirname + '/public/uploads'))

//Routes
app.use(`${baseURL}/products`, productRouter)
app.use(`${baseURL}/categories`, categoryRouter)
app.use(`${baseURL}/users`, userRouter)

mongoose.connect(dbURL).then(() => {
  console.log("Database connection established!")
}).catch(err => {
  console.error(err)
});

app.get(baseURL, (req, res) => {
  res.json({message: 'Hello API'})
})

app.listen(port, ()=> {
  console.log('listening on port 3000')
})