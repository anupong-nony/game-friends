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
    onDisconnect,
    runTransaction
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

// =====================================================
// กฎล่าสุด
//
// Ready
// ↓
// Host กด Start
// ↓
// Countdown 30 วินาที
// ↓
// ถึง 0
// ↓
// หัก 20 เหรียญจากผู้เล่น Ready
// ↓
// 20 เหรียญ / คน เข้า Pot
// ↓
// เล่นจนจบ
// ↓
// ตอนจ่ายรางวัล:
// GM Wallet = 20% ของ Pot
// Winner = 80% ของ Pot
//
// ไม่มีการหัก GM 5 เหรียญตอนเริ่มเกม
// =====================================================

const READY_FEE = 20;

const PRIZE_PERCENT =
    80;

const GM_PERCENT =
    20;

const BOARD_PRICE = 20;

const MAX_BOARDS = 4;
const FREE_BOARDS = 1;
const MAX_PURCHASED_BOARDS = 3;

const MAX_PLAYERS = 20;

const COUNTDOWN_SECONDS = 30;


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

let buyingBoard = false;

let processingWinner = false;

let lastRenderedStatus = null;
let lastRenderedRoundId = null;


// =====================================================
// WINNER POPUP STATE
// =====================================================

let winnerPopupRoundId = null;


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

const winnerBoardContainer =
    document.getElementById("winnerBoardContainer");

const winnerBoardTitle =
    document.getElementById("winnerBoardTitle");

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

    } catch (error) {

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
                    wallet?.coins || 0
                );

        } else {

            playerCoins = 0;

        }

        updateCoinDisplay();

    } catch (error) {

        console.error(
            "LOAD COINS ERROR:",
            error
        );

    }

}


// =====================================================
// REFRESH COINS
// =====================================================

async function refreshPlayerCoins() {

    if (!currentUser) return;

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "wallets/" +
                    currentUser.uid +
                    "/coins"
                )
            );

        if (snapshot.exists()) {

            playerCoins =
                Number(
                    snapshot.val() || 0
                );

        } else {

            playerCoins = 0;

        }

        updateCoinDisplay();
        updateBoardControls();

    } catch (error) {

        console.error(
            "REFRESH COINS ERROR:",
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
        Number(
            playerCoins || 0
        ).toLocaleString();

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

            alert("ไม่พบห้อง Bingo นี้");
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

    } catch (error) {

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

    } catch (error) {

        console.error(
            "ON DISCONNECT ERROR:",
            error
        );

    }

}


// =====================================================
// PHASE HELPER
// =====================================================

function getMyPhase() {

    if (!roomData) return "lobby";

    const status =
        roomData.status || "waiting";

    if (status === "waiting") {
        return "lobby";
    }

    if (status === "countdown") {
        return "countdown";
    }

    if (status === "playing") {
        return "playing";
    }

    if (status === "finished") {

        const me =
            roomData.players
                ? roomData.players[
                    currentUser?.uid
                ]
                : null;

        const roundId =
            roomData.winnerRoundId ||
            roomData.roundId ||
            currentRoundId;

        const acked =
            !!(
                me &&
                me.acknowledgedRoundId ===
                roundId
            );

        return acked
            ? "lobby"
            : "finished";

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

                stopCountdown();

                alert(
                    "ห้องนี้ถูกปิดแล้ว"
                );

                goBackToRoom();
                return;

            }

            const oldRoundId =
                currentRoundId;

            const oldStatus =
                roomData?.status ||
                null;

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

            const roundChanged =
                !!(
                    oldRoundId &&
                    oldRoundId !==
                    currentRoundId
                );

            if (roundChanged) {

                resetLocalBoards();

            }

            gameFinished =
                roomData.status ===
                "finished";

            lastRenderedStatus =
                roomData.status || "waiting";

            lastRenderedRoundId =
                currentRoundId;

            updateRoomInfo();

            updateLatestDraw();

            updateLatestNumbers();

            renderBoards();

            // =================================================
            // สำคัญ:
            // เมื่อสถานะออกจาก countdown ต้องหยุด timer
            // ทันที
            // =================================================

            if (
                roomData.status ===
                "countdown"
            ) {

                startCountdownDisplay();

            } else {

                stopCountdown();

            }

            // =================================================
            // WINNER
            // =================================================

            if (
                roomData.status ===
                "finished"
            ) {

                const finishedRoundId =
                    roomData.winnerRoundId ||
                    roomData.roundId ||
                    null;

                const myPlayer =
                    roomData.players
                        ? roomData.players[
                            currentUser?.uid
                        ]
                        : null;

                const acknowledged =
                    !!(
                        myPlayer &&
                        myPlayer.acknowledgedRoundId &&
                        myPlayer.acknowledgedRoundId ===
                        finishedRoundId
                    );

                if (!acknowledged) {

                    winnerPopupRoundId =
                        finishedRoundId;

                    showWinnerPopup();

                } else {

                    hideWinnerPopup();

                }

            } else if (
                roomData.status ===
                "waiting"
            ) {

                hideWinnerPopup();

            }

            // =================================================
            // ถ้ host อยู่ countdown
            // ถึงเวลาแล้ว由 host ประมวลผล
            // =================================================

            if (
                roomData.status ===
                "countdown"
            ) {

                const startedAt =
                    Number(
                        roomData.roundStartedAt ||
                        0
                    );

                if (
                    startedAt > 0 &&
                    Date.now() >=
                    startedAt +
                    COUNTDOWN_SECONDS * 1000
                ) {

                    maybeAdvanceCountdown();

                }

            }

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

        } else if (status === "playing") {

            roomStatusElement.textContent =
                "🎮 กำลังเล่น";

        } else if (status === "countdown") {

            roomStatusElement.textContent =
                "⏱️ เตรียมตัว";

        } else {

            roomStatusElement.textContent =
                "⏳ รอผู้เล่น";

        }

    }


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
                status !== "waiting" &&
                status !== "countdown";

        }

    }


    updateBoardControls();

}


// =====================================================
// COUNTDOWN STOP
// =====================================================

function stopCountdown() {

    if (countdownTimer !== null) {

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


// =====================================================
// COUNTDOWN TICK
// =====================================================

function countdownTick() {

    if (
        !roomData ||
        roomData.status !==
        "countdown"
    ) {

        stopCountdown();
        return;

    }

    const startedAt =
        Number(
            roomData.roundStartedAt ||
            0
        );

    if (!startedAt) {

        stopCountdown();
        return;

    }

    const endAt =
        startedAt +
        COUNTDOWN_SECONDS * 1000;

    const remainMs =
        endAt -
        Date.now();


    // =================================================
    // ถึง 0 แล้ว
    // ห้ามแสดง 0
    // ห้ามแสดง 1 ซ้ำ
    // ห้ามปล่อย timer วิ่งต่อ
    // =================================================

    if (remainMs <= 0) {

        if (bingoCountdownOverlay) {

            bingoCountdownOverlay.hidden =
                true;

        }

        if (countdownTimer !== null) {

            clearInterval(
                countdownTimer
            );

            countdownTimer = null;

        }

        maybeAdvanceCountdown();

        return;

    }


    const remain =
        Math.ceil(
            remainMs / 1000
        );


    if (bingoCountdownOverlay) {

        bingoCountdownOverlay.hidden =
            false;

    }


    if (bingoCountdownNumber) {

        bingoCountdownNumber.textContent =
            String(remain);

    }

}


// =====================================================
// START COUNTDOWN DISPLAY
// =====================================================

function startCountdownDisplay() {

    if (!bingoCountdownOverlay) {
        return;
    }

    countdownTick();

    if (
        countdownTimer === null &&
        roomData?.status ===
        "countdown"
    ) {

        countdownTimer =
            setInterval(
                countdownTick,
                100
            );

    }

}


// =====================================================
// ADVANCE COUNTDOWN
// =====================================================

async function maybeAdvanceCountdown() {

    if (!isRoomOwner) {
        return;
    }

    if (
        !roomData ||
        roomData.status !==
        "countdown"
    ) {

        return;

    }

    if (advancingCountdown) {
        return;
    }

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

        if (!snapshot.exists()) {
            return;
        }

        const room =
            snapshot.val();


        if (
            room.status !==
            "countdown"
        ) {

            return;

        }


        const roundId =
            room.roundId ||
            null;


        if (!roundId) {

            console.error(
                "COUNTDOWN ERROR: ไม่พบ Round ID"
            );

            return;

        }


        const startedAt =
            Number(
                room.roundStartedAt ||
                0
            );


        if (!startedAt) {

            console.error(
                "COUNTDOWN ERROR: ไม่พบเวลาเริ่ม Countdown"
            );

            return;

        }


        const endAt =
            startedAt +
            COUNTDOWN_SECONDS * 1000;


        if (
            Date.now() <
            endAt
        ) {

            startCountdownDisplay();

            return;

        }


        // =================================================
        // ป้องกันการประมวลผลซ้ำ
        // =================================================

        if (
            room.paymentProcessedRoundId ===
            roundId
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

            return;

        }


        // =================================================
        // READY PLAYERS
        // =================================================

        const roomPlayers =
            room.players
                ? Object.values(
                    room.players
                )
                : [];


        const readyPlayers =
            roomPlayers.filter(
                player =>
                    player.ready === true
            );


        // =================================================
        // ไม่มีผู้เล่น Ready
        // =================================================

        if (
            readyPlayers.length === 0
        ) {

            await update(
                roomRef,
                {

                    status:
                        "waiting",

                    roundId:
                        null,

                    roundStartedAt:
                        null,

                    updatedAt:
                        Date.now()

                }
            );

            return;

        }


        // =================================================
        // หัก 20 เหรียญ / Ready
        //
        // ไม่มี GM fee ตรงนี้
        // ไม่มีการสร้าง GM Wallet ตรงนี้
        // =================================================

        let totalPot =
            0;

        const chargedPlayers = [];


        for (
            const player of readyPlayers
        ) {

            const walletCoinsRef =
                ref(
                    database,
                    "wallets/" +
                    player.uid +
                    "/coins"
                );


            const transactionResult =
                await runTransaction(
                    walletCoinsRef,
                    currentCoins => {

                        const coins =
                            Number(
                                currentCoins || 0
                            );


                        if (
                            coins <
                            READY_FEE
                        ) {

                            return;

                        }


                        return (
                            coins -
                            READY_FEE
                        );

                    }
                );


            if (
                !transactionResult.committed
            ) {

                console.warn(
                    "READY FEE NOT CHARGED:",
                    player.uid
                );

                continue;

            }


            const newCoins =
                Number(
                    transactionResult.snapshot.val() ||
                    0
                );


            chargedPlayers.push(
                player.uid
            );


            totalPot +=
                READY_FEE;


            // =================================================
            // Transaction ผู้เล่น
            // =================================================

            try {

                const txRef =
                    push(
                        ref(
                            database,
                            "wallets/" +
                            player.uid +
                            "/transactions"
                        )
                    );


                await set(
                    txRef,
                    {

                        type:
                            "debit",

                        amount:
                            READY_FEE,

                        reason:
                            "ค่าเข้าเล่น Bingo รอบ " +
                            roundId,

                        roundId:
                            roundId,

                        timestamp:
                            Date.now()

                    }
                );

            } catch (historyError) {

                console.error(
                    "READY FEE HISTORY ERROR:",
                    historyError
                );

            }


            if (
                player.uid ===
                currentUser.uid
            ) {

                playerCoins =
                    newCoins;

                updateCoinDisplay();

            }

        }


        // =================================================
        // อัปเดตผู้เล่น
        // =================================================

        const updatedPlayers = {};


        roomPlayers.forEach(
            player => {

                const wasCharged =
                    chargedPlayers.includes(
                        player.uid
                    );


                updatedPlayers[
                    player.uid
                ] = {

                    ...player,

                    ready:
                        false,

                    paidRoundId:
                        wasCharged
                            ? roundId
                            : null,

                    winnerAcknowledged:
                        false

                };


                delete updatedPlayers[
                    player.uid
                ].acknowledgedRoundId;

            }
        );


        // =================================================
        // ถ้าไม่มีใครจ่ายสำเร็จ
        // =================================================

        if (
            chargedPlayers.length ===
            0
        ) {

            await update(
                roomRef,
                {

                    status:
                        "waiting",

                    roundId:
                        null,

                    roundStartedAt:
                        null,

                    players:
                        updatedPlayers,

                    pot:
                        0,

                    paymentProcessedRoundId:
                        null,

                    updatedAt:
                        Date.now()

                }
            );

            await addSystemMessage(
                "⚠️ ไม่มีผู้เล่นที่มีเหรียญเพียงพอสำหรับรอบนี้"
            );

            return;

        }


        // =================================================
        // Countdown → Playing
        // =================================================

        await update(
            roomRef,
            {

                pot:
                    totalPot,

                paymentProcessedRoundId:
                    roundId,

                paymentProcessedAt:
                    Date.now(),

                players:
                    updatedPlayers,

                status:
                    "playing",

                drawnNumbers:
                    [],

                latestNumbers:
                    [],

                updatedAt:
                    Date.now()

            }
        );


        stopCountdown();


        await addSystemMessage(
            "🎮 เริ่มเกมแล้ว! หัก " +
            READY_FEE +
            " เหรียญจากผู้เล่นที่พร้อม " +
            chargedPlayers.length +
            " คน"
        );


    } catch (error) {

        console.error(
            "ADVANCE COUNTDOWN ERROR:",
            error
        );

        // ไม่เปลี่ยน status มั่ว
        // ให้ listener / host ลองประมวลผลใหม่

    } finally {

        advancingCountdown =
            false;

    }

}


// =====================================================
// START GAME
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
            room.status ===
            "countdown" ||
            room.status ===
            "playing"
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
            readyPlayers.length ===
            0
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

                    ready:
                        player.ready === true,

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

                paymentProcessedRoundId:
                    null,

                paymentProcessedAt:
                    null,

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

                winnerBoardData:
                    null,

                winnerRoundId:
                    null,

                prizeAwarded:
                    null,

                potAtWin:
                    null,

                gmFeeAwarded:
                    null,

                prizeDistributionProcessedRoundId:
                    null,

                players:
                    updatedPlayers,

                updatedAt:
                    Date.now()

            }
        );


        // =================================================
        // Host ไม่ต้องหักเงินตัวเอง
        // เพราะ Host ไม่สามารถ Ready ผ่านปุ่ม
        // =================================================

        await addSystemMessage(
            "🎮 Host เปิดเกมรอบใหม่แล้ว! Countdown 30 วินาที"
        );


    } catch (error) {

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


        const status =
            roomData?.status ||
            "waiting";


        if (
            status !== "waiting" &&
            status !== "countdown"
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


        readyBtn.disabled =
            true;


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

        } catch (error) {

            console.error(
                "READY ERROR:",
                error
            );

        } finally {

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

            } else {

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
// INITIALIZE BOARDS
// =====================================================

function initializeBoards() {

    boards = [];

    boards.push(
        createBoard()
    );

    renderBoards();

}


// =====================================================
// RESET LOCAL BOARDS
// =====================================================

function resetLocalBoards() {

    boards = [];

    boards.push(
        createBoard()
    );

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


            boardElement.appendChild(
                title
            );


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


                    cell.type =
                        "button";


                    cell.className =
                        "bingo-cell";


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

                    } else if (
                        board.marked.has(
                            number
                        )
                    ) {

                        cell.classList.add(
                            "marked"
                        );

                        cell.disabled =
                            true;

                    } else if (
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

                    } else {

                        cell.disabled =
                            true;

                        cell.classList.add(
                            "not-drawn"
                        );

                    }


                    grid.appendChild(
                        cell
                    );

                }
            );


            boardElement.appendChild(
                grid
            );


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


    if (!isNumberDrawn(number)) {
        return;
    }


    if (board.marked.has(number)) {
        return;
    }


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


    function complete(row, col) {

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


        if (completeRow) {
            return true;
        }

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


        if (completeColumn) {
            return true;
        }

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


    if (diagonalOne) {
        return true;
    }


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
// CREATE WINNER BOARD DATA
// =====================================================

function createWinnerBoardData(
    boardIndex
) {

    const board =
        boards[boardIndex];


    if (!board) return null;


    return {

        numbers:
            Array.isArray(board.numbers)
                ? [...board.numbers]
                : [],

        marked:
            Array.from(
                board.marked || []
            )

    };

}


// =====================================================
// FINISH BINGO
// =====================================================

async function finishLocalBingo(
    boardIndex
) {

    if (gameFinished) return;

    if (processingWinner) return;

    processingWinner = true;

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


        if (!snapshot.exists()) {
            return;
        }


        const room =
            snapshot.val();


        if (
            room.status !==
            "playing"
        ) {

            return;

        }


        const roundId =
            room.roundId ||
            currentRoundId;


        if (!roundId) {
            return;
        }


        const pot =
            Number(
                room.pot || 0
            );


        const winnerBoardData =
            createWinnerBoardData(
                boardIndex
            );


        // =================================================
        // คำนวณ 80/20
        // =================================================

        const gmFee =
            Math.floor(
                pot *
                GM_PERCENT /
                100
            );


        const prize =
            Math.floor(
                pot *
                PRIZE_PERCENT /
                100
            );


        // =================================================
        // ปิดเกมก่อน
        // เพื่อไม่ให้คนอื่นกด Bingo ซ้ำ
        // =================================================

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
                    roundId,

                winnerBoardData:
                    winnerBoardData,

                prizeAwarded:
                    prize,

                potAtWin:
                    pot,

                gmFee:
                    gmFee,

                prizeDistributionProcessedRoundId:
                    null,

                updatedAt:
                    Date.now()

            }
        );


        // =================================================
        // จ่ายรางวัลแบบกันซ้ำ
        // =================================================

        const latestSnapshot =
            await get(roomRef);


        if (!latestSnapshot.exists()) {
            return;
        }


        const latestRoom =
            latestSnapshot.val();


        if (
            latestRoom.prizeDistributionProcessedRoundId ===
            roundId
        ) {

            return;

        }


        // =================================================
        // GM WALLET 20%
        // =================================================

        if (gmFee > 0) {

            const gmCoinsRef =
                ref(
                    database,
                    "gmWallet/coins"
                );


            const gmResult =
                await runTransaction(
                    gmCoinsRef,
                    currentCoins => {

                        return (
                            Number(
                                currentCoins || 0
                            ) +
                            gmFee
                        );

                    }
                );


            if (!gmResult.committed) {

                throw new Error(
                    "ไม่สามารถเพิ่มเงินเข้า GM Wallet ได้"
                );

            }


            try {

                const gmTxRef =
                    push(
                        ref(
                            database,
                            "gmWallet/transactions"
                        )
                    );


                await set(
                    gmTxRef,
                    {

                        type:
                            "credit",

                        amount:
                            gmFee,

                        reason:
                            "ส่วนแบ่ง GM 20% จาก Bingo รอบ " +
                            roundId,

                        roundId:
                            roundId,

                        timestamp:
                            Date.now()

                    }
                );

            } catch (gmHistoryError) {

                console.error(
                    "GM HISTORY ERROR:",
                    gmHistoryError
                );

            }

        }


        // =================================================
        // WINNER 80%
        // =================================================

        if (prize > 0) {

            const walletCoinsRef =
                ref(
                    database,
                    "wallets/" +
                    currentUser.uid +
                    "/coins"
                );


            const transactionResult =
                await runTransaction(
                    walletCoinsRef,
                    currentCoins => {

                        return (
                            Number(
                                currentCoins || 0
                            ) +
                            prize
                        );

                    }
                );


            if (
                !transactionResult.committed
            ) {

                throw new Error(
                    "ไม่สามารถจ่ายรางวัลให้ผู้ชนะได้"
                );

            }


            try {

                const txRef =
                    push(
                        ref(
                            database,
                            "wallets/" +
                            currentUser.uid +
                            "/transactions"
                        )
                    );


                await set(
                    txRef,
                    {

                        type:
                            "credit",

                        amount:
                            prize,

                        reason:
                            "รางวัล Bingo 80%",

                        roundId:
                            roundId,

                        timestamp:
                            Date.now()

                    }
                );

            } catch (historyError) {

                console.error(
                    "WINNER HISTORY ERROR:",
                    historyError
                );

            }


            playerCoins =
                Number(
                    transactionResult.snapshot.val() ||
                    0
                );


            updateCoinDisplay();

        }


        // =================================================
        // Mark ว่าจ่ายรอบนี้แล้ว
        // =================================================

        await update(
            roomRef,
            {

                prizeDistributionProcessedRoundId:
                    roundId,

                updatedAt:
                    Date.now()

            }
        );


        await addSystemMessage(
            "🎉 BINGO! " +
            winnerName +
            " ชนะด้วยกระดาน #" +
            (boardIndex + 1) +
            (
                prize > 0
                    ? " ได้รับ " +
                      prize +
                      " 🪙"
                    : ""
            )
        );


    } catch (error) {

        console.error(
            "FINISH BINGO ERROR:",
            error
        );

    } finally {

        processingWinner =
            false;

    }

}


// =====================================================
// RENDER WINNER BOARD
// =====================================================

function renderWinnerBoard() {

    if (!winnerBoardContainer) return;


    winnerBoardContainer.innerHTML = "";


    const winnerData =
        roomData?.winnerBoardData;


    if (!winnerData) {

        winnerBoardContainer.innerHTML =
            "<div class=\"winner-board-missing\">" +
            "ไม่พบข้อมูลกระดานที่ชนะ" +
            "</div>";

        return;

    }


    const numbers =
        Array.isArray(
            winnerData.numbers
        )
            ? winnerData.numbers
            : Object.values(
                winnerData.numbers || {}
            );


    const marked =
        new Set(
            Array.isArray(
                winnerData.marked
            )
                ? winnerData.marked
                : Object.values(
                    winnerData.marked || {}
                )
        );


    if (numbers.length !== 25) {

        winnerBoardContainer.innerHTML =
            "<div class=\"winner-board-missing\">" +
            "ข้อมูลกระดานไม่สมบูรณ์" +
            "</div>";

        return;

    }


    const board =
        document.createElement("div");


    board.className =
        "winner-bingo-board";


    const letters =
        document.createElement("div");


    letters.className =
        "winner-bingo-letters";


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
                "winner-bingo-letter";


            element.textContent =
                letter;


            letters.appendChild(
                element
            );

        }
    );


    board.appendChild(
        letters
    );


    const grid =
        document.createElement("div");


    grid.className =
        "winner-bingo-grid";


    numbers.forEach(
        number => {

            const cell =
                document.createElement("div");


            cell.className =
                "winner-bingo-cell";


            if (
                number ===
                "My Friend"
            ) {

                cell.classList.add(
                    "free"
                );


                cell.textContent =
                    "My Friend";

            } else {

                cell.textContent =
                    number;


                if (
                    marked.has(number)
                ) {

                    cell.classList.add(
                        "marked"
                    );

                }

            }


            grid.appendChild(
                cell
            );

        }
    );


    board.appendChild(
        grid
    );


    winnerBoardContainer.appendChild(
        board
    );

}


// =====================================================
// WINNER POPUP
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
            (
                isMe
                    ? "คุณ"
                    : winnerName
            ) +
            " ได้ BINGO" +
            (
                winnerBoard
                    ? " ด้วยกระดาน #" +
                      winnerBoard
                    : ""
            );

    }


    if (winnerBoardTitle) {

        winnerBoardTitle.textContent =
            winnerBoard
                ? "🏆 กระดานที่ชนะ #" +
                  winnerBoard
                : "🏆 กระดานที่ชนะ";

    }


    renderWinnerBoard();


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
                : "รอบนี้ยังไม่มีเงินรางวัล";

    }


    if (winnerConfirmStatus) {

        winnerConfirmStatus.textContent =
            "กดตกลงเพื่อเตรียมเล่นรอบใหม่";

    }


    if (winnerConfirmBtn) {
        winnerConfirmBtn.disabled = false;
    }


    winnerModal.hidden = false;

}


// =====================================================
// HIDE WINNER POPUP
// =====================================================

function hideWinnerPopup() {

    if (winnerModal) {
        winnerModal.hidden = true;
    }

}


// =====================================================
// WINNER CONFIRM
// =====================================================

winnerConfirmBtn?.addEventListener(
    "click",
    acknowledgeWinner
);


// =====================================================
// ACKNOWLEDGE WINNER
// =====================================================

async function acknowledgeWinner() {

    if (
        !currentUser ||
        !roomId
    ) {

        return;

    }


    const roundId =
        roomData?.winnerRoundId ||
        roomData?.roundId ||
        currentRoundId ||
        null;


    if (!roundId) {

        console.error(
            "ACKNOWLEDGE ERROR: ไม่พบ Round ID"
        );

        return;

    }


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


        winnerPopupRoundId =
            null;


        hideWinnerPopup();


        resetLocalBoards();


        gameFinished =
            false;


        updateRoomInfo();


    } catch (error) {

        console.error(
            "ACKNOWLEDGE WINNER ERROR:",
            error
        );


        if (winnerConfirmStatus) {

            winnerConfirmStatus.textContent =
                "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";

        }


        if (winnerConfirmBtn) {
            winnerConfirmBtn.disabled = false;
        }

    }

}


// =====================================================
// BOARD CONTROLS
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


    if (buyingBoard) {

        buyBoardBtn.disabled =
            true;

        buyBoardBtn.innerHTML =
            "กำลังซื้อ...";

        return;

    }


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


    const status =
        roomData?.status ||
        "waiting";


    // =================================================
    // ซื้อได้เฉพาะ Lobby / Countdown
    // =================================================

    if (
        status !== "waiting" &&
        status !== "countdown"
    ) {

        buyBoardBtn.disabled =
            true;

        buyBoardBtn.innerHTML =
            "🔒 ล็อคระหว่างเกม";

        return;

    }


    if (
        Number(playerCoins || 0) <
        BOARD_PRICE
    ) {

        buyBoardBtn.disabled =
            true;

        buyBoardBtn.innerHTML =
            "➕ ซื้อกระดาน " +
            "<span>" +
            BOARD_PRICE +
            " 🪙</span>";

    } else {

        buyBoardBtn.disabled =
            false;

        buyBoardBtn.innerHTML =
            "➕ ซื้อกระดาน " +
            "<span>" +
            BOARD_PRICE +
            " 🪙</span>";

    }

}


// =====================================================
// BUY BOARD
// =====================================================

buyBoardBtn?.addEventListener(
    "click",
    buyBoard
);


async function buyBoard() {

    if (buyingBoard) return;


    if (
        boards.length >=
        MAX_BOARDS
    ) {

        return;

    }


    if (!currentUser || !roomId) {
        return;
    }


    const status =
        roomData?.status ||
        "waiting";


    if (
        status !== "waiting" &&
        status !== "countdown"
    ) {

        return;

    }


    buyingBoard =
        true;


    updateBoardControls();


    try {

        const walletCoinsRef =
            ref(
                database,
                "wallets/" +
                currentUser.uid +
                "/coins"
            );


        // =================================================
        // อ่านเหรียญจริงก่อน
        // =================================================

        const walletSnapshot =
            await get(
                walletCoinsRef
            );


        const actualCoins =
            walletSnapshot.exists()
                ? Number(
                    walletSnapshot.val() || 0
                )
                : 0;


        playerCoins =
            actualCoins;


        updateCoinDisplay();


        if (
            actualCoins <
            BOARD_PRICE
        ) {

            throw new Error(
                "เหรียญไม่เพียงพอ"
            );

        }


        // =================================================
        // ตรวจห้องล่าสุด
        // =================================================

        const roomRef =
            ref(
                database,
                "bingoRooms/" +
                roomId
            );


        const roomSnapshot =
            await get(
                roomRef
            );


        if (!roomSnapshot.exists()) {

            throw new Error(
                "ไม่พบห้อง Bingo"
            );

        }


        const currentRoom =
            roomSnapshot.val();


        if (
            currentRoom.status !==
                "waiting" &&
            currentRoom.status !==
                "countdown"
        ) {

            throw new Error(
                "เกมเริ่มแล้ว ไม่สามารถซื้อกระดานได้"
            );

        }


        // =================================================
        // สร้างกระดานก่อนหักเงินจริง
        // =================================================

        const newBoard =
            createBoard();


        // =================================================
        // หักเงินด้วย Transaction
        // =================================================

        const transactionResult =
            await runTransaction(
                walletCoinsRef,
                currentCoins => {

                    const coins =
                        Number(
                            currentCoins || 0
                        );


                    if (
                        coins <
                        BOARD_PRICE
                    ) {

                        return;

                    }


                    return (
                        coins -
                        BOARD_PRICE
                    );

                }
            );


        if (
            !transactionResult.committed
        ) {

            await refreshPlayerCoins();


            throw new Error(
                "เหรียญไม่เพียงพอ หรือ Wallet ถูกเปลี่ยนแปลง"
            );

        }


        const newCoins =
            Number(
                transactionResult.snapshot.val() ||
                0
            );


        playerCoins =
            newCoins;


        updateCoinDisplay();


        // =================================================
        // Transaction History
        // =================================================

        try {

            const txRef =
                push(
                    ref(
                        database,
                        "wallets/" +
                        currentUser.uid +
                        "/transactions"
                    )
                );


            await set(
                txRef,
                {

                    type:
                        "debit",

                    amount:
                        BOARD_PRICE,

                    reason:
                        "ซื้อกระดาน Bingo เพิ่ม",

                    timestamp:
                        Date.now()

                }
            );

        } catch (historyError) {

            console.error(
                "BUY BOARD HISTORY ERROR:",
                historyError
            );

        }


        // =================================================
        // ตรวจสถานะห้องอีกครั้ง
        // =================================================

        const latestRoomSnapshot =
            await get(
                roomRef
            );


        if (!latestRoomSnapshot.exists()) {

            await runTransaction(
                walletCoinsRef,
                currentCoins => {

                    return (
                        Number(
                            currentCoins || 0
                        ) +
                        BOARD_PRICE
                    );

                }
            );


            await refreshPlayerCoins();


            throw new Error(
                "ไม่พบห้อง Bingo"
            );

        }


        const latestRoom =
            latestRoomSnapshot.val();


        if (
            latestRoom.status !==
                "waiting" &&
            latestRoom.status !==
                "countdown"
        ) {

            await runTransaction(
                walletCoinsRef,
                currentCoins => {

                    return (
                        Number(
                            currentCoins || 0
                        ) +
                        BOARD_PRICE
                    );

                }
            );


            await refreshPlayerCoins();


            throw new Error(
                "เกมเริ่มแล้ว ไม่สามารถซื้อกระดานได้"
            );

        }


        // =================================================
        // เพิ่มกระดานในเครื่อง
        // =================================================

        boards.push(
            newBoard
        );


        renderBoards();

        updateBoardControls();


    } catch (error) {

        console.error(
            "BUY BOARD ERROR:",
            error
        );


        await refreshPlayerCoins();


        alert(
            "ซื้อกระดานไม่สำเร็จ\n" +
            error.message
        );

    } finally {

        buyingBoard =
            false;

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
            await get(
                roomRef
            );


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
                !numbers.includes(
                    number
                )
            ) {

                availableNumbers.push(
                    number
                );

            }

        }


        if (
            availableNumbers.length ===
            0
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


        await addSystemMessage(
            "🎲 ออกเลข " +
            formatBingoNumber(
                number
            )
        );


    } catch (error) {

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
        getBingoLetter(
            number
        );


    latestDrawNumber.textContent =
        formatBingoNumber(
            number
        );


    latestDrawNumber.className =
        "latest-draw-number latest-" +
        letter.toLowerCase();

}


// =====================================================
// LAST 5
// =====================================================

function updateLatestNumbers() {

    if (!latestNumbersElement) return;


    latestNumbersElement.innerHTML =
        "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const span =
            document.createElement(
                "span"
            );


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

        } else {

            const letter =
                getBingoLetter(
                    number
                );


            span.textContent =
                formatBingoNumber(
                    number
                );


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


    chatListenerStarted =
        true;


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


            chatMessages.innerHTML =
                "";


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


    expandedChatMessages.innerHTML =
        "";


    if (chatMessages) {

        const messages =
            chatMessages.querySelectorAll(
                ".chat-message"
            );


        messages.forEach(
            message => {

                const clone =
                    message.cloneNode(
                        true
                    );


                expandedChatMessages.appendChild(
                    clone
                );

            }
        );

    }


    chatModal.hidden =
        false;


    expandedChatMessages.scrollTop =
        expandedChatMessages.scrollHeight;

}


function closeChatModal() {

    if (chatModal) {
        chatModal.hidden = true;
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
            push(
                chatRef
            );


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


    } catch (error) {

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
        document.createElement(
            "div"
        );


    element.className =
        "chat-message";


    if (
        message.uid ===
        currentUser?.uid
    ) {

        element.classList.add(
            "my-message"
        );

    } else {

        element.classList.add(
            "other-message"
        );

    }


    const nameElement =
        document.createElement(
            "b"
        );


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
            push(
                chatRef
            );


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


    } catch (error) {

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

        } catch (disconnectError) {

            console.warn(
                "CANCEL DISCONNECT WARNING:",
                disconnectError
            );

        }


        const snapshot =
            await get(
                roomRef
            );


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
                    remainingIds.length ===
                    0
                ) {

                    await set(
                        roomRef,
                        null
                    );

                } else {

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

    } catch (error) {

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
updateBoardControls();