require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Connected to Atlas")).catch(err => console.error(" Connection Error:", err));
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Task Schema (Linked to a username)
const TaskSchema = new mongoose.Schema({ 
    taskName: String,
    owner: String // This identifies which user the task belongs to
});
const Task = mongoose.model('Task', TaskSchema);

// 3. AUTHENTICATION ROUTES

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ message: "Username already exists!" });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ message: "Login success", username: user.username });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// 4. TASK ROUTES (Scoped to User)


app.get('/getTasks/:username', async (req, res) => {
    const tasks = await Task.find({ owner: req.params.username });
    res.json(tasks);
});

app.post('/addTask', async (req, res) => {
    const { taskName, username } = req.body;
    const newTask = new Task({ taskName, owner: username });
    await newTask.save();
    res.json({ message: "Saved!" });
});

app.delete('/deleteTask', async (req, res) => {
    const { taskName, username } = req.body;
    await Task.findOneAndDelete({ taskName: taskName, owner: username });
    res.json({ message: "Deleted!" });
});

app.put('/updateTask', async (req, res) => {
    const { index, newTaskName, username } = req.body;
    const tasks = await Task.find({ owner: username });
    
    if (index >= 0 && index < tasks.length) {
        const taskId = tasks[index]._id;
        await Task.findByIdAndUpdate(taskId, { taskName: newTaskName });
        res.json({ message: "Updated successfully!" });
    } else {
        res.status(400).json({ message: "Invalid index!" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));