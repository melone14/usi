const express = require("express");
const app = express();
const User = require("./models/user");
const Comment = require("./models/comment");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require("path");
const { RSA_NO_PADDING } = require("constants");

dotenv.config();
const URL = process.env.MONGO_URL;

mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected with DB!");
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));
// app.use(express.static(__dirname + "/frontend"));
// app.use("/static", express.static("./static/"));
// app.use(express.static("static"));
app.use("/static", express.static("static"));
app.use("/modelss", express.static("modelss"));

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", requireLogin, (req, res) => {
  res.send("This is home page");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/comments", async (req, res) => {
  const comments = await Comment.find()
    .then((comments) => res.json(comments))
    .catch((err) => res.status(400).json("Error: " + err));
  res.send(comments);
  // res.send(comments);
});

app.post("/comment", async (req, res) => {
  const { comment } = req.body;
  const newComment = new Comment({ comment });
  await newComment.save();
  const listofComments = await Comment.find();
  console.log(listofComments);
  res.redirect("/secret");
});

app.post("/logout", (req, res) => {
  // req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.get("/secret", requireLogin, (req, res) => {
  // res.render("index");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});

// <% campground.comments.forEach(function(comment){ %>
//       <div class="row">
//         <div class="col-md-12">
//           <strong><%= comment.author.username %></strong>
//           <span class="pull-right"><%= moment(comment.createdAt).fromNow() %></span>
//           <div>
//            <%= comment.text %>
//            <% if(currentUser && comment.author.id.equals(currentUser._id) || currentUser && currentUser.isAdmin){ %>
//             <div class="pull-right">
//               <a href="/campgrounds/<%=campground._id%>/comments/<%=comment._id%>/edit" class="btn btn-xs btn-warning">EDIT</a>
//               <form class="delete-form" action="/campgrounds/<%=campground._id%>/comments/<%=comment._id%>?_method=DELETE" method="POST">
//                 <button class="btn btn-xs btn-danger">DELETE</button>
//               </form>
//             </div>
//           <% } %>
//           <hr>
//         </div>
//       </div>
//     </div>
//     <% }) %></div>
