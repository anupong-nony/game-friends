import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAcRatG8t0HBhUVjIGYyey6OCAi14iNAos",
    authDomain: "game-friends-58035.firebaseapp.com",
    databaseURL: "https://game-friends-58035-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "game-friends-58035",
    storageBucket: "game-friends-58035.firebasestorage.app",
    messagingSenderId: "9895204528",
    appId: "1:9895204528:web:d0b0c23b401417c90acd75"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

function createEmailFromUsername(username) {
    return username.trim().toLowerCase() + "@friendgames.local";
}

registerBtn.addEventListener("click", async () => {

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        message.textContent = "กรุณากรอก Username และ Password";
        return;
    }

    try {
        const email = createEmailFromUsername(username);

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.textContent = "สมัครสมาชิกสำเร็จ!";

    } catch (error) {
        console.error(error);

        if (error.code === "auth/email-already-in-use") {
            message.textContent = "Username นี้มีผู้ใช้งานแล้ว";
        } else if (error.code === "auth/weak-password") {
            message.textContent = "Password ต้องมีอย่างน้อย 6 ตัวอักษร";
        } else {
            message.textContent = "สมัครสมาชิกไม่สำเร็จ";
        }
    }
});

loginBtn.addEventListener("click", async () => {

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        message.textContent = "กรุณากรอก Username และ Password";
        return;
    }

    try {
        const email = createEmailFromUsername(username);

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.textContent = "เข้าสู่ระบบสำเร็จ!";

    } catch (error) {
        console.error(error);
        message.textContent = "Username หรือ Password ไม่ถูกต้อง";
    }
});
