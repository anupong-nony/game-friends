// =====================================================
// GAME FRIENDS
// BINGO ROOM
// room/bingo-room.js
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    set,
    get,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
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


// =====================================================
// FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// ELEMENTS
// =====================================================

const backBtn =
    document.getElementById("backBtn");

const coinDisplay =
    document.getElementById("coinDisplay");

const openCreateModalBtn =
    document.getElementById("openCreateModalBtn");

const createModal =
    document.getElementById("createModal");

const closeCreateModalBtn =
    document.getElementById("closeCreateModalBtn");

const cancelCreateBtn =
    document.getElementById("cancelCreateBtn");

const roomNameInput =
    document.getElementById("roomName");

const publicBtn =
    document.getElementById("publicBtn");

const privateBtn =
    document.getElementById("privateBtn");

const passwordSection =
    document.getElementById("passwordSection");

const roomPasswordInput =
    document.getElementById("roomPassword");

const createRoomBtn =
    document.getElementById("createRoomBtn");

const createMessage =
    document.getElementById("createMessage");

const roomList =
    document.getElementById("roomList");

const refreshBtn =
    document.getElementById("refreshBtn");


// =====================================================
// PRIVATE ROOM
// =====================================================

const passwordModal =
    document.getElementById("passwordModal");

const privateRoomName =
    document.getElementById("privateRoomName");

const joinPassword =
    document.getElementById("joinPassword");

const joinPrivateBtn =
    document.getElementById("joinPrivateBtn");

const cancelPrivateBtn =
    document.getElementById("cancelPrivateBtn");

const cancelPrivateBtnBottom =
    document.getElementById("cancelPrivateBtnBottom");

const joinMessage =
    document.getElementById("joinMessage");


// =====================================================
// STATE
// =====================================================

let currentUser = null;

let isPrivateRoom = false;

let selectedPrivateRoom = null;


// =====================================================
// CONSTANTS
// =====================================================

const MAX_PLAYERS = 20;

const ROOM_INACTIVE_TIME =
    24 * 60 * 60 * 1000;


// =====================================================
// BACK
// =====================================================

backBtn?.addEventListener(
    "click",
    () => {

        window.location.href =
            "../../index.html";

    }
);


// =====================================================
// CREATE MODAL
// =====================================================

function openCreateModal() {

    if (!createModal) {
        return;
    }

    if (createMessage) {
        createMessage.textContent = "";
    }

    if (roomNameInput) {
        roomNameInput.value = "";
    }

    if (roomPasswordInput) {
        roomPasswordInput.value = "";
    }

    setPublicRoom();

    createModal.classList.add("show");

    setTimeout(
        () => {

            roomNameInput?.focus();

        },
        100
    );

}


function closeCreateModal() {

    createModal?.classList.remove(
        "show"
    );

    if (createMessage) {
        createMessage.textContent = "";
    }

}


openCreateModalBtn?.addEventListener(
    "click",
    openCreateModal
);


closeCreateModalBtn?.addEventListener(
    "click",
    closeCreateModal
);


cancelCreateBtn?.addEventListener(
    "click",
    closeCreateModal
);


createModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            createModal
        ) {

            closeCreateModal();

        }

    }
);


// =====================================================
// ROOM TYPE
// =====================================================

function setPublicRoom() {

    isPrivateRoom = false;

    publicBtn?.classList.add("active");

    privateBtn?.classList.remove("active");

    passwordSection?.classList.remove("show");

    if (roomPasswordInput) {
        roomPasswordInput.value = "";
    }

}


function setPrivateRoom() {

    isPrivateRoom = true;

    privateBtn?.classList.add("active");

    publicBtn?.classList.remove("active");

    passwordSection?.classList.add("show");

}


publicBtn?.addEventListener(
    "click",
    setPublicRoom
);


privateBtn?.addEventListener(
    "click",
    setPrivateRoom
);


// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "../../index.html";

            return;

        }

        currentUser = user;

        await loadPlayerData();

        loadRooms();

    }
);


// =====================================================
// LOAD PLAYER DATA
// =====================================================

async function loadPlayerData() {

    if (!currentUser) {
        return;
    }

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "wallets/" +
                    currentUser.uid
                )
            );

        if (snapshot.exists()) {

            const wallet =
                snapshot.val();

            const coins =
                Number(
                    wallet.coins || 0
                );

            if (coinDisplay) {

                coinDisplay.textContent =
                    "🪙 " +
                    coins;

            }

        }
        else {

            if (coinDisplay) {

                coinDisplay.textContent =
                    "🪙 0";

            }

        }

    }
    catch (error) {

        console.error(
            "LOAD PLAYER ERROR:",
            error
        );

    }

}


// =====================================================
// CREATE ROOM
// =====================================================

createRoomBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        createRoom();

    }
);


async function createRoom() {

    if (!currentUser) {

        if (createMessage) {

            createMessage.textContent =
                "กรุณาเข้าสู่ระบบ";

        }

        return;

    }


    const roomName =
        roomNameInput?.value.trim() || "";

    const password =
        roomPasswordInput?.value || "";


    if (!roomName) {

        if (createMessage) {

            createMessage.textContent =
                "กรุณาตั้งชื่อห้อง";

        }

        roomNameInput?.focus();

        return;

    }


    if (roomName.length > 30) {

        if (createMessage) {

            createMessage.textContent =
                "ชื่อห้องยาวเกิน 30 ตัวอักษร";

        }

        return;

    }


    if (isPrivateRoom) {

        if (
            password.length < 1 ||
            password.length > 10
        ) {

            if (createMessage) {

                createMessage.textContent =
                    "รหัสผ่านต้องมี 1-10 ตัวอักษร";

            }

            roomPasswordInput?.focus();

            return;

        }

    }


    createRoomBtn.disabled = true;

    createRoomBtn.textContent =
        "กำลังสร้างห้อง...";


    try {

        // =================================================
        // LOAD USER
        // =================================================

        const userSnapshot =
            await get(
                ref(
                    database,
                    "users/" +
                    currentUser.uid
                )
            );


        if (!userSnapshot.exists()) {

            throw new Error(
                "ไม่พบข้อมูลผู้เล่น"
            );

        }


        const userData =
            userSnapshot.val();


        const displayName =
            userData.displayName ||
            "Player";


        // =================================================
        // CREATE ROOM
        // =================================================

        const roomsRef =
            ref(
                database,
                "bingoRooms"
            );


        const newRoomRef =
            push(roomsRef);


        const roomId =
            newRoomRef.key;


        const now =
            Date.now();


        const roomData = {

            roomId:
                roomId,

            name:
                roomName,

            type:
                isPrivateRoom
                    ? "private"
                    : "public",

            password:
                isPrivateRoom
                    ? password
                    : "",

            hostUid:
                currentUser.uid,

            hostName:
                displayName,

            players: {

                [currentUser.uid]: {

                    uid:
                        currentUser.uid,

                    displayName:
                        displayName,

                    joinedAt:
                        now,

                    ready:
                        false

                }

            },

            playerCount:
                1,

            maxPlayers:
                MAX_PLAYERS,

            status:
                "waiting",

            drawnNumbers: [],

            latestNumbers: [],

            createdAt:
                now,

            updatedAt:
                now

        };


        // =================================================
        // SAVE ROOM
        // =================================================

        await set(
            newRoomRef,
            roomData
        );


        // =================================================
        // ROOM CREATED
        // → GO TO GAME
        // =================================================

        console.log(
            "BINGO ROOM CREATED:",
            roomId
        );


        goToGame(roomId);

    }
    catch (error) {

        console.error(
            "CREATE ROOM ERROR:",
            error
        );


        if (createMessage) {

            createMessage.textContent =
                "สร้างห้องไม่สำเร็จ: " +
                error.message;

        }


        createRoomBtn.disabled =
            false;

        createRoomBtn.textContent =
            "🎱 สร้างห้อง";

    }

}


// =====================================================
// GO TO GAME
// =====================================================

function goToGame(roomId) {

    if (!roomId) {
        return;
    }


    // =================================================
    // สำคัญมาก
    //
    // bingo-room.html อยู่ใน:
    // /bingo/room/
    //
    // bingo.html อยู่ใน:
    // /bingo/game/
    //
    // ดังนั้นต้องถอยออกจาก room ก่อน
    // =================================================

    const gameUrl =
        new URL(
            "../game/bingo.html",
            window.location.href
        );


    gameUrl.searchParams.set(
        "room",
        roomId
    );


    console.log(
        "GO TO BINGO GAME:",
        gameUrl.href
    );


    window.location.assign(
        gameUrl.href
    );

}


// =====================================================
// LOAD ROOMS
// =====================================================

function loadRooms() {

    if (!currentUser || !roomList) {
        return;
    }


    const roomsRef =
        ref(
            database,
            "bingoRooms"
        );


    onValue(
        roomsRef,

        snapshot => {

            renderRooms(snapshot);

        },

        error => {

            console.error(
                "ROOM LIST ERROR:",
                error
            );


            roomList.innerHTML = "";


            const errorElement =
                document.createElement(
                    "div"
                );


            errorElement.className =
                "empty-room";


            errorElement.textContent =
                "ไม่สามารถโหลดห้องได้";


            roomList.appendChild(
                errorElement
            );

        }
    );

}


// =====================================================
// RENDER ROOMS
// =====================================================

function renderRooms(snapshot) {

    if (!roomList) {
        return;
    }


    roomList.innerHTML = "";


    if (!snapshot.exists()) {

        showEmptyRooms();

        return;

    }


    const rooms =
        snapshot.val();


    const roomEntries =
        Object.entries(rooms);


    const now =
        Date.now();


    const availableRooms =
        roomEntries

            .map(
                ([roomId, room]) => ({
                    roomId,
                    room
                })
            )

            .filter(
                item => {

                    const room =
                        item.room;


                    if (!room) {
                        return false;
                    }


                    if (
                        room.status ===
                        "finished"
                    ) {

                        return false;

                    }


                    if (!room.updatedAt) {
                        return true;
                    }


                    return (
                        now -
                        room.updatedAt
                    ) <
                    ROOM_INACTIVE_TIME;

                }
            )

            .sort(
                (a, b) => {

                    const timeA =
                        a.room.updatedAt ||
                        a.room.createdAt ||
                        0;


                    const timeB =
                        b.room.updatedAt ||
                        b.room.createdAt ||
                        0;


                    return timeB - timeA;

                }
            );


    if (
        availableRooms.length === 0
    ) {

        showEmptyRooms();

        return;

    }


    availableRooms.forEach(
        item => {

            roomList.appendChild(
                createRoomElement(
                    item.roomId,
                    item.room
                )
            );

        }
    );

}


// =====================================================
// EMPTY
// =====================================================

function showEmptyRooms() {

    if (!roomList) {
        return;
    }


    const empty =
        document.createElement(
            "div"
        );


    empty.className =
        "empty-room";


    empty.textContent =
        "ยังไม่มีห้อง Bingo";


    roomList.appendChild(
        empty
    );

}


// =====================================================
// ROOM ELEMENT
// =====================================================

function createRoomElement(
    roomId,
    room
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "room-item";


    const top =
        document.createElement(
            "div"
        );


    top.className =
        "room-top";


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "room-name";


    name.textContent =
        room.name ||
        "Bingo Room";


    const type =
        document.createElement(
            "div"
        );


    type.className =
        "room-type-label " +
        (
            room.type === "private"
                ? "private-label"
                : "public-label"
        );


    type.textContent =
        room.type === "private"
            ? "🔒 Private"
            : "🌐 Public";


    top.appendChild(name);

    top.appendChild(type);


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "room-info";


    const playerCount =
        Number(
            room.playerCount || 0
        );


    info.textContent =
        "👥 " +
        playerCount +
        "/" +
        MAX_PLAYERS +
        " คน";


    const joinButton =
        document.createElement(
            "button"
        );


    joinButton.className =
        "join-room-btn";


    const isFull =
        playerCount >= MAX_PLAYERS;


    joinButton.textContent =
        isFull
            ? "ห้องเต็ม"
            : "เข้าห้อง";


    joinButton.disabled =
        isFull;


    joinButton.addEventListener(
        "click",
        () => {

            handleJoinRoom(
                roomId,
                room
            );

        }
    );


    item.appendChild(top);

    item.appendChild(info);

    item.appendChild(joinButton);


    return item;

}


// =====================================================
// JOIN ROOM
// =====================================================

function handleJoinRoom(
    roomId,
    room
) {

    if (!currentUser) {
        return;
    }


    const playerCount =
        Number(
            room.playerCount || 0
        );


    if (
        playerCount >= MAX_PLAYERS
    ) {

        return;

    }


    if (
        room.type === "private"
    ) {

        selectedPrivateRoom = {

            roomId:
                roomId,

            room:
                room

        };


        if (privateRoomName) {

            privateRoomName.textContent =
                room.name ||
                "Bingo Room";

        }


        if (joinPassword) {
            joinPassword.value = "";
        }


        if (joinMessage) {
            joinMessage.textContent = "";
        }


        passwordModal?.classList.add(
            "show"
        );


        setTimeout(
            () => {

                joinPassword?.focus();

            },
            100
        );


        return;

    }


    // =================================================
    // PUBLIC
    // =================================================

    goToGame(roomId);

}


// =====================================================
// PRIVATE MODAL
// =====================================================

function closePasswordModal() {

    passwordModal?.classList.remove(
        "show"
    );


    selectedPrivateRoom =
        null;


    if (joinPassword) {
        joinPassword.value = "";
    }


    if (joinMessage) {
        joinMessage.textContent = "";
    }

}


cancelPrivateBtn?.addEventListener(
    "click",
    closePasswordModal
);


cancelPrivateBtnBottom?.addEventListener(
    "click",
    closePasswordModal
);


passwordModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            passwordModal
        ) {

            closePasswordModal();

        }

    }
);


// =====================================================
// PRIVATE JOIN
// =====================================================

joinPrivateBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();


        if (!selectedPrivateRoom) {
            return;
        }


        const password =
            joinPassword?.value || "";


        const room =
            selectedPrivateRoom.room;


        if (
            password !==
            room.password
        ) {

            if (joinMessage) {

                joinMessage.textContent =
                    "❌ รหัสผ่านไม่ถูกต้อง";

            }

            return;

        }


        const roomId =
            selectedPrivateRoom.roomId;


        closePasswordModal();


        goToGame(roomId);

    }
);


// =====================================================
// ENTER KEY
// =====================================================

roomNameInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            createRoom();

        }

    }
);


roomPasswordInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            createRoom();

        }

    }
);


joinPassword?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            joinPrivateBtn?.click();

        }

    }
);


// =====================================================
// REFRESH
// =====================================================

refreshBtn?.addEventListener(
    "click",
    async () => {

        refreshBtn.disabled = true;

        refreshBtn.textContent =
            "⏳";


        try {

            await loadPlayerData();

        }
        finally {

            setTimeout(
                () => {

                    refreshBtn.disabled =
                        false;

                    refreshBtn.textContent =
                        "🔄";

                },
                500
            );

        }

    }
);