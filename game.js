import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// Firebase Config
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAcRatG8t0HBhUVjIGYyey6OCAi14iNAos",

    authDomain:
        "game-friends-58035.firebaseapp.com",

    databaseURL:
        "https://game-friends-58035-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "game-friends-58035",

    storageBucket:
        "game-friends-58035.firebasestorage.app",

    messagingSenderId:
        "9895204528",

    appId:
        "1:9895204528:web:d0b0c23b401417c90acd75"

};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// Admin / GM
// =====================================================

const ADMIN_UIDS = new Set([

    "bxCzpVvfq7gKIKDHUlki3R0Lbyp1",

    "c59sCpa0siW5TBlkTG4oo5NYk6n1"

]);


const GM_UIDS = new Set();


// =====================================================
// Login Session
// =====================================================

const LOGIN_TIME_KEY =
    "gameFriendsLoginTime";

const LOGIN_SESSION_TIME =
    60 * 60 * 1000;


// =====================================================
// Settings
// =====================================================

const INITIAL_COINS =
    199;

const DAILY_LOGIN_REWARD =
    100;


// =====================================================
// State
// =====================================================

let isBusy = false;
let isLeavingAdminPanel = false;


// =====================================================
// Login Elements
// =====================================================

const loginScreen =
    document.getElementById("loginScreen");

const gameCenter =
    document.getElementById("gameCenter");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const registerBtn =
    document.getElementById("registerBtn");

const message =
    document.getElementById("message");

const loginSuccessPopup =
    document.getElementById("loginSuccessPopup");


// =====================================================
// Game Center Elements
// =====================================================

const displayNameElement =
    document.getElementById("displayName");

const friendIdElement =
    document.getElementById("friendId");

const coinAmountElement =
    document.getElementById("coinAmount");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminPanelBtn =
    document.getElementById("adminPanelBtn");

const gmPanelBtn =
    document.getElementById("gmPanelBtn");

const bingoBtn =
    document.getElementById("bingoBtn");

const xoBtn =
    document.getElementById("xoBtn");


// =====================================================
// Profile Elements
// =====================================================

const profileBtn =
    document.getElementById("profileBtn");

const profileModal =
    document.getElementById("profileModal");

const profilePreviewName =
    document.getElementById("profilePreviewName");

const profilePreviewId =
    document.getElementById("profilePreviewId");

const profilePreviewDate =
    document.getElementById("profilePreviewDate");

const displayNameInput =
    document.getElementById("displayNameInput");

const nameExample =
    document.getElementById("nameExample");

const saveNameBtn =
    document.getElementById("saveNameBtn");

const closeProfileBtn =
    document.getElementById("closeProfileBtn");

const profileMessage =
    document.getElementById("profileMessage");

const profileStats =
    document.getElementById("profileStats");

const allStatsBtn =
    document.getElementById("allStatsBtn");

const allStatsModal =
    document.getElementById("allStatsModal");

const allStatsList =
    document.getElementById("allStatsList");

const closeAllStatsBtn =
    document.getElementById("closeAllStatsBtn");


// =====================================================
// Wallet Elements
// =====================================================

const walletBtn =
    document.getElementById("walletBtn");

const walletPreview =
    document.getElementById("walletPreview");

const walletModal =
    document.getElementById("walletModal");

const walletModalBalance =
    document.getElementById("walletModalBalance");

const walletHistory =
    document.getElementById("walletHistory");

const historyAllBtn =
    document.getElementById("historyAllBtn");

const closeWalletBtn =
    document.getElementById("closeWalletBtn");

const walletAllModal =
    document.getElementById("walletAllModal");

const allHistoryList =
    document.getElementById("allHistoryList");

const closeAllHistoryBtn =
    document.getElementById("closeAllHistoryBtn");


// =====================================================
// Register Elements
// =====================================================

const registerModal =
    document.getElementById("registerModal");

const registerUsername =
    document.getElementById("registerUsername");

const registerPassword =
    document.getElementById("registerPassword");

const registerPasswordConfirm =
    document.getElementById(
        "registerPasswordConfirm"
    );

const confirmRegisterBtn =
    document.getElementById(
        "confirmRegisterBtn"
    );

const cancelRegisterBtn =
    document.getElementById(
        "cancelRegisterBtn"
    );

const registerMessage =
    document.getElementById(
        "registerMessage"
    );

const passwordMatchMessage =
    document.getElementById(
        "passwordMatchMessage"
    );


// =====================================================
// Password Toggle
// =====================================================

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;

                    const target =
                        document.getElementById(
                            targetId
                        );

                    if (!target) {

                        return;

                    }

                    if (
                        target.type ===
                        "password"
                    ) {

                        target.type =
                            "text";

                        button.textContent =
                            "🙈";

                    } else {

                        target.type =
                            "password";

                        button.textContent =
                            "👁️";

                    }

                }
            );

        }
    );


// =====================================================
// Username → Firebase Email
// =====================================================

function createEmailFromUsername(
    username
) {

    return (
        username.toLowerCase() +
        "@friendgames.local"
    );

}


// =====================================================
// Validate Username
// =====================================================

function isValidUsername(
    username
) {

    return /^[A-Za-z0-9]{1,20}$/
        .test(username);

}


// =====================================================
// Validate Display Name
// =====================================================

function isValidDisplayName(
    name
) {

    if (!name) {

        return false;

    }

    if (
        name.length < 1 ||
        name.length > 20
    ) {

        return false;

    }

    if (
        /#admin$/i.test(name) ||
        /#gm$/i.test(name)
    ) {

        return false;

    }

    return true;

}


// =====================================================
// GAME NAVIGATION
// =====================================================

if (bingoBtn) {

    bingoBtn.addEventListener(
        "click",
        () => {

            const user =
                auth.currentUser;

            if (!user) {

                return;

            }

            window.location.href =
                "bingo/room/bingo-room.html";

        }
    );

}


if (xoBtn) {

    xoBtn.addEventListener(
        "click",
        () => {

            const user =
                auth.currentUser;

            if (!user) {

                return;

            }

            alert(
                "เกม XO กำลังพัฒนา"
            );

        }
    );

}


// =====================================================
// Show Login Screen
// =====================================================

function showLoginScreen() {

    if (loginScreen) {

        loginScreen.style.display =
            "block";

    }

    if (gameCenter) {

        gameCenter.style.display =
            "none";

    }

}


// =====================================================
// Show Game Center
// =====================================================

function showGameCenterScreen() {

    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }

    if (gameCenter) {

        gameCenter.style.display =
            "block";

    }

}


// =====================================================
// Thailand Date
// =====================================================
//
// ใช้เวลาเครื่อง + บังคับ TimeZone เป็น Asia/Bangkok
// เพื่อป้องกัน THAILAND DATE ERROR
//
// รูปแบบ:
// YYYYMMDD
//
// =====================================================

function getThailandDateKey() {

    try {

        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        "Asia/Bangkok",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit"
                }
            ).formatToParts(
                new Date()
            );


        let year = "";
        let month = "";
        let day = "";


        for (
            const part of parts
        ) {

            if (
                part.type === "year"
            ) {

                year =
                    part.value;

            }

            if (
                part.type === "month"
            ) {

                month =
                    part.value;

            }

            if (
                part.type === "day"
            ) {

                day =
                    part.value;

            }

        }


        if (
            !year ||
            !month ||
            !day
        ) {

            throw new Error(
                "ไม่สามารถอ่านวันที่ประเทศไทยได้"
            );

        }


        return (
            year +
            month +
            day
        );


    } catch (error) {

        console.error(
            "THAILAND DATE ERROR:",
            error
        );


        // Fallback
        // ใช้วันที่เครื่องโดยตรง

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            month +
            day
        );

    }

}


// =====================================================
// Daily Login Reward
// -----------------------------------------------------
// get() + update() แทน runTransaction()
// (transaction ล้มเหลวเงียบๆ บ่อยเมื่อ WebSocket ไม่นิ่ง)
//
// มีความเสี่ยงเล็กน้อยเรื่อง race condition ถ้าผู้เล่น
// login พร้อมกันหลาย tab ในวินาทีเดียวกันเป๊ะ ๆ ซึ่งสำหรับ
// กลุ่มเพื่อนความเสี่ยงนี้ต่ำมาก ยอมรับได้เพื่อแลกกับความ
// เสถียรของระบบ
// =====================================================

async function requestLoginReward(user) {

    if (!user) {

        return false;

    }

    try {

        const dateKey =
            getThailandDateKey();

        const walletRef =
            ref(
                database,
                "wallets/" +
                user.uid
            );

        const snapshot =
            await get(walletRef);

        if (!snapshot.exists()) {

            return false;

        }

        const wallet =
            snapshot.val();

        const transactions =
            wallet.transactions || {};

        const transactionId =
            "login_" +
            dateKey;

        if (
            transactions[transactionId]
        ) {

            // รับรางวัลวันนี้ไปแล้ว

            return false;

        }

        const currentCoins =
            Number(
                wallet.coins || 0
            );

        if (
            !Number.isFinite(
                currentCoins
            )
        ) {

            return false;

        }

        await update(
            walletRef,
            {

                coins:
                    currentCoins +
                    DAILY_LOGIN_REWARD,

                ["transactions/" + transactionId]: {

                    type:
                        "credit",

                    amount:
                        DAILY_LOGIN_REWARD,

                    reason:
                        "Login Reward 100 เหรียญ",

                    timestamp:
                        Date.now()

                }

            }
        );

        return true;

    } catch (error) {

        console.error(
            "LOGIN REWARD ERROR:",
            error
        );

        return false;

    }

}


// =====================================================
// Format Registered Date
// =====================================================

function formatRegisteredDate(
    timestamp
) {

    const date =
        new Date(
            timestamp ||
            Date.now()
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const year =
        String(
            date.getFullYear()
        );

    return (
        day +
        "/" +
        month +
        "/" +
        year
    );

}


// =====================================================
// Role
// =====================================================

function getUserRole(uid) {

    if (
        ADMIN_UIDS.has(uid)
    ) {

        return "Admin";

    }

    if (
        GM_UIDS.has(uid)
    ) {

        return "GM";

    }

    return "Player";

}


// =====================================================
// Display Name
// =====================================================

function createPlayerDisplayName(
    name,
    friendId
) {

    return (
        name.trim() +
        "#" +
        friendId
    );

}


function createGMDisplayName(
    name,
    friendId
) {

    return (
        name.trim() +
        "#" +
        friendId +
        "#GM"
    );

}


function createAdminDisplayName(
    name
) {

    return (
        name.trim() +
        "#Admin"
    );

}


// =====================================================
// Create Display Name By Role
// =====================================================

function createDisplayNameByRole(
    name,
    friendId,
    uid
) {

    const role =
        getUserRole(
            uid
        );


    if (
        role === "Admin"
    ) {

        return createAdminDisplayName(
            name
        );

    }


    if (
        role === "GM"
    ) {

        return createGMDisplayName(
            name,
            friendId
        );

    }


    return createPlayerDisplayName(
        name,
        friendId
    );

}


// =====================================================
// Remove System Suffixes
// =====================================================

function removeSystemNameSuffix(
    displayName,
    friendId,
    uid
) {

    if (!displayName) {

        return "";

    }


    let name =
        String(
            displayName
        ).trim();


    const role =
        getUserRole(
            uid
        );


    if (
        role === "Admin"
    ) {

        if (
            name.endsWith(
                "#Admin"
            )
        ) {

            name =
                name.slice(
                    0,
                    -6
                );

        }


        const parts =
            name.split("#");


        if (
            parts.length >= 2 &&
            parts[
                parts.length - 1
            ] === String(
                friendId
            )
        ) {

            parts.pop();

            name =
                parts.join("#");

        }


        return name;

    }


    if (
        role === "GM"
    ) {

        if (
            name.endsWith(
                "#GM"
            )
        ) {

            name =
                name.slice(
                    0,
                    -3
                );

        }


        const friendSuffix =
            "#" +
            String(
                friendId
            );


        if (
            name.endsWith(
                friendSuffix
            )
        ) {

            name =
                name.slice(
                    0,
                    -friendSuffix.length
                );

        }


        return name;

    }


    const playerSuffix =
        "#" +
        String(
            friendId
        );


    if (
        name.endsWith(
            playerSuffix
        )
    ) {

        return name.slice(
            0,
            -playerSuffix.length
        );

    }


    return name;

}


// =====================================================
// Normalize Existing Display Name
// =====================================================

function normalizeDisplayNameForRole(
    currentDisplayName,
    friendId,
    uid
) {

    const role =
        getUserRole(
            uid
        );


    let baseName =
        removeSystemNameSuffix(
            currentDisplayName,
            friendId,
            uid
        );


    if (!baseName) {

        baseName =
            "My Friend";

    }


    if (
        role === "Admin"
    ) {

        return createAdminDisplayName(
            baseName
        );

    }


    if (
        role === "GM"
    ) {

        return createGMDisplayName(
            baseName,
            friendId
        );

    }


    return createPlayerDisplayName(
        baseName,
        friendId
    );

}


// =====================================================
// Friend ID Counter
// -----------------------------------------------------
// get() + set() แทน runTransaction()
// ความเสี่ยง race condition ต่ำมากสำหรับกลุ่มเพื่อน
// (ไม่มีทางที่ 2 คนสมัครพร้อมกันในเสี้ยววินาทีเดียวกัน)
// =====================================================

async function createFriendId() {

    const counterRef =
        ref(
            database,
            "system/userCounter"
        );

    const snapshot =
        await get(counterRef);

    const current =
        snapshot.exists()
            ? Number(snapshot.val())
            : 0;

    const next =
        Number.isFinite(current)
            ? current + 1
            : 1;

    await set(
        counterRef,
        next
    );

    if (
        next < 1000
    ) {

        return String(
            next
        ).padStart(
            3,
            "0"
        );

    }

    return String(next);

}


// =====================================================
// Create / Repair User + Wallet
// =====================================================

async function createMissingUserData(
    user
) {

    if (!user) {

        throw new Error(
            "ไม่พบ Firebase User"
        );

    }

    const userRef =
        ref(
            database,
            "users/" +
            user.uid
        );

    const walletRef =
        ref(
            database,
            "wallets/" +
            user.uid
        );

    const userSnapshot =
        await get(userRef);

    const walletSnapshot =
        await get(walletRef);


    if (
        !userSnapshot.exists()
    ) {

        const friendId =
            await createFriendId();

        const registeredDate =
            formatRegisteredDate(
                Date.now()
            );

        const username =
            (
                user.email ||
                ""
            )
            .replace(
                "@friendgames.local",
                ""
            )
            .toLowerCase();


        let initialName;


        if (
            ADMIN_UIDS.has(
                user.uid
            )
        ) {

            initialName =
                "Anupong";

        } else {

            initialName =
                "My Friend";

        }


        const userData = {

            uid:
                user.uid,

            username:
                username,

            friendId:
                friendId,

            registeredDate:
                registeredDate,

            displayName:
                createDisplayNameByRole(
                    initialName,
                    friendId,
                    user.uid
                )

        };


        await set(
            userRef,
            userData
        );

    }


    if (
        !walletSnapshot.exists()
    ) {

        const walletData = {

            coins:
                INITIAL_COINS,

            transactions: {

                initial: {

                    type:
                        "credit",

                    amount:
                        INITIAL_COINS,

                    reason:
                        "สมาชิกใหม่",

                    timestamp:
                        Date.now()

                }

            }

        };


        await set(
            walletRef,
            walletData
        );

    }


    const finalUserSnapshot =
        await get(userRef);

    const finalWalletSnapshot =
        await get(walletRef);


    if (
        !finalUserSnapshot.exists()
    ) {

        throw new Error(
            "ไม่สามารถสร้างข้อมูล User ได้"
        );

    }


    if (
        !finalWalletSnapshot.exists()
    ) {

        throw new Error(
            "ไม่สามารถสร้างข้อมูล Wallet ได้"
        );

    }


    return {

        userData:
            finalUserSnapshot.val(),

        walletData:
            finalWalletSnapshot.val()

    };

}


// =====================================================
// Admin / GM Panel Visibility
// =====================================================

function updateAdminPanelVisibility(
    user
) {

    if (!user) {

        if (adminPanelBtn) {

            adminPanelBtn.style.display =
                "none";

        }

        if (gmPanelBtn) {

            gmPanelBtn.style.display =
                "none";

        }

        return;

    }


    const role =
        getUserRole(
            user.uid
        );


    if (
        role === "Admin"
    ) {

        if (adminPanelBtn) {

            adminPanelBtn.style.display =
                "block";

        }

        if (gmPanelBtn) {

            gmPanelBtn.style.display =
                "none";

        }

        return;

    }


    if (
        role === "GM"
    ) {

        if (adminPanelBtn) {

            adminPanelBtn.style.display =
                "none";

        }

        if (gmPanelBtn) {

            gmPanelBtn.style.display =
                "block";

        }

        return;

    }


    if (adminPanelBtn) {

        adminPanelBtn.style.display =
            "none";

    }

    if (gmPanelBtn) {

        gmPanelBtn.style.display =
            "none";

    }

}


// =====================================================
// Show Game Center Data
// =====================================================

async function showGameCenter(
    user
) {

    if (!user) {

        return;

    }

    try {

        const data =
            await createMissingUserData(
                user
            );

        let userData =
            data.userData;


        const friendId =
            userData.friendId ||
            "-";


        const normalizedDisplayName =
            normalizeDisplayNameForRole(
                userData.displayName,
                friendId,
                user.uid
            );


        if (
            userData.displayName !==
            normalizedDisplayName
        ) {

            await set(
                ref(
                    database,
                    "users/" +
                    user.uid +
                    "/displayName"
                ),
                normalizedDisplayName
            );


            userData.displayName =
                normalizedDisplayName;

        }


        displayNameElement.textContent =
            userData.displayName ||
            "-";


        const role =
            getUserRole(
                user.uid
            );


        if (
            role === "Admin"
        ) {

            if (friendIdElement) {

                friendIdElement.textContent =
                    "";

                friendIdElement.style.display =
                    "none";

            }

        } else {

            if (friendIdElement) {

                friendIdElement.textContent =
                    "Friend ID: " +
                    friendId;

                friendIdElement.style.display =
                    "";

            }

        }


        const wallet =
            data.walletData;


        coinAmountElement.textContent =
            Number(
                wallet.coins ||
                0
            );


        renderWalletPreview(
            getTransactions(
                wallet.transactions
            )
        );


        updateAdminPanelVisibility(
            user
        );


        showGameCenterScreen();


        requestLoginReward(
            user
        )
        .then(
            rewardPaid => {

                if (
                    rewardPaid
                ) {

                    return loadWallet(
                        user.uid
                    );

                }

            }
        )
        .catch(
            error => {

                console.error(
                    "BACKGROUND LOGIN REWARD ERROR:",
                    error
                );

            }
        );

    } catch (error) {

        console.error(
            "SHOW GAME CENTER ERROR:",
            error
        );

        showLoginScreen();

        if (message) {

            message.textContent =
                "เข้าสู่ระบบได้ แต่โหลดข้อมูลเกมไม่สำเร็จ";

        }

    }

}


// =====================================================
// Admin Panel
// =====================================================

const adminPanelModal =
    document.getElementById(
        "adminPanelModal"
    );

const closeAdminPanelBtn =
    document.getElementById(
        "closeAdminPanelBtn"
    );

const adminPanelMessage =
    document.getElementById(
        "adminPanelMessage"
    );


// =====================================================
// ADMIN PANEL BUTTON
// =====================================================

if (adminPanelBtn) {

    adminPanelBtn.addEventListener(
        "click",
        () => {

            const user =
                auth.currentUser;

            if (!user) {

                return;

            }


            const role =
                getUserRole(
                    user.uid
                );


            if (
                role !== "Admin"
            ) {

                return;

            }


            isLeavingAdminPanel =
                true;


            window.location.href =
                "panel/admin/admin.html";

        }
    );

}


// =====================================================
// GM PANEL BUTTON
// =====================================================

if (gmPanelBtn) {

    gmPanelBtn.addEventListener(
        "click",
        () => {

            const user =
                auth.currentUser;

            if (!user) {

                return;

            }


            const role =
                getUserRole(
                    user.uid
                );


            if (
                role !== "GM"
            ) {

                return;

            }


            isLeavingAdminPanel =
                true;


            window.location.href =
                "panel/gm/gm.html";

        }
    );

}


// =====================================================
// Close Admin Panel
// =====================================================

if (closeAdminPanelBtn) {

    closeAdminPanelBtn.addEventListener(
        "click",
        () => {

            if (adminPanelModal) {

                adminPanelModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// =====================================================
// Profile
// =====================================================

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;

            if (!user) {

                return;

            }

            try {

                const snapshot =
                    await get(
                        ref(
                            database,
                            "users/" +
                            user.uid
                        )
                    );

                if (
                    !snapshot.exists()
                ) {

                    return;

                }

                const userData =
                    snapshot.val();

                const currentName =
                    userData.displayName ||
                    "";

                const friendId =
                    userData.friendId ||
                    "-";


                profilePreviewName.textContent =
                    currentName;


                const role =
                    getUserRole(
                        user.uid
                    );


                if (
                    role === "Admin"
                ) {

                    profilePreviewId.textContent =
                        "";

                    profilePreviewId.style.display =
                        "none";

                } else {

                    profilePreviewId.textContent =
                        "Friend ID: " +
                        friendId;

                    profilePreviewId.style.display =
                        "";

                }


                profilePreviewDate.textContent =
                    "สมัครเมื่อ: " +
                    (
                        userData.registeredDate ||
                        "-"
                    );


                displayNameInput.value =
                    removeSystemNameSuffix(
                        currentName,
                        friendId,
                        user.uid
                    );


                updateNameExample();


                await loadProfileStats(
                    user.uid
                );


                profileMessage.textContent =
                    "";


                profileModal.classList.add(
                    "show"
                );


                displayNameInput.focus();

            } catch (error) {

                console.error(
                    "PROFILE ERROR:",
                    error
                );

            }

        }
    );

}


// =====================================================
// Name Example
// =====================================================

async function updateNameExample() {

    const name =
        displayNameInput.value.trim();

    const user =
        auth.currentUser;

    if (!user) {

        nameExample.textContent =
            "ชื่อจะแสดงเป็น: -";

        return;

    }

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "users/" +
                    user.uid
                )
            );

        if (
            !snapshot.exists()
        ) {

            return;

        }

        const userData =
            snapshot.val();

        const friendId =
            userData.friendId ||
            "-";


        if (!name) {

            nameExample.textContent =
                "ชื่อจะแสดงเป็น: -";

            return;

        }


        const previewName =
            createDisplayNameByRole(
                name,
                friendId,
                user.uid
            );


        nameExample.textContent =
            "ชื่อจะแสดงเป็น: " +
            previewName;

    } catch (error) {

        console.error(
            "NAME EXAMPLE ERROR:",
            error
        );

    }

}


if (displayNameInput) {

    displayNameInput.addEventListener(
        "input",
        updateNameExample
    );

}


// =====================================================
// Save Name
// =====================================================

if (saveNameBtn) {

    saveNameBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;

            if (!user) {

                profileMessage.textContent =
                    "กรุณาเข้าสู่ระบบ";

                return;

            }


            const inputName =
                displayNameInput.value.trim();


            profileMessage.textContent =
                "";


            if (!inputName) {

                profileMessage.textContent =
                    "กรุณากรอกชื่อ";

                return;

            }


            if (
                inputName.length > 20
            ) {

                profileMessage.textContent =
                    "ชื่อยาวเกิน 20 ตัวอักษร";

                return;

            }


            if (
                !isValidDisplayName(
                    inputName
                )
            ) {

                profileMessage.textContent =
                    "ไม่สามารถใช้ชื่อนี้ได้";

                return;

            }


            saveNameBtn.disabled =
                true;

            saveNameBtn.textContent =
                "กำลังบันทึก...";


            try {

                const userRef =
                    ref(
                        database,
                        "users/" +
                        user.uid
                    );


                const snapshot =
                    await get(userRef);


                if (
                    !snapshot.exists()
                ) {

                    throw new Error(
                        "ไม่พบข้อมูล User"
                    );

                }


                const userData =
                    snapshot.val();


                const friendId =
                    userData.friendId;


                if (!friendId) {

                    throw new Error(
                        "ไม่พบ Friend ID"
                    );

                }


                const newDisplayName =
                    createDisplayNameByRole(
                        inputName,
                        friendId,
                        user.uid
                    );


                await set(
                    ref(
                        database,
                        "users/" +
                        user.uid +
                        "/displayName"
                    ),
                    newDisplayName
                );


                displayNameElement.textContent =
                    newDisplayName;


                profilePreviewName.textContent =
                    newDisplayName;


                const role =
                    getUserRole(
                        user.uid
                    );


                if (
                    role === "Admin"
                ) {

                    profilePreviewId.textContent =
                        "";

                    profilePreviewId.style.display =
                        "none";

                    if (friendIdElement) {

                        friendIdElement.textContent =
                            "";

                        friendIdElement.style.display =
                            "none";

                    }

                } else {

                    profilePreviewId.textContent =
                        "Friend ID: " +
                        friendId;

                    profilePreviewId.style.display =
                        "";


                    if (friendIdElement) {

                        friendIdElement.textContent =
                            "Friend ID: " +
                            friendId;

                        friendIdElement.style.display =
                            "";

                    }

                }


                nameExample.textContent =
                    "ชื่อจะแสดงเป็น: " +
                    newDisplayName;


                profileMessage.textContent =
                    "บันทึกชื่อสำเร็จ ✓";


            } catch (error) {

                console.error(
                    "SAVE NAME ERROR:",
                    error
                );


                profileMessage.textContent =
                    "ไม่สามารถเปลี่ยนชื่อได้";

            } finally {

                saveNameBtn.disabled =
                    false;

                saveNameBtn.textContent =
                    "💾 บันทึกชื่อ";

            }

        }
    );

}


// =====================================================
// Close Profile
// =====================================================

if (closeProfileBtn) {

    closeProfileBtn.addEventListener(
        "click",
        () => {

            profileModal.classList.remove(
                "show"
            );

        }
    );

}


// =====================================================
// Game Statistics
// =====================================================

function normalizeGameStat(
    gameName,
    data
) {

    data =
        data || {};


    const played =
        Number(
            data.played ||
            0
        );


    const wins =
        Number(
            data.wins ||
            0
        );


    const draws =
        Number(
            data.draws ||
            0
        );


    const losses =
        Number(
            data.losses ||
            0
        );


    return {

        gameName:
            gameName,

        played:
            Number.isFinite(
                played
            )
                ? played
                : 0,

        wins:
            Number.isFinite(
                wins
            )
                ? wins
                : 0,

        draws:
            Number.isFinite(
                draws
            )
                ? draws
                : 0,

        losses:
            Number.isFinite(
                losses
            )
                ? losses
                : 0

    };

}


// =====================================================
// Game Name
// =====================================================

function formatGameName(
    key
) {

    const names = {

        xo:
            "❌⭕ XO",

        bingo:
            "🎱 Bingo"

    };


    return (
        names[key] ||
        "🎮 " +
        key
    );

}


// =====================================================
// Load Game Stats
// =====================================================

async function loadGameStats(
    uid
) {

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "users/" +
                    uid +
                    "/gameStats"
                )
            );


        if (
            !snapshot.exists()
        ) {

            return [];

        }


        const data =
            snapshot.val();


        return Object.entries(
            data
        )
            .map(
                ([key, value]) => {

                    return normalizeGameStat(
                        formatGameName(
                            key
                        ),
                        value
                    );

                }
            )
            .filter(
                stat =>
                    stat.played > 0 ||
                    stat.wins > 0 ||
                    stat.draws > 0 ||
                    stat.losses > 0
            )
            .sort(
                (a, b) =>
                    b.played -
                    a.played
            );

    } catch (error) {

        console.error(
            "LOAD GAME STATS ERROR:",
            error
        );

        return [];

    }

}


// =====================================================
// Create Stat Card
// =====================================================

function createStatCard(
    stat,
    full
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        full
            ? "all-stat-card"
            : "profile-stat-card";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        full
            ? "all-stat-game"
            : "profile-stat-game";


    title.textContent =
        stat.gameName;


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "profile-stat-row";


    const played =
        createStatItem(
            "เล่น",
            stat.played
        );


    const wins =
        createStatItem(
            "🏆 ชนะ",
            stat.wins
        );


    const draws =
        createStatItem(
            "🤝 เสมอ",
            stat.draws
        );


    const losses =
        createStatItem(
            "❌ แพ้",
            stat.losses
        );


    row.appendChild(
        played
    );

    row.appendChild(
        wins
    );

    row.appendChild(
        draws
    );

    row.appendChild(
        losses
    );


    card.appendChild(
        title
    );

    card.appendChild(
        row
    );


    return card;

}


// =====================================================
// Create Stat Item
// =====================================================

function createStatItem(
    label,
    value
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "profile-stat-item";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "strong"
        );


    valueElement.textContent =
        value;


    item.appendChild(
        labelElement
    );

    item.appendChild(
        valueElement
    );


    return item;

}


// =====================================================
// Load Profile Stats
// =====================================================

async function loadProfileStats(
    uid
) {

    if (!profileStats) {

        return;

    }


    profileStats.innerHTML =
        "";


    const stats =
        await loadGameStats(
            uid
        );


    if (
        stats.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "profile-no-stats";


        empty.textContent =
            "ยังไม่มีสถิติการเล่น";


        profileStats.appendChild(
            empty
        );


        return;

    }


    const topTwo =
        stats.slice(
            0,
            2
        );


    topTwo.forEach(
        stat => {

            profileStats.appendChild(
                createStatCard(
                    stat,
                    false
                )
            );

        }
    );

}


// =====================================================
// All Stats Button
// =====================================================

if (allStatsBtn) {

    allStatsBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;


            if (!user) {

                return;

            }


            allStatsList.innerHTML =
                "";


            const stats =
                await loadGameStats(
                    user.uid
                );


            if (
                stats.length === 0
            ) {

                allStatsList.textContent =
                    "ยังไม่มีสถิติการเล่น";

            } else {

                stats.forEach(
                    stat => {

                        allStatsList.appendChild(
                            createStatCard(
                                stat,
                                true
                            )
                        );

                    }
                );

            }


            allStatsModal.classList.add(
                "show"
            );

        }
    );

}


// =====================================================
// Close All Stats
// =====================================================

if (closeAllStatsBtn) {

    closeAllStatsBtn.addEventListener(
        "click",
        () => {

            allStatsModal.classList.remove(
                "show"
            );

        }
    );

}


// =====================================================
// Transaction Date
// =====================================================

function formatTransactionDate(
    timestamp
) {

    if (!timestamp) {

        return "-";

    }


    const date =
        new Date(timestamp);


    const parts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    "Asia/Bangkok",

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    false
            }
        ).formatToParts(
            date
        );


    let day = "";
    let month = "";
    let year = "";
    let hour = "";
    let minute = "";


    for (
        const part of parts
    ) {

        if (
            part.type === "day"
        ) {

            day =
                part.value;

        }

        if (
            part.type === "month"
        ) {

            month =
                part.value;

        }

        if (
            part.type === "year"
        ) {

            year =
                part.value;

        }

        if (
            part.type === "hour"
        ) {

            hour =
                part.value;

        }

        if (
            part.type === "minute"
        ) {

            minute =
                part.value;

        }

    }


    return (
        day +
        "/" +
        month +
        "/" +
        year +
        " " +
        hour +
        ":" +
        minute
    );

}


// =====================================================
// Transactions
// =====================================================

function getTransactions(
    transactions
) {

    if (!transactions) {

        return [];

    }


    return Object.entries(
        transactions
    )
        .map(
            ([id, data]) => {

                return {

                    id:
                        id,

                    ...data

                };

            }
        )
        .sort(
            (a, b) =>
                (
                    b.timestamp ||
                    0
                ) -
                (
                    a.timestamp ||
                    0
                )
        );

}


// =====================================================
// Transaction Item
// =====================================================

function renderTransactionItem(
    transaction
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "wallet-history-item";


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "transaction-info";


    const reason =
        document.createElement(
            "div"
        );


    reason.className =
        "transaction-reason";


    reason.textContent =
        transaction.reason ||
        "รายการ Wallet";


    const date =
        document.createElement(
            "div"
        );


    date.className =
        "transaction-date";


    date.textContent =
        formatTransactionDate(
            transaction.timestamp
        );


    info.appendChild(
        reason
    );


    info.appendChild(
        date
    );


    const amount =
        document.createElement(
            "div"
        );


    amount.className =
        "transaction-amount " +
        (
            transaction.type ===
            "credit"
                ? "credit"
                : "debit"
        );


    const number =
        Number(
            transaction.amount ||
            0
        );


    amount.textContent =
        (
            transaction.type ===
            "credit"
                ? "+"
                : "-"
        ) +
        number +
        " 🪙";


    item.appendChild(
        info
    );


    item.appendChild(
        amount
    );


    return item;

}


// =====================================================
// Wallet Preview
// =====================================================

function renderWalletPreview(
    transactions
) {

    if (!walletPreview) {

        return;

    }


    walletPreview.innerHTML =
        "";


    const latest =
        transactions.slice(
            0,
            4
        );


    if (
        latest.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.textContent =
            "ยังไม่มีประวัติ";


        empty.style.fontSize =
            "11px";


        empty.style.color =
            "#888";


        walletPreview.appendChild(
            empty
        );


        return;

    }


    latest.forEach(
        transaction => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "wallet-preview-item " +
                (
                    transaction.type ===
                    "credit"
                        ? "credit"
                        : "debit"
                );


            const reason =
                document.createElement(
                    "span"
                );


            reason.textContent =
                transaction.reason ||
                "รายการ";


            const amount =
                document.createElement(
                    "strong"
                );


            const number =
                Number(
                    transaction.amount ||
                    0
                );


            amount.textContent =
                (
                    transaction.type ===
                    "credit"
                        ? "+"
                        : "-"
                ) +
                number;


            row.appendChild(
                reason
            );


            row.appendChild(
                amount
            );


            walletPreview.appendChild(
                row
            );

        }
    );

}


// =====================================================
// Wallet Button
// =====================================================

if (walletBtn) {

    walletBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;


            if (!user) {

                return;

            }


            try {

                await loadWallet(
                    user.uid
                );


                walletModalBalance.textContent =
                    coinAmountElement.textContent +
                    " 🪙";


                walletHistory.innerHTML =
                    "";


                const snapshot =
                    await get(
                        ref(
                            database,
                            "wallets/" +
                            user.uid
                        )
                    );


                if (
                    snapshot.exists()
                ) {

                    const wallet =
                        snapshot.val();


                    const transactions =
                        getTransactions(
                            wallet.transactions
                        );


                    const latest =
                        transactions.slice(
                            0,
                            10
                        );


                    if (
                        latest.length === 0
                    ) {

                        walletHistory.textContent =
                            "ยังไม่มีประวัติ";

                    } else {

                        latest.forEach(
                            transaction => {

                                walletHistory.appendChild(
                                    renderTransactionItem(
                                        transaction
                                    )
                                );

                            }
                        );

                    }

                } else {

                    walletHistory.textContent =
                        "ยังไม่มี Wallet";

                }


                walletModal.classList.add(
                    "show"
                );

            } catch (error) {

                console.error(
                    "WALLET ERROR:",
                    error
                );

            }

        }
    );

}


// =====================================================
// Load Wallet
// =====================================================

async function loadWallet(
    uid
) {

    const snapshot =
        await get(
            ref(
                database,
                "wallets/" +
                uid
            )
        );


    if (
        !snapshot.exists()
    ) {

        coinAmountElement.textContent =
            "0";


        if (walletPreview) {

            walletPreview.innerHTML =
                "";

        }


        return;

    }


    const wallet =
        snapshot.val();


    const coins =
        Number(
            wallet.coins ||
            0
        );


    coinAmountElement.textContent =
        coins;


    renderWalletPreview(
        getTransactions(
            wallet.transactions
        )
    );

}


// =====================================================
// Close Wallet
// =====================================================

if (closeWalletBtn) {

    closeWalletBtn.addEventListener(
        "click",
        () => {

            walletModal.classList.remove(
                "show"
            );

        }
    );

}


// =====================================================
// All Wallet History
// =====================================================

if (historyAllBtn) {

    historyAllBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;


            if (!user) {

                return;

            }


            allHistoryList.innerHTML =
                "";


            try {

                const snapshot =
                    await get(
                        ref(
                            database,
                            "wallets/" +
                            user.uid
                        )
                    );


                if (
                    !snapshot.exists()
                ) {

                    allHistoryList.textContent =
                        "ยังไม่มีประวัติ";


                    walletAllModal.classList.add(
                        "show"
                    );


                    return;

                }


                const wallet =
                    snapshot.val();


                const transactions =
                    getTransactions(
                        wallet.transactions
                    );


                if (
                    transactions.length === 0
                ) {

                    allHistoryList.textContent =
                        "ยังไม่มีประวัติ";

                } else {

                    transactions.forEach(
                        transaction => {

                            allHistoryList.appendChild(
                                renderTransactionItem(
                                    transaction
                                )
                            );

                        }
                    );

                }


                walletAllModal.classList.add(
                    "show"
                );


            } catch (error) {

                console.error(
                    "ALL WALLET HISTORY ERROR:",
                    error
                );

            }

        }
    );

}


// =====================================================
// Close All History
// =====================================================

if (closeAllHistoryBtn) {

    closeAllHistoryBtn.addEventListener(
        "click",
        () => {

            walletAllModal.classList.remove(
                "show"
            );

        }
    );

}


// =====================================================
// Login Success Popup
// =====================================================

async function showLoginSuccess(
    user
) {

    if (loginSuccessPopup) {

        loginSuccessPopup.classList.add(
            "show"
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    800
                )
        );


        loginSuccessPopup.classList.remove(
            "show"
        );

    }


    await showGameCenter(
        user
    );

}


// =====================================================
// Password Match
// =====================================================

function updatePasswordMatch() {

    const password =
        registerPassword.value;


    const confirmPassword =
        registerPasswordConfirm.value;


    confirmRegisterBtn.disabled =
        true;


    confirmRegisterBtn.classList.remove(
        "password-ok"
    );


    if (
        !password &&
        !confirmPassword
    ) {

        passwordMatchMessage.textContent =
            "";

        return;

    }


    if (
        password.length < 8
    ) {

        passwordMatchMessage.textContent =
            "Password ต้องมีอย่างน้อย 8 ตัวอักษร";


        passwordMatchMessage.className =
            "password-match-message no-match";


        return;

    }


    if (
        !confirmPassword
    ) {

        passwordMatchMessage.textContent =
            "กรุณายืนยัน Password";


        passwordMatchMessage.className =
            "password-match-message no-match";


        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        passwordMatchMessage.textContent =
            "❌ Password ไม่ตรงกัน";


        passwordMatchMessage.className =
            "password-match-message no-match";


        return;

    }


    passwordMatchMessage.textContent =
        "✓ Password ตรงกัน";


    passwordMatchMessage.className =
        "password-match-message match";


    confirmRegisterBtn.disabled =
        false;


    confirmRegisterBtn.classList.add(
        "password-ok"
    );

}


if (registerPassword) {

    registerPassword.addEventListener(
        "input",
        updatePasswordMatch
    );

}


if (registerPasswordConfirm) {

    registerPasswordConfirm.addEventListener(
        "input",
        updatePasswordMatch
    );

}


// =====================================================
// Register Modal
// =====================================================

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        () => {

            if (isBusy) {

                return;

            }


            registerUsername.value =
                "";


            registerPassword.value =
                "";


            registerPasswordConfirm.value =
                "";


            registerMessage.textContent =
                "";


            passwordMatchMessage.textContent =
                "";


            passwordMatchMessage.className =
                "password-match-message";


            confirmRegisterBtn.disabled =
                true;


            confirmRegisterBtn.classList.remove(
                "password-ok"
            );


            registerModal.classList.add(
                "show"
            );


            registerUsername.focus();

        }
    );

}


// =====================================================
// Cancel Register
// =====================================================

if (cancelRegisterBtn) {

    cancelRegisterBtn.addEventListener(
        "click",
        () => {

            registerModal.classList.remove(
                "show"
            );


            registerUsername.value =
                "";


            registerPassword.value =
                "";


            registerPasswordConfirm.value =
                "";


            registerMessage.textContent =
                "";


            passwordMatchMessage.textContent =
                "";


            passwordMatchMessage.className =
                "password-match-message";

        }
    );

}


// =====================================================
// Register
// =====================================================

if (confirmRegisterBtn) {

    confirmRegisterBtn.addEventListener(
        "click",
        async () => {

            if (isBusy) {

                return;

            }


            const username =
                registerUsername.value.trim();


            const password =
                registerPassword.value;


            const confirmPassword =
                registerPasswordConfirm.value;


            registerMessage.textContent =
                "";


            if (!username) {

                registerMessage.textContent =
                    "กรุณากรอก Username";


                return;

            }


            if (
                !isValidUsername(
                    username
                )
            ) {

                registerMessage.textContent =
                    "Username ใช้ภาษาอังกฤษและตัวเลขเท่านั้น และไม่เกิน 20 ตัว";


                return;

            }


            if (!password) {

                registerMessage.textContent =
                    "กรุณากรอก Password";


                return;

            }


            if (
                password.length < 8
            ) {

                registerMessage.textContent =
                    "Password ต้องมีอย่างน้อย 8 ตัว";


                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                registerMessage.textContent =
                    "Password ไม่ตรงกัน";


                return;

            }


            isBusy =
                true;


            confirmRegisterBtn.disabled =
                true;


            confirmRegisterBtn.textContent =
                "กำลังสมัครสมาชิก...";


            try {

                const cleanUsername =
                    username.toLowerCase();


                const email =
                    createEmailFromUsername(
                        cleanUsername
                    );


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                localStorage.setItem(
                    LOGIN_TIME_KEY,
                    Date.now().toString()
                );


                await createMissingUserData(
                    user
                );


                registerMessage.textContent =
                    "สมัครสมาชิกสำเร็จ!";


                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            800
                        )
                );


                registerModal.classList.remove(
                    "show"
                );


                usernameInput.value =
                    cleanUsername;


                passwordInput.value =
                    "";


                message.textContent =
                    "สมัครสมาชิกสำเร็จ!";


                await showGameCenter(
                    user
                );


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    registerMessage.textContent =
                        "Username นี้มีผู้ใช้งานแล้ว";


                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    registerMessage.textContent =
                        "Username ไม่ถูกต้อง";


                } else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    registerMessage.textContent =
                        "Password ต้องมีอย่างน้อย 8 ตัว";


                } else if (
                    error.code ===
                    "PERMISSION_DENIED"
                    ||
                    (
                        error.message &&
                        error.message
                            .toLowerCase()
                            .includes(
                                "permission denied"
                            )
                    )
                ) {

                    registerMessage.textContent =
                        "Firebase Rules ไม่อนุญาตให้บันทึกข้อมูล";


                } else {

                    registerMessage.textContent =
                        "สมัครสมาชิกไม่สำเร็จ: " +
                        (
                            error.message ||
                            "กรุณาลองใหม่"
                        );

                }


                if (
                    auth.currentUser
                ) {

                    try {

                        await signOut(
                            auth
                        );

                    } catch (
                        signOutError
                    ) {

                        console.error(
                            "SIGNOUT ERROR:",
                            signOutError
                        );

                    }

                }


                localStorage.removeItem(
                    LOGIN_TIME_KEY
                );

            } finally {

                isBusy =
                    false;


                confirmRegisterBtn.disabled =
                    !(
                        registerPassword.value.length >= 8 &&
                        registerPassword.value ===
                        registerPasswordConfirm.value
                    );


                confirmRegisterBtn.textContent =
                    "ยืนยันสมัครสมาชิก";

            }

        }
    );

}


// =====================================================
// Login
// =====================================================

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async () => {

            if (isBusy) {

                return;

            }


            const username =
                usernameInput.value.trim();


            const password =
                passwordInput.value;


            message.textContent =
                "";


            if (
                !username ||
                !password
            ) {

                message.textContent =
                    "กรุณากรอก Username และ Password";


                return;

            }


            if (
                !isValidUsername(
                    username
                )
            ) {

                message.textContent =
                    "Username หรือ Password ไม่ถูกต้อง";


                return;

            }


            isBusy =
                true;


            loginBtn.disabled =
                true;


            loginBtn.textContent =
                "กำลังเข้าสู่ระบบ...";


            try {

                const cleanUsername =
                    username.toLowerCase();


                const email =
                    createEmailFromUsername(
                        cleanUsername
                    );


                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                localStorage.setItem(
                    LOGIN_TIME_KEY,
                    Date.now().toString()
                );


                await showLoginSuccess(
                    user
                );


                message.textContent =
                    "";


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message.textContent =
                        "ไม่พบ Username นี้";


                } else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message.textContent =
                        "Username หรือ Password ไม่ถูกต้อง";


                } else if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message.textContent =
                        "Username หรือ Password ไม่ถูกต้อง";


                } else {

                    message.textContent =
                        "Username หรือ Password ไม่ถูกต้อง";

                }


            } finally {

                isBusy =
                    false;


                loginBtn.disabled =
                    false;


                loginBtn.textContent =
                    "เข้าสู่ระบบ";

            }

        }
    );

}


// =====================================================
// Logout
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            if (isBusy) {

                return;

            }


            try {

                isLeavingAdminPanel =
                    false;

                await signOut(
                    auth
                );


                localStorage.removeItem(
                    LOGIN_TIME_KEY
                );


                showLoginScreen();


                usernameInput.value =
                    "";


                passwordInput.value =
                    "";


                if (adminPanelBtn) {

                    adminPanelBtn.style.display =
                        "none";

                }


                if (friendIdElement) {

                    friendIdElement.style.display =
                        "";

                }


                message.textContent =
                    "ออกจากระบบแล้ว";


            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

            }

        }
    );

}


// =====================================================
// Auth State
// =====================================================

onAuthStateChanged(
    auth,
    async user => {

        if (isBusy) {

            return;

        }


        if (!user) {

            showLoginScreen();


            updateAdminPanelVisibility(
                null
            );


            return;

        }


        const loginTime =
            localStorage.getItem(
                LOGIN_TIME_KEY
            );


        if (!loginTime) {

            await signOut(
                auth
            );


            showLoginScreen();


            return;

        }


        const elapsedTime =
            Date.now() -
            Number(loginTime);


        if (
            elapsedTime >=
            LOGIN_SESSION_TIME
        ) {

            await signOut(
                auth
            );


            localStorage.removeItem(
                LOGIN_TIME_KEY
            );


            showLoginScreen();


            if (message) {

                message.textContent =
                    "หมดเวลาเข้าสู่ระบบ กรุณา Login ใหม่";

            }


            return;

        }


        try {

            await showGameCenter(
                user
            );

        } catch (error) {

            console.error(
                "AUTH STATE ERROR:",
                error
            );


            showLoginScreen();

        }

    }
);


// =====================================================
// Start
// =====================================================

showLoginScreen();
