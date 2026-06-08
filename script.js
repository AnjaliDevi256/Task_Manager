const API_URL = "http://localhost:3000";
let currentUser = "";

// --- AUTH FUNCTIONS ---
async function signup() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;
    const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
}

async function login() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
        currentUser = data.username;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("todo-container").style.display = "block";
        document.getElementById("welcome-msg").innerText = "User: " + currentUser;
        display();
    } else {
        alert(data.message || data.error);
    }
}

function logout() {
    location.reload();
}

// --- TODO FUNCTIONS ---
async function add() {
    let inputField = document.getElementById("t"); // Get the element
    let taskValue = inputField.value; // Get the text

    if (taskValue !== "") {
        const response = await fetch(`${API_URL}/addTask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskName: taskValue, username: currentUser })
        });

        if (response.ok) {
            
            inputField.value = ""; 
            
            
            display(); 
        }
    } else {
        alert("Please enter a task!");
    }
}

async function display() {
    const res = await fetch(`${API_URL}/getTasks/${currentUser}`);
    const tasks = await res.json();
    let r = document.getElementById("r");
    
    r.innerHTML = "<strong>Your Tasks:</strong>";
    
    tasks.forEach((item, index) => {
        //show 'index + 1' so the user sees 1, 2, 3...
        r.innerHTML += `<br><strong>${index + 1}</strong>: ${item.taskName}`;
    });
}

async function del() {
    let input = document.getElementById("t").value;
    await fetch(`${API_URL}/deleteTask`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName: input, username: currentUser })
    });
    display();
}

async function update() {
    let indexInput = document.getElementById("t2");
    let taskInput = document.getElementById("t");
    
    // Convert user's "1-based" number to "0-based" index
    let userNumber = parseInt(indexInput.value);
    let actualIndex = userNumber - 1; 
    
    let newName = taskInput.value;

    const res = await fetch(`${API_URL}/getTasks/${currentUser}`);
    const tasks = await res.json();

    // Check if the number is between 1 and the total number of tasks
    if (userNumber >= 1 && userNumber <= tasks.length && newName !== "") {
        await fetch(`${API_URL}/updateTask`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                index: actualIndex, // Send the 0-based index to the server
                newTaskName: newName, 
                username: currentUser 
            })
        });

        indexInput.value = "";
        taskInput.value = "";
        display(); 
    } else {
        alert(`Please enter a valid task number (1 to ${tasks.length})`);
    }
}