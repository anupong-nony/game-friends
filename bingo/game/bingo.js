// =====================================================
// GAME FRIENDS
// BINGO GAME
// game/bingo.js
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
    get,
    onValue,
    push,
    set,
    update,
    onDisconnect
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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


// =====================================================
// ROOM
// =====================================================

const urlParams =
    new URLSearchParams(window.location.search);

const roomId =
    urlParams.get("room");


// =====================================================
// SETTINGS
// =====================================================

const BOARD_PRICE = 20;
const MAX_BOARDS = 4;
const FREE_BOARDS = 1;
const MAX_PLAYERS = 20;
const COUNTDOWN_SECONDS = 5;
const PRIZE_CUT_PERCENT = 20;

const ADMIN_UIDS = [
    "bxCzpVvfq7gKIKDHUlki3R0Lbyp1",
    "c59sCpa0siW5TBlkTG4oo5NYk6n1"
];


// =====================================================
// STATE
// =====================================================

let currentUser = null;
let currentUserData = null;
let roomData = null;
let isRoomOwner = false;
let playerCoins = 0;

let boards = [];
let drawnNumbers = [];
let latestNumbers = [];
let players = [];

let gameFinished = false;

let roomListenerStarted = false;
let chatListenerStarted = false;
let disconnectHandlerSet = false;

let currentRoundId = null;

let countdownTimer = null;
let advancingCountdown = false;


// =====================================================
// ELEMENTS
// =====================================================

const boardsContainer =
    document.getElementById("boardsContainer");

const coinDisplay =
    document.getElementById("coinDisplay");

const playerCount =
    document.getElementById("playerCount");

const playerCountBtn =
    document.getElementById("playerCountBtn");

const roomNameElement =
    document.getElementById("roomName");

const roomStatusElement =
    document.getElementById("roomStatus");

const boardCountText =
    document.getElementById("boardCountText");

const buyBoardBtn =
    document.getElementById("buyBoardBtn");

const hostControls =
    document.getElementById("hostControls");

const startGameBtn =
    document.getElementById("startGameBtn");

const drawNumberBtn =
    document.getElementById("drawNumberBtn");

const drawResult =
    document.getElementById("drawResult");

const gameControls =
    document.getElementById("gameControls");

const readyBtn =
    document.getElementById("readyBtn");

const chatInput =
    document.getElementById("chatInput");

const chatSendBtn =
    document.getElementById("chatSendBtn");

const chatMessages =
    document.getElementById("chatMessages");

const latestDrawNumber =
    document.getElementById("latestDrawNumber");

const latestNumbersElement =
    document.getElementById("latestNumbers");

const playerModal =
    document.getElementById("playerModal");

const playerList =
    document.getElementById("playerList");

const closePlayerModalBtn =
    document.getElementById("closePlayerModalBtn");

const leaveRoomBtn =
    document.getElementById("leaveRoomBtn");

const leaveModal =
    document.getElementById("leaveModal");

const cancelLeaveBtn =
    document.getElementById("cancelLeaveBtn");

const confirmLeaveBtn =
    document.getElementById("confirmLeaveBtn");

const chatSection =
    document.getElementById("chatSection");

const chatModal =
    document.getElementById("chatModal");

const expandedChatMessages =
    document.getElementById("expandedChatMessages");

const closeChatModalBtn =
    document.getElementById("closeChatModalBtn");

const winnerModal =
    document.getElementById("winnerModal");

const winnerNameEl =
    document.getElementById("winnerName");

const winnerMessageEl =
    document.getElementById("winnerMessage");

const winnerPrizeEl =
    document.getElementById("winnerPrize");

const winnerConfirmBtn =
    document.getElementById("winnerConfirmBtn");

const winnerConfirmStatus =
    document.getElementById("winnerConfirmStatus");

const bingoCountdownOverlay =
    document.getElementById("bingoCountdownOverlay");

const bingoCountdownNumber =
    document.getElementById("bingoCountdownNumber");

const bingoCountdownText =
    document.getElementById("bingoCountdownText");


if (bingoCountdownText) {

    bingoCountdownText.textContent =
        "เตรียมตัวลุ้นเลข";

}


// =====================================================
// BINGO LETTER
// =====================================================

function getBingoLetter(number) {

    if (number >= 1 && number <= 15) return "B";
    if (number >= 16 && number <= 30) return "I";
    if (number >= 31 && number <= 45) return "N";
    if (number >= 46 && number <= 60) return "G";
    if (number >= 61 && number <= 75) return "O";

    return "";
}


function formatBingoNumber(number) {

    if (typeof number !== "number") {
        return "-";
    }

    return getBingoLetter(number) + number;
}


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

        await loadCurrentUserData();
        await loadPlayerCoins();
        await loadRoom();

    }
);


// =====================================================
// LOAD USER
// =====================================================

async function loadCurrentUserData() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "users/" +
                    currentUser.uid
                )
            );

        if (snapshot.exists()) {

            currentUserData =
                snapshot.val();

        } else {

            currentUserData = {
                displayName: "Player"
            };

        }

    }

    catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

        currentUserData = {
            displayName: "Player"
        };

    }
}


// =====================================================
// LOAD COINS
// =====================================================

async function loadPlayerCoins() {

    if (!currentUser) return;

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

            playerCoins =
                Number(
                    wallet.coins || 0
                );

        } else {

            playerCoins = 0;

        }

        updateCoinDisplay();

    }

    catch (error) {

        console.error(
            "LOAD COINS ERROR:",
            error
        );

    }
}


// =====================================================
// COIN DISPLAY
// =====================================================

function updateCoinDisplay() {

    if (!coinDisplay) return;

    coinDisplay.textContent =
        playerCoins.toLocaleString();

}


// =====================================================
// LOAD ROOM
// =====================================================

async function loadRoom() {

    if (!roomId) {

        alert("ไม่พบ Room ID");

        goBackToRoom();

        return;
    }

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "bingoRooms/" +
                    roomId
                )
            );

        if (!snapshot.exists()) {

            alert(
                "ไม่พบห้อง Bingo นี้"
            );

            goBackToRoom();

            return;
        }

        roomData =
            snapshot.val();

        await joinRoom();

        initializeBoards();

        updateRoomInfo();

        await setupDisconnectHandler();

        subscribeRoom();

        subscribeChat();

    }

    catch (error) {

        console.error(
            "LOAD ROOM ERROR:",
            error
        );

        alert(
            "ไม่สามารถเข้าห้องได้\n" +
            error.message
        );

        goBackToRoom();

    }
}


// =====================================================
// JOIN ROOM
// (get + update แทน runTransaction เพื่อไม่ให้ถูก
//  ยกเลิกเงียบๆ ตอน WebSocket ไม่เสถียร)
// =====================================================

async function joinRoom() {

    if (!currentUser || !roomId) {
        throw new Error(
            "ไม่พบข้อมูลผู้เล่นหรือ Room ID"
        );
    }

    const roomRef =
        ref(
            database,
            "bingoRooms/" +
            roomId
        );

    const snapshot =
        await get(roomRef);

    if (!snapshot.exists()) {

        throw new Error(
            "ไม่พบห้อง Bingo นี้"
        );
    }

    const room =
        snapshot.val();


    if (
        room.players &&
        room.players[currentUser.uid]
    ) {

        return;
    }


    const currentPlayers =
        room.players
            ? Object.keys(room.players)
            : [];


    if (
        currentPlayers.length >=
        MAX_PLAYERS
    ) {

        throw new Error(
            "ห้องเต็มแล้ว (" +
            MAX_PLAYERS +
            " คน)"
        );
    }


    const displayName =
        currentUserData?.displayName ||
        "Player";

    const now =
        Date.now();

    const updates = {};

    updates[
        "players/" +
        currentUser.uid
    ] = {

        uid:
            currentUser.uid,

        displayName:
            displayName,

        joinedAt:
            now,

        ready:
            false,

        winnerAcknowledged:
            false

    };

    updates.playerCount =
        currentPlayers.length + 1;

    updates.updatedAt =
        now;


    await update(
        roomRef,
        updates
    );

}


// =====================================================
// DISCONNECT
// =====================================================

async function setupDisconnectHandler() {

    if (
        disconnectHandlerSet ||
        !currentUser ||
        !roomId
    ) {
        return;
    }

    try {

        const playerRef =
            ref(
                database,
                "bingoRooms/" +
                roomId +
                "/players/" +
                currentUser.uid
            );

        await onDisconnect(
            playerRef
        ).remove();

        disconnectHandlerSet = true;

    }

    catch (error) {

        console.error(
            "ON DISCONNECT ERROR:",
            error
        );

    }
}


// =====================================================
// PHASE HELPER
// -----------------------------------------------------
// lobby      = เห็นปุ่มพร้อม / ซื้อกระดานได้ / host เริ่มเกมได้
// countdown  = กำลังนับถอยหลัง ล็อคทุกปุ่ม
// playing    = กำลังเล่น host สุ่มได้ ผู้เล่นกดตัวเลขได้
// finished   = จบเกม ยังไม่ได้กดตกลง -> โชว์ popup ผู้ชนะ
// =====================================================

function getMyPhase() {

    if (!roomData) return "lobby";

    const status =
        roomData.status || "waiting";

    if (status === "waiting") return "lobby";

    if (status === "countdown") return "countdown";

    if (status === "playing") return "playing";

    if (status === "finished") {

        const me =
            roomData.players
                ? roomData.players[currentUser?.uid]
                : null;

        const acked =
            !!(
                me &&
                me.acknowledgedRoundId ===
                currentRoundId
            );

        return acked ? "lobby" : "finished";
    }

    return "lobby";
}


// =====================================================
// SUBSCRIBE ROOM
// =====================================================

function subscribeRoom() {

    if (roomListenerStarted) return;

    roomListenerStarted = true;

    const roomRef =
        ref(
            database,
            "bingoRooms/" +
            roomId
        );

    onValue(
        roomRef,
        snapshot => {

            if (!snapshot.exists()) {

                alert(
                    "ห้องนี้ถูกปิดแล้ว"
                );

                goBackToRoom();

                return;
            }

            const oldRoundId =
                currentRoundId;

            roomData =
                snapshot.val();

            currentRoundId =
                roomData.roundId ||
                null;

            drawnNumbers =
                Array.isArray(
                    roomData.drawnNumbers
                )
                    ? roomData.drawnNumbers
                    : Object.values(
                        roomData.drawnNumbers || {}
                    );

            latestNumbers =
                Array.isArray(
                    roomData.latestNumbers
                )
                    ? roomData.latestNumbers
                    : Object.values(
                        roomData.latestNumbers || {}
                    );


            /*
             * รอบใหม่ (host กดเริ่มเกม)
             * -> รีเซ็ตกระดานของทุกคนพร้อมกัน
             */

            if (
                oldRoundId &&
                oldRoundId !==
                currentRoundId
            ) {

                resetLocalBoards();

            }


            gameFinished =
                roomData.status ===
                "finished";


            updateRoomInfo();

            updateLatestDraw();

            updateLatestNumbers();

            renderBoards();

        },

        error => {

            console.error(
                "ROOM LISTEN ERROR:",
                error
            );

        }
    );

}


// =====================================================
// UPDATE ROOM INFO
// =====================================================

function updateRoomInfo() {

    if (!roomData) return;

    isRoomOwner =
        currentUser &&
        roomData.hostUid ===
        currentUser.uid;

    if (roomNameElement) {

        roomNameElement.textContent =
            roomData.name ||
            "ห้อง Bingo";

    }

    players = [];

    if (roomData.players) {

        players =
            Object.values(
                roomData.players
            );

    }

    updatePlayerCount();
    updatePlayerList();


    const status =
        roomData.status ||
        "waiting";


    if (roomStatusElement) {

        roomStatusElement.className =
            "room-status " +
            status;

        if (status === "finished") {

            roomStatusElement.textContent =
                "🎉 จบเกม";

        }

        else if (status === "playing") {

            roomStatusElement.textContent =
                "🎮 กำลังเล่น";

        }

        else if (status === "countdown") {

            roomStatusElement.textContent =
                "⏱️ เตรียมตัว";

        }

        else {

            roomStatusElement.textContent =
                "⏳ รอผู้เล่น";

        }

    }


    const phase =
        getMyPhase();


    // =================================================
    // HOST
    // =================================================

    if (isRoomOwner) {

        if (hostControls) {
            hostControls.hidden = false;
        }

        if (gameControls) {
            gameControls.style.display = "none";
        }


        const readyPlayers =
            players.filter(
                player =>
                    player.ready === true
            );

        const canStart =
            (
                status === "waiting" ||
                status === "finished"
            ) &&
            readyPlayers.length > 0;

        if (startGameBtn) {

            startGameBtn.disabled =
                !canStart;

        }


        if (drawNumberBtn) {

            drawNumberBtn.disabled =
                status !== "playing" ||
                gameFinished;

        }

    }

    // =================================================
    // PLAYER
    // =================================================

    else {

        if (hostControls) {
            hostControls.hidden = true;
        }

        if (gameControls) {
            gameControls.style.display = "";
        }

        const myPlayer =
            roomData.players
                ? roomData.players[
                    currentUser?.uid
                ]
                : null;

        const isReady =
            !!(
                myPlayer &&
                myPlayer.ready
            );


        if (readyBtn) {

            readyBtn.textContent =
                isReady
                    ? "✅ พร้อมแล้ว"
                    : "พร้อม";

            readyBtn.classList.toggle(
                "ready-active",
                isReady
            );

            readyBtn.disabled =
                phase !== "lobby";

        }

    }


    // =================================================
    // ล็อคปุ่มซื้อกระดาน
    // =================================================

    updateBoardControls();


    // =================================================
    // COUNTDOWN
    // =================================================

    if (phase === "countdown") {

        startCountdownDisplay();

    } else {

        stopCountdown();

    }


    // =================================================
    // WINNER POPUP
    // =================================================

    if (phase === "finished") {

        showWinnerPopup();

    } else {

        hideWinnerPopup();

    }

}


// =====================================================
// COUNTDOWN
// =====================================================

function stopCountdown() {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer = null;

    }

    if (bingoCountdownOverlay) {

        bingoCountdownOverlay.hidden =
            true;

    }

}


function countdownTick() {

    if (
        getMyPhase() !==
        "countdown"
    ) {

        stopCountdown();

        return;
    }

    const endAt =
        (roomData.roundStartedAt || 0) +
        COUNTDOWN_SECONDS * 1000;

    const remainMs =
        endAt - Date.now();

    const remain =
        Math.max(
            0,
            Math.ceil(remainMs / 1000)
        );

    if (bingoCountdownOverlay) {

        bingoCountdownOverlay.hidden =
            false;

    }

    if (bingoCountdownNumber) {

        bingoCountdownNumber.textContent =
            remain > 0
                ? String(remain)
                : "";

    }

    if (remain <= 0) {

        maybeAdvanceCountdown();

    }

}


function startCountdownDisplay() {

    if (!bingoCountdownOverlay) return;

    countdownTick();

    if (!countdownTimer) {

        countdownTimer =
            setInterval(
                countdownTick,
                250
            );

    }

}


// =====================================================
// เมื่อนับถอยหลังหมดเวลา
// -> เฉพาะ host เท่านั้นที่เปลี่ยนสถานะเป็น playing
// =====================================================

async function maybeAdvanceCountdown() {

    if (!isRoomOwner) return;

    if (
        roomData?.status !==
        "countdown"
    ) {

        return;
    }

    if (advancingCountdown) return;

    advancingCountdown = true;

    try {

        const roomRef =
            ref(
                database,
                "bingoRooms/" +
                roomId
            );

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) return;

        const room =
            snapshot.val();

        if (
            room.status === "countdown" &&
            room.roundId === currentRoundId
        ) {

            await update(
                roomRef,
                {

                    status:
                        "playing",

                    updatedAt:
                        Date.now()

                }
            );

        }

    }

    catch (error) {

        console.error(
            "ADVANCE COUNTDOWN ERROR:",
            error
        );

    }

    finally {

        advancingCountdown = false;

    }

}


// =====================================================
// START GAME (HOST)
// =====================================================

startGameBtn?.addEventListener(
    "click",
    startGame
);


async function startGame() {

    if (!isRoomOwner) return;

    if (!currentUser || !roomId) return;

    const roomRef =
        ref(
            database,
            "bingoRooms/" +
            roomId
        );

    try {

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) {

            throw new Error(
                "ไม่พบห้อง Bingo นี้"
            );
        }

        const room =
            snapshot.val();


        if (
            room.hostUid !==
            currentUser.uid
        ) {

            throw new Error(
                "คุณไม่มีสิทธิ์เปิดเกม"
            );

        }


        if (
            room.status === "countdown" ||
            room.status === "playing"
        ) {

            return;

        }


        const currentPlayers =
            room.players
                ? Object.values(
                    room.players
                )
                : [];


        const readyPlayers =
            currentPlayers.filter(
                player =>
                    player.ready === true
            );


        if (
            readyPlayers.length === 0
        ) {

            alert(
                "ต้องมีผู้เล่นกดพร้อมก่อนเริ่มเกม"
            );

            return;

        }


        const oldRound =
            Number(
                room.roundNumber || 0
            );

        const newRound =
            oldRound + 1;

        const newRoundId =
            "round-" +
            newRound +
            "-" +
            Date.now();


        const updatedPlayers = {};

        currentPlayers.forEach(
            player => {

                updatedPlayers[
                    player.uid
                ] = {

                    ...player,

                    winnerAcknowledged:
                        false

                };

                delete updatedPlayers[
                    player.uid
                ].acknowledgedRoundId;

            }
        );


        await update(
            roomRef,
            {

                status:
                    "countdown",

                roundNumber:
                    newRound,

                roundId:
                    newRoundId,

                roundStartedAt:
                    Date.now(),

                pot:
                    0,

                drawnNumbers:
                    [],

                latestNumbers:
                    [],

                winnerUid:
                    null,

                winnerName:
                    null,

                winnerBoard:
                    null,

                prizeAwarded:
                    null,

                potAtWin:
                    null,

                players:
                    updatedPlayers,

                updatedAt:
                    Date.now()

            }
        );


        addSystemMessage(
            "🎮 Host เปิดเกมรอบใหม่แล้ว เตรียมตัว!"
        );

    }

    catch (error) {

        console.error(
            "START GAME ERROR:",
            error
        );

        alert(
            "เปิดเกมไม่สำเร็จ\n" +
            error.message
        );

    }

}


// =====================================================
// READY
// =====================================================

readyBtn?.addEventListener(
    "click",
    async () => {

        if (isRoomOwner) return;

        if (!currentUser || !roomId) return;

        if (
            getMyPhase() !==
            "lobby"
        ) {

            return;

        }


        if (
            boards.length <
            1
        ) {

            alert(
                "ต้องมีกระดานก่อนกดพร้อม"
            );

            return;

        }


        const myPlayer =
            roomData?.players
                ? roomData.players[
                    currentUser.uid
                ]
                : null;


        if (!myPlayer) return;


        const newReady =
            !myPlayer.ready;


        readyBtn.disabled = true;


        try {

            await update(
                ref(
                    database,
                    "bingoRooms/" +
                    roomId +
                    "/players/" +
                    currentUser.uid
                ),
                {

                    ready:
                        newReady

                }
            );

        }

        catch (error) {

            console.error(
                "READY ERROR:",
                error
            );

        }

        finally {

            readyBtn.disabled =
                false;

        }

    }
);


// =====================================================
// PLAYER COUNT
// =====================================================

function updatePlayerCount() {

    if (!playerCount) return;

    playerCount.textContent =
        players.length +
        "/" +
        MAX_PLAYERS;

}


// =====================================================
// PLAYER LIST
// =====================================================

function updatePlayerList() {

    if (!playerList) return;

    playerList.innerHTML = "";

    players.forEach(
        player => {

            const item =
                document.createElement("div");

            item.className =
                "player-item";


            const icon =
                document.createElement("span");

            icon.className =
                "player-owner";

            icon.textContent =
                player.uid ===
                roomData?.hostUid
                    ? "👑"
                    : (
                        player.ready
                            ? "✅"
                            : "👤"
                    );


            const name =
                document.createElement("span");

            name.className =
                "player-name";

            name.textContent =
                player.displayName ||
                "Player";


            item.appendChild(icon);
            item.appendChild(name);

            playerList.appendChild(item);

        }
    );

}


// =====================================================
// PLAYER MODAL
// =====================================================

playerCountBtn?.addEventListener(
    "click",
    () => {

        if (playerModal) {
            playerModal.hidden = false;
        }

    }
);


closePlayerModalBtn?.addEventListener(
    "click",
    () => {

        if (playerModal) {
            playerModal.hidden = true;
        }

    }
);


playerModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            playerModal
        ) {

            playerModal.hidden = true;

        }

    }
);


// =====================================================
// BOARD GENERATOR
// =====================================================

function generateBoardNumbers() {

    const columns = [
        { min: 1, max: 15 },
        { min: 16, max: 30 },
        { min: 31, max: 45 },
        { min: 46, max: 60 },
        { min: 61, max: 75 }
    ];

    const columnNumbers = [];

    columns.forEach(
        column => {

            const numbers = [];

            for (
                let number = column.min;
                number <= column.max;
                number++
            ) {

                numbers.push(number);

            }

            for (
                let i = numbers.length - 1;
                i > 0;
                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );

                [
                    numbers[i],
                    numbers[j]
                ] =
                [
                    numbers[j],
                    numbers[i]
                ];

            }

            columnNumbers.push(
                numbers.slice(0, 5)
            );

        }
    );


    const board = [];

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        for (
            let col = 0;
            col < 5;
            col++
        ) {

            if (
                row === 2 &&
                col === 2
            ) {

                board.push(
                    "My Friend"
                );

            }

            else {

                board.push(
                    columnNumbers[col][row]
                );

            }

        }

    }

    return board;

}


// =====================================================
// CREATE BOARD
// =====================================================

function createBoard() {

    return {

        numbers:
            generateBoardNumbers(),

        marked:
            new Set()

    };

}


// =====================================================
// INITIALIZE / RESET BOARDS
// =====================================================

function initializeBoards() {

    boards = [];

    for (
        let i = 0;
        i < FREE_BOARDS;
        i++
    ) {

        boards.push(
            createBoard()
        );

    }

    renderBoards();

}


function resetLocalBoards() {

    boards = [];

    for (
        let i = 0;
        i < FREE_BOARDS;
        i++
    ) {

        boards.push(
            createBoard()
        );

    }

    drawnNumbers = [];
    latestNumbers = [];

    gameFinished = false;

    if (drawResult) {
        drawResult.textContent = "-";
    }

    updateLatestDraw();
    updateLatestNumbers();

    renderBoards();

}


// =====================================================
// IS DRAWN
// =====================================================

function isNumberDrawn(number) {

    return drawnNumbers.includes(
        number
    );

}


// =====================================================
// RENDER BOARDS
// -----------------------------------------------------
// สำคัญ: ไม่ตั้ง cell.style.fontSize แบบ inline อีกต่อไป
// ให้ CSS (.board-count-N .bingo-cell) เป็นคนคุมขนาด
// =====================================================

function renderBoards() {

    if (!boardsContainer) return;

    boardsContainer.innerHTML = "";

    boardsContainer.className =
        "boards-container board-count-" +
        boards.length;


    boards.forEach(
        (board, boardIndex) => {

            const boardElement =
                document.createElement("div");

            boardElement.className =
                "bingo-board";


            const title =
                document.createElement("div");

            title.className =
                "board-title";

            title.textContent =
                "BINGO #" +
                (boardIndex + 1);

            boardElement.appendChild(title);


            const letters =
                document.createElement("div");

            letters.className =
                "bingo-letters";


            [
                "B",
                "I",
                "N",
                "G",
                "O"
            ].forEach(
                letter => {

                    const element =
                        document.createElement("div");

                    element.className =
                        "bingo-letter";

                    element.textContent =
                        letter;

                    letters.appendChild(
                        element
                    );

                }
            );


            boardElement.appendChild(
                letters
            );


            const grid =
                document.createElement("div");

            grid.className =
                "bingo-grid";


            const canPlay =
                roomData?.status ===
                "playing" &&
                !gameFinished;


            board.numbers.forEach(
                number => {

                    const cell =
                        document.createElement("button");

                    cell.type = "button";
                    cell.className = "bingo-cell";

                    cell.textContent =
                        number;


                    if (
                        number ===
                        "My Friend"
                    ) {

                        cell.classList.add(
                            "free"
                        );

                        cell.disabled =
                            true;

                    }

                    else if (
                        board.marked.has(number)
                    ) {

                        cell.classList.add(
                            "marked"
                        );

                        cell.disabled =
                            true;

                    }

                    else if (
                        isNumberDrawn(number) &&
                        canPlay
                    ) {

                        cell.disabled =
                            false;

                        cell.addEventListener(
                            "click",
                            () => {

                                markNumber(
                                    boardIndex,
                                    number
                                );

                            }
                        );

                    }

                    else {

                        cell.disabled =
                            true;

                        cell.classList.add(
                            "not-drawn"
                        );

                    }


                    grid.appendChild(cell);

                }
            );


            boardElement.appendChild(grid);

            boardsContainer.appendChild(
                boardElement
            );

        }
    );


    updateBoardControls();

}


// =====================================================
// MARK NUMBER
// =====================================================

function markNumber(
    boardIndex,
    number
) {

    if (gameFinished) return;

    if (
        roomData?.status !==
        "playing"
    ) {
        return;
    }

    const board =
        boards[boardIndex];

    if (!board) return;

    if (!isNumberDrawn(number)) return;

    if (board.marked.has(number)) return;


    board.marked.add(number);

    renderBoards();


    if (
        checkBoardForBingo(
            boardIndex
        )
    ) {

        finishLocalBingo(
            boardIndex
        );

    }

}


// =====================================================
// CHECK BINGO
// =====================================================

function checkBoardForBingo(
    boardIndex
) {

    const board =
        boards[boardIndex];

    if (!board) return false;


    function complete(
        row,
        col
    ) {

        const index =
            row * 5 + col;

        const value =
            board.numbers[index];

        if (
            value ===
            "My Friend"
        ) {

            return true;

        }

        return board.marked.has(value);

    }


    for (
        let row = 0;
        row < 5;
        row++
    ) {

        let completeRow = true;

        for (
            let col = 0;
            col < 5;
            col++
        ) {

            if (
                !complete(row, col)
            ) {

                completeRow = false;
                break;

            }

        }

        if (completeRow) return true;

    }


    for (
        let col = 0;
        col < 5;
        col++
    ) {

        let completeColumn = true;

        for (
            let row = 0;
            row < 5;
            row++
        ) {

            if (
                !complete(row, col)
            ) {

                completeColumn = false;
                break;

            }

        }

        if (completeColumn) return true;

    }


    let diagonalOne = true;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            !complete(i, i)
        ) {

            diagonalOne = false;
            break;

        }

    }

    if (diagonalOne) return true;


    let diagonalTwo = true;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            !complete(i, 4 - i)
        ) {

            diagonalTwo = false;
            break;

        }

    }

    return diagonalTwo;

}


// =====================================================
// FINISH BINGO
// -----------------------------------------------------
// คำนวณกองกลาง (pot) หัก % ระบบเข้ากระเป๋า GM
// ที่เหลือเข้า wallet ผู้ชนะจริง
// =====================================================

async function finishLocalBingo(
    boardIndex
) {

    if (gameFinished) return;

    gameFinished = true;

    const winnerName =
        currentUserData?.displayName ||
        "Player";


    if (drawNumberBtn) {
        drawNumberBtn.disabled = true;
    }

    if (readyBtn) {
        readyBtn.disabled = true;
    }


    renderBoards();


    try {

        const roomRef =
            ref(
                database,
                "bingoRooms/" +
                roomId
            );

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) return;

        const room =
            snapshot.val();


        if (
            room.status ===
            "finished"
        ) {

            // มีผู้ชนะไปแล้ว
            return;

        }


        const pot =
            Number(room.pot || 0);

        const cut =
            Math.round(
                pot *
                (PRIZE_CUT_PERCENT / 100)
            );

        const prize =
            pot - cut;


        await update(
            roomRef,
            {

                status:
                    "finished",

                winnerUid:
                    currentUser.uid,

                winnerName:
                    winnerName,

                winnerBoard:
                    boardIndex + 1,

                winnerRoundId:
                    room.roundId ||
                    currentRoundId,

                prizeAwarded:
                    prize,

                potAtWin:
                    pot,

                updatedAt:
                    Date.now()

            }
        );


        // =============================================
        // จ่ายรางวัลเข้า wallet ผู้ชนะ
        // =============================================

        if (prize > 0) {

            const walletRef =
                ref(
                    database,
                    "wallets/" +
                    currentUser.uid
                );

            const walletSnapshot =
                await get(walletRef);

            if (walletSnapshot.exists()) {

                const wallet =
                    walletSnapshot.val();

                const currentCoins =
                    Number(
                        wallet.coins || 0
                    );

                const txRef =
                    push(
                        ref(
                            database,
                            "wallets/" +
                            currentUser.uid +
                            "/transactions"
                        )
                    );

                await update(
                    walletRef,
                    {

                        coins:
                            currentCoins + prize,

                        ["transactions/" + txRef.key]: {

                            type:
                                "credit",

                            amount:
                                prize,

                            reason:
                                "รางวัล Bingo",

                            timestamp:
                                Date.now()

                        }

                    }
                );

                playerCoins =
                    currentCoins + prize;

                updateCoinDisplay();

            }

        }


        // =============================================
        // หักส่วนแบ่งเข้ากระเป๋า GM
        // =============================================

        if (cut > 0) {

            const gmCoinsRef =
                ref(
                    database,
                    "gmWallet/coins"
                );

            const gmSnapshot =
                await get(gmCoinsRef);

            const currentGmCoins =
                gmSnapshot.exists()
                    ? Number(gmSnapshot.val() || 0)
                    : 0;

            const gmTxRef =
                push(
                    ref(
                        database,
                        "gmWallet/transactions"
                    )
                );

            await update(
                ref(
                    database,
                    "gmWallet"
                ),
                {

                    coins:
                        currentGmCoins + cut,

                    ["transactions/" + gmTxRef.key]: {

                        type:
                            "credit",

                        amount:
                            cut,

                        reason:
                            "ส่วนแบ่งกองกลาง Bingo",

                        actorUid:
                            currentUser.uid,

                        timestamp:
                            Date.now()

                    }

                }
            );

        }


        addSystemMessage(
            "🎉 BINGO! " +
            winnerName +
            " ชนะด้วยกระดาน #" +
            (boardIndex + 1) +
            (
                prize > 0
                    ? " ได้รับ " + prize + " 🪙"
                    : ""
            )
        );

    }

    catch (error) {

        console.error(
            "FINISH BINGO ERROR:",
            error
        );

    }

}


// =====================================================
// WINNER POPUP (ใช้ #winnerModal จริงจาก HTML)
// =====================================================

function showWinnerPopup() {

    if (!winnerModal) return;

    const winnerName =
        roomData?.winnerName ||
        "ผู้เล่น";

    const winnerBoard =
        roomData?.winnerBoard;

    const isMe =
        roomData?.winnerUid ===
        currentUser?.uid;

    const prize =
        Number(
            roomData?.prizeAwarded || 0
        );


    if (winnerNameEl) {

        winnerNameEl.textContent =
            winnerName;

    }


    if (winnerMessageEl) {

        winnerMessageEl.textContent =
            (isMe ? "คุณ" : winnerName) +
            "ได้ BINGO" +
            (
                winnerBoard
                    ? " ด้วยกระดาน #" + winnerBoard
                    : ""
            );

    }


    if (winnerPrizeEl) {

        winnerPrizeEl.textContent =
            prize > 0
                ? "🪙 รางวัล " +
                  prize +
                  " เหรียญ" +
                  (
                      isMe
                          ? " (เข้ากระเป๋าคุณแล้ว)"
                          : ""
                  )
                : "รอบนี้ไม่มีกองกลาง (ไม่มีใครซื้อกระดานเพิ่ม)";

    }


    if (winnerConfirmStatus) {

        winnerConfirmStatus.textContent =
            "";

    }


    if (winnerConfirmBtn) {

        winnerConfirmBtn.disabled =
            false;

    }


    winnerModal.hidden = false;

}


function hideWinnerPopup() {

    if (winnerModal) {

        winnerModal.hidden = true;

    }

}


winnerConfirmBtn?.addEventListener(
    "click",
    acknowledgeWinner
);


// =====================================================
// ACKNOWLEDGE WINNER
// -----------------------------------------------------
// กดตกลง = ยืนยันส่วนตัวเท่านั้น
// รีเซ็ตแค่หน้าจอของ "ตัวเอง" กลับไปหน้ารอเริ่ม
// ไม่แตะสถานะห้องทั้งห้อง (ห้องจะรีเซ็ตจริงตอน host
// กดเริ่มเกมรอบใหม่เท่านั้น)
// =====================================================

async function acknowledgeWinner() {

    if (
        !currentUser ||
        !roomId
    ) {
        return;
    }

    const roundId =
        roomData?.roundId ||
        currentRoundId ||
        null;


    if (winnerConfirmBtn) {
        winnerConfirmBtn.disabled = true;
    }

    if (winnerConfirmStatus) {
        winnerConfirmStatus.textContent =
            "กำลังบันทึก...";
    }


    try {

        await update(
            ref(
                database,
                "bingoRooms/" +
                roomId +
                "/players/" +
                currentUser.uid
            ),
            {

                ready:
                    false,

                winnerAcknowledged:
                    true,

                acknowledgedRoundId:
                    roundId

            }
        );


        hideWinnerPopup();

        resetLocalBoards();

        gameFinished = false;

        updateRoomInfo();

    }

    catch (error) {

        console.error(
            "ACKNOWLEDGE WINNER ERROR:",
            error
        );

        if (winnerConfirmStatus) {

            winnerConfirmStatus.textContent =
                "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";

        }

        if (winnerConfirmBtn) {

            winnerConfirmBtn.disabled =
                false;

        }

    }

}


// =====================================================
// BOARD CONTROLS
// (ล็อคปุ่มซื้อกระดานเมื่อไม่ได้อยู่ phase lobby)
// =====================================================

function updateBoardControls() {

    if (boardCountText) {

        boardCountText.textContent =
            "กระดาน " +
            boards.length +
            "/" +
            MAX_BOARDS;

    }


    if (!buyBoardBtn) return;


    if (
        boards.length >=
        MAX_BOARDS
    ) {

        buyBoardBtn.disabled =
            true;

        buyBoardBtn.innerHTML =
            "ครบ 4 กระดานแล้ว";

        return;

    }


    if (
        getMyPhase() !==
        "lobby"
    ) {

        buyBoardBtn.disabled =
            true;

        buyBoardBtn.innerHTML =
            "ล็อคระหว่างเกม";

        return;

    }


    buyBoardBtn.disabled =
        playerCoins <
        BOARD_PRICE;

    buyBoardBtn.innerHTML =
        "➕ ซื้อกระดาน " +
        "<span>" +
        BOARD_PRICE +
        " 🪙</span>";

}


// =====================================================
// BUY BOARD
// -----------------------------------------------------
// หักเหรียญจริงจาก wallet + สะสมเข้ากองกลาง (pot)
// ของห้องจริง เพื่อใช้จ่ายรางวัลตอนบิงโก
// =====================================================

buyBoardBtn?.addEventListener(
    "click",
    buyBoard
);


async function buyBoard() {

    if (
        boards.length >=
        MAX_BOARDS
    ) {
        return;
    }

    if (
        getMyPhase() !==
        "lobby"
    ) {
        return;
    }

    if (!currentUser || !roomId) return;


    if (
        playerCoins <
        BOARD_PRICE
    ) {

        alert(
            "เหรียญไม่เพียงพอ"
        );

        return;

    }


    buyBoardBtn.disabled = true;


    try {

        const walletRef =
            ref(
                database,
                "wallets/" +
                currentUser.uid
            );

        const snapshot =
            await get(walletRef);

        if (!snapshot.exists()) {

            throw new Error(
                "ไม่พบ Wallet"
            );

        }

        const wallet =
            snapshot.val();

        const currentCoins =
            Number(
                wallet.coins || 0
            );


        if (
            currentCoins <
            BOARD_PRICE
        ) {

            playerCoins =
                currentCoins;

            updateCoinDisplay();

            alert(
                "เหรียญไม่เพียงพอ"
            );

            return;

        }


        const txRef =
            push(
                ref(
                    database,
                    "wallets/" +
                    currentUser.uid +
                    "/transactions"
                )
            );


        await update(
            walletRef,
            {

                coins:
                    currentCoins - BOARD_PRICE,

                ["transactions/" + txRef.key]: {

                    type:
                        "debit",

                    amount:
                        BOARD_PRICE,

                    reason:
                        "ซื้อกระดาน Bingo เพิ่ม",

                    timestamp:
                        Date.now()

                }

            }
        );


        const roomRef =
            ref(
                database,
                "bingoRooms/" +
                roomId
            );

        const roomSnapshot =
            await get(roomRef);

        const currentPot =
            roomSnapshot.exists()
                ? Number(
                    roomSnapshot.val().pot || 0
                )
                : 0;

        await update(
            roomRef,
            {

                pot:
                    currentPot + BOARD_PRICE,

                updatedAt:
                    Date.now()

            }
        );


        playerCoins =
            currentCoins - BOARD_PRICE;

        boards.push(
            createBoard()
        );


        updateCoinDisplay();

        renderBoards();

    }

    catch (error) {

        console.error(
            "BUY BOARD ERROR:",
            error
        );

        alert(
            "ซื้อกระดานไม่สำเร็จ\n" +
            error.message
        );

    }

    finally {

        updateBoardControls();

    }

}


// =====================================================
// HOST DRAW
// =====================================================

drawNumberBtn?.addEventListener(
    "click",
    drawNumber
);


async function drawNumber() {

    if (!isRoomOwner) return;

    if (!currentUser || !roomId) return;

    if (
        roomData?.status !==
        "playing"
    ) {
        return;
    }

    if (gameFinished) return;


    const roomRef =
        ref(
            database,
            "bingoRooms/" +
            roomId
        );


    try {

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) {

            throw new Error(
                "ไม่พบห้อง Bingo นี้"
            );

        }


        const room =
            snapshot.val();


        if (
            room.hostUid !==
            currentUser.uid
        ) {

            throw new Error(
                "คุณไม่มีสิทธิ์สุ่มเลข"
            );

        }


        if (
            room.status !==
            "playing"
        ) {
            return;
        }


        const numbers =
            Array.isArray(
                room.drawnNumbers
            )
                ? room.drawnNumbers
                : Object.values(
                    room.drawnNumbers || {}
                );


        const availableNumbers = [];


        for (
            let number = 1;
            number <= 75;
            number++
        ) {

            if (
                !numbers.includes(number)
            ) {

                availableNumbers.push(
                    number
                );

            }

        }


        if (
            availableNumbers.length === 0
        ) {

            alert(
                "เลข Bingo ออกครบทั้ง 75 เลขแล้ว"
            );

            return;

        }


        const randomIndex =
            Math.floor(
                Math.random() *
                availableNumbers.length
            );


        const number =
            availableNumbers[
                randomIndex
            ];


        const newNumbers =
            [
                ...numbers,
                number
            ];


        let newLatest =
            Array.isArray(
                room.latestNumbers
            )
                ? room.latestNumbers
                : Object.values(
                    room.latestNumbers || {}
                );


        newLatest =
            [
                number,
                ...newLatest
            ].slice(0, 5);


        await update(
            roomRef,
            {

                drawnNumbers:
                    newNumbers,

                latestNumbers:
                    newLatest,

                updatedAt:
                    Date.now()

            }
        );


        if (drawResult) {

            drawResult.textContent =
                formatBingoNumber(
                    number
                );

        }


        addSystemMessage(
            "🎲 ออกเลข " +
            formatBingoNumber(number)
        );

    }

    catch (error) {

        console.error(
            "DRAW NUMBER ERROR:",
            error
        );

        alert(
            "ออกเลขไม่สำเร็จ\n" +
            error.message
        );

    }

}


// =====================================================
// LATEST DRAW
// =====================================================

function updateLatestDraw() {

    if (!latestDrawNumber) return;


    const number =
        latestNumbers.length > 0
            ? latestNumbers[0]
            : null;


    if (
        typeof number !==
        "number"
    ) {

        latestDrawNumber.textContent =
            "-";

        latestDrawNumber.className =
            "latest-draw-number";

        return;

    }


    const letter =
        getBingoLetter(number);


    latestDrawNumber.textContent =
        formatBingoNumber(number);


    latestDrawNumber.className =
        "latest-draw-number latest-" +
        letter.toLowerCase();

}


// =====================================================
// LAST 5
// =====================================================

function updateLatestNumbers() {

    if (!latestNumbersElement) return;

    latestNumbersElement.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const span =
            document.createElement("span");


        const number =
            latestNumbers[i];


        if (
            typeof number !==
            "number"
        ) {

            span.textContent =
                "-";

            span.classList.add(
                "latest-empty"
            );

        }

        else {

            const letter =
                getBingoLetter(number);

            span.textContent =
                formatBingoNumber(number);

            span.classList.add(
                "latest-" +
                letter.toLowerCase()
            );

        }


        latestNumbersElement.appendChild(
            span
        );

    }

}


// =====================================================
// CHAT
// =====================================================

function subscribeChat() {

    if (
        !roomId ||
        chatListenerStarted
    ) {
        return;
    }

    chatListenerStarted = true;


    const chatRef =
        ref(
            database,
            "bingoRooms/" +
            roomId +
            "/chat"
        );


    onValue(
        chatRef,
        snapshot => {

            if (!chatMessages) return;

            chatMessages.innerHTML = "";


            if (!snapshot.exists()) {
                return;
            }


            const messages =
                Object.values(
                    snapshot.val()
                )
                .sort(
                    (a, b) =>
                        Number(
                            a.createdAt || 0
                        ) -
                        Number(
                            b.createdAt || 0
                        )
                );


            const latest =
                messages.slice(-5);


            latest.forEach(
                message => {

                    renderChatMessage(
                        message
                    );

                }
            );


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        },

        error => {

            console.error(
                "CHAT LISTEN ERROR:",
                error
            );

        }
    );

}


// =====================================================
// EXPAND CHAT
// =====================================================

function openChatModal() {

    if (
        !chatModal ||
        !expandedChatMessages
    ) {
        return;
    }


    expandedChatMessages.innerHTML = "";


    if (chatMessages) {

        const messages =
            chatMessages.querySelectorAll(
                ".chat-message"
            );


        messages.forEach(
            message => {

                const clone =
                    message.cloneNode(true);

                expandedChatMessages.appendChild(
                    clone
                );

            }
        );

    }


    chatModal.hidden = false;


    expandedChatMessages.scrollTop =
        expandedChatMessages.scrollHeight;

}


function closeChatModal() {

    if (chatModal) {

        chatModal.hidden =
            true;

    }

}


chatSection?.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                ".chat-input-row"
            )
        ) {
            return;
        }

        openChatModal();

    }
);


closeChatModalBtn?.addEventListener(
    "click",
    closeChatModal
);


chatModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            chatModal
        ) {

            closeChatModal();

        }

    }
);


// =====================================================
// SEND CHAT
// =====================================================

chatSendBtn?.addEventListener(
    "click",
    sendChat
);


chatInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            sendChat();

        }

    }
);


async function sendChat() {

    const text =
        chatInput?.value.trim();


    if (!text) return;


    if (
        !currentUser ||
        !roomId
    ) {
        return;
    }


    try {

        const chatRef =
            ref(
                database,
                "bingoRooms/" +
                roomId +
                "/chat"
            );


        const messageRef =
            push(chatRef);


        await set(
            messageRef,
            {

                uid:
                    currentUser.uid,

                displayName:
                    currentUserData?.displayName ||
                    "Player",

                text:
                    text,

                createdAt:
                    Date.now()

            }
        );


        chatInput.value =
            "";

    }

    catch (error) {

        console.error(
            "SEND CHAT ERROR:",
            error
        );

    }

}


// =====================================================
// RENDER CHAT
// =====================================================

function renderChatMessage(
    message
) {

    if (!chatMessages) return;


    const element =
        document.createElement("div");


    element.className =
        "chat-message";


    if (
        message.uid ===
        currentUser?.uid
    ) {

        element.classList.add(
            "my-message"
        );

    }

    else {

        element.classList.add(
            "other-message"
        );

    }


    const nameElement =
        document.createElement("b");


    nameElement.textContent =
        message.displayName ||
        "Player";


    element.appendChild(
        nameElement
    );


    element.appendChild(
        document.createTextNode(
            ": " +
            (message.text || "")
        )
    );


    chatMessages.appendChild(
        element
    );

}


// =====================================================
// SYSTEM MESSAGE
// =====================================================

async function addSystemMessage(
    text
) {

    if (
        !currentUser ||
        !roomId
    ) {
        return;
    }


    try {

        const chatRef =
            ref(
                database,
                "bingoRooms/" +
                roomId +
                "/chat"
            );


        const messageRef =
            push(chatRef);


        await set(
            messageRef,
            {

                uid:
                    "system",

                displayName:
                    "ระบบ",

                text:
                    text,

                createdAt:
                    Date.now()

            }
        );

    }

    catch (error) {

        console.error(
            "SYSTEM MESSAGE ERROR:",
            error
        );

    }

}


// =====================================================
// LEAVE ROOM EVENTS
// =====================================================

leaveRoomBtn?.addEventListener(
    "click",
    () => {

        if (leaveModal) {
            leaveModal.hidden = false;
        }

    }
);


cancelLeaveBtn?.addEventListener(
    "click",
    () => {

        if (leaveModal) {
            leaveModal.hidden = true;
        }

    }
);


confirmLeaveBtn?.addEventListener(
    "click",
    async () => {

        if (leaveModal) {
            leaveModal.hidden = true;
        }

        await leaveRoom();

    }
);


leaveModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            leaveModal
        ) {

            leaveModal.hidden = true;

        }

    }
);


// =====================================================
// LEAVE ROOM
// (get + update แทน runTransaction เพื่อไม่ให้
//  จำนวนผู้เล่นค้างเป็นเลขเก่าตอนออกจากห้อง)
// =====================================================

async function leaveRoom() {

    if (
        !currentUser ||
        !roomId
    ) {

        goBackToRoom();

        return;

    }


    try {

        const roomRef =
            ref(
                database,
                "bingoRooms/" +
                roomId
            );


        const playerRef =
            ref(
                database,
                "bingoRooms/" +
                roomId +
                "/players/" +
                currentUser.uid
            );


        try {

            await onDisconnect(
                playerRef
            ).cancel();

        }

        catch (disconnectError) {

            console.warn(
                "CANCEL DISCONNECT WARNING:",
                disconnectError
            );

        }


        const snapshot =
            await get(roomRef);

        if (snapshot.exists()) {

            const room =
                snapshot.val();

            const currentPlayers =
                {
                    ...(room.players || {})
                };

            if (
                currentPlayers[
                    currentUser.uid
                ]
            ) {

                delete currentPlayers[
                    currentUser.uid
                ];

                const remainingIds =
                    Object.keys(
                        currentPlayers
                    );

                if (
                    remainingIds.length === 0
                ) {

                    await set(
                        roomRef,
                        null
                    );

                }

                else {

                    let newHostUid =
                        room.hostUid;

                    let newHostName =
                        room.hostName;


                    if (
                        currentUser.uid ===
                        room.hostUid
                    ) {

                        newHostUid =
                            remainingIds[0];

                        newHostName =
                            currentPlayers[
                                newHostUid
                            ]?.displayName ||
                            "Player";

                    }


                    await update(
                        roomRef,
                        {

                            players:
                                currentPlayers,

                            playerCount:
                                remainingIds.length,

                            hostUid:
                                newHostUid,

                            hostName:
                                newHostName,

                            updatedAt:
                                Date.now()

                        }
                    );

                }

            }

        }

    }

    catch (error) {

        console.error(
            "LEAVE ROOM ERROR:",
            error
        );

    }


    goBackToRoom();

}


// =====================================================
// BACK TO ROOM
// =====================================================

function goBackToRoom() {

    const roomUrl =
        new URL(
            "../room/bingo-room.html",
            window.location.href
        );

    window.location.assign(
        roomUrl.href
    );

}


// =====================================================
// START
// =====================================================

updateCoinDisplay();
updatePlayerCount();
updateLatestNumbers();
updateLatestDraw();
