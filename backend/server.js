const express = require("express")
const cors = require("cors")
const app = express();
const mongoose = require("mongoose")

const jwt = require("jsonwebtoken")
const { authenticateToken } = require("./utilities")

// Model impots
const User = require("./models/user.model")
const Note = require("./models/note.model")

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI)

const port = process.env.PORT

app.use(express.json())
app.use(cors({ origin: "*" }))

app.get("/", (request, response) => {
  response.json({
    data: "Hello"
  })
})

// Create Account
app.post("/create-account", async (request, response) => {
  const { fullName, email, password} = request.body;
  if(!fullName) {
    response.status(400).json({ error: true, message: "Full name is required" })
  }
  if (!email) {
    return response.status(400).json({ error: true, message: "Email is required" })
  }
  if (!password) {
    return response.status(400).json({ error: true, message: "Password is required" })
  }
  const isUser = await User.findOne({ email: email});

  if (isUser) {
    return response.json({ error: true, message: "User alreasy exist"})
  }
  const user = new User({ fullName, email, password})
  await user.save()

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m"
  })

  return response.json({ error: false, user, accessToken, message: "Registration Successful!"})
})

// Login
app.post("/login", async (request, response) => {
  const { email, password} = request.body;
  if (!email) {
    return response.status(400).json({ message: "Email is required "})
  }
  if (!password) {
    return response.status(400).json({ message: "Password is required "})
  }
  const userInfo = await User.findOne({ email: email})
  if (!userInfo) {
    return response.status(400).json({ message: "User not found"})
  }
  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m"
    })
    return response.json({
      error: false,
      message: "Login Successful",
      email, 
      accessToken
    })
  } else {
    return response.json({
      error: true,
      message: "Invalid Credentials",
    })
  }
})

// Get User
app.get("/get-user", authenticateToken, async (request, response) => {
  const { user } = request.user
  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return response.sendStatus(401)
  }
  return response.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      "_id": isUser._id,
      createdOn: isUser.createdOn
    },
    message: " "
  })
})

// Add Note
app.post("/add-note", authenticateToken, async (request, response) => {
  const { title, content, tags } = request.body
  const { user } = request.user

  if (!title) {
    return response.status(400).json({ error: true, message: "Title is required" })
  }
  if (!content) {
    return response.status(400).json({ error: true, message: "Content is required" })
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id
    })
    await note.save();
    return response.json({
      error: false,
      note,
      message: "Note added successfully"
    })
  } catch (error) {
    return response.status(500).json({
      error: true,
      message: "Internal Server Error"
    })
  }
})

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (request, response) => {
  const noteId = request.params.noteId
  const { title, content, tags, isPinned } = request.body
  const { user } = request.user
  if (!title && !content && !tags) {
    return response.status(400).json({ error: true, message: "No changes provided" })
  }
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })
    if (!note) {
      return response.status(404).json({ error: true, message: "Note not found" })
    }
    if (title) note.title = title
    if (content) note.content = content
    if (tags) note.tags = tags
    if (isPinned) note.isPinned = isPinned
    await note.save()
    return response.json({
      error: false,
      note,
      message: "Note updated successfully"
    })
  } catch (error) {
    return response.status(500).json({
      error: true, 
      message: "Internal server error"
    })
  }
})

// Get All Notes
app.get("/get-all-notes", authenticateToken, async (request, response) => {
  const { user } = request.user
  try {
    const notes = await Note.find({ userId: user._id}).sort({ isPinned: -1})
    return response.json({
      error: false,
      notes,
      message: "All notes retrieved successfully"
    })
  } catch (error) {
    return response.status(500).json({ error: true, message: "Internal server error" })
  }
})

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (request, response) => {
  const noteId = request.params.noteId
  const { user } = request.user

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })
    if (!note) {
      return response.status(404).json({ error: true, message: "Note not found" })
    }
    await Note.deleteOne({ _id: noteId, userId: user._id })
    return response.json({ error: false, message: "Deleted successfully" })
  } catch (error) {
    response.status(500).json({ error: true, message: "Internal server error" })
  }
})

// Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (request, response) => {
  const noteId = request.params.noteId
  const { isPinned } = request.body
  const { user } = request.user
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })
    if (!note) {
      return response.status(404).json({ error: true, message: "Note not found" })
    }
    note.isPinned = isPinned
    await note.save()
    return response.json({
      error: false,
      note,
      message: "Note updated successfully"
    })
  } catch (error) {
    return response.status(500).json({
      error: true, 
      message: "Internal server error"
    })
  }
})

// Search Notes
app.get("/search-notes/", authenticateToken, async (request, response) => {
  const { user } = request.user
  const { query } = request.query

  if (!query) {
    return response.status(400).json({ error: true, message:" Search query is required"})
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        {title: { $regex: new RegExp(query, "i")}},
        {content: { $regex: new RegExp(query, "i")}},
      ]
    })
    return response.json({ error: false, notes: matchingNotes, message: "Notes Retrieved Successfully"})
  } catch (error) {
    return response.status(500).json({ error: true, message: "Internal server error" })
  }
})


app.listen(port);