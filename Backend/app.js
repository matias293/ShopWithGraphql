const path = require('path')
const express = require('express');
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const {dbConnection} = require('./database/connection')
const auth = require('./middleware/auth')
const {clearImage} = require('./util/clear') 

const app = express();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'images');
  },
  filename: function(req, file, cb) {
      cb(null, uuidv4() + file.originalname )
  }
});
const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null,true)
  } else {
    cb(null,false)
  }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true }));
app.use(
  multer({storage  , fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname,'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
      return res.sendStatus(200)
    }
    next();
});
app.use(auth)
app.put('/post-image', (req,res,next) => {
  console.log(req.isAuth)
  if (!req.isAuth) {
    
    throw new Error('Not authenticated!');
    
  }
  if(!req.file){
    
    return res.status(200).json({message: 'No file provide '})
  }

  if(req.body.oldPath){
   
    clearImage(req.body.oldPath)
  }
    return res.status(201).json({message: 'File stored', filePath: req.file.path.replace("\\" ,"/")})
})



app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql:true,
  customFormatErrorFn: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack ? error.stack.split('\n') : [],
    path: error.path,
  })
})
)

app.use((err,req,res,next) => {
 
  const status = err.statusCode || 500;
  const message = err.message
  const data = err.data
  res.status(status).json({message, data})
})

dbConnection()
  .then(result => {
  app.listen(8080); 

  })
  .catch(err => {
    console.log(err);
  });


  