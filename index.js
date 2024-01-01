const express = require("express")
const urlRoute = require("./routes/url")
const {connectToDb} = require("./connect")
const URL = require("./models/url")
const path = require("path")
const staticRouter = require("./routes/staticRouter")
const userRoute = require("./routes/user")
const cookieParser = require("cookie-parser")
const {restrictToLoggedInUsersOnly, checkAuth} = require("./middlewares/auth")

const app = express()
const PORT = 8000

connectToDb("mongodb+srv://harowar2002:karthik@cluster0.ay2kbqx.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("connected to DB")
})

//SSR using EJS
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())

app.use('/url',restrictToLoggedInUsersOnly, urlRoute)
app.use('/',checkAuth, staticRouter)
app.use('/user', userRoute)

app.get("/urls/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  console.log(shortId);

  // Find the URL entry
  const entry = await URL.findOne({ shortId });

  if (!entry) {
    return res.status(404).send("URL not found");
  }

  // Update the visit history
  await URL.updateOne(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  // Redirect to the original URL
  return res.redirect(entry.redirectUrl);
});



app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}` )
})