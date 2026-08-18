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
    remove
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


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// ROOM
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const roomId =
    urlParams.get("room");


// =====================================================
// SETTINGS
// =====================================================

const BOARD_PRICE = 20;

const MAX_BOARDS = 4;

const FREE_BOARDS = 1;

const MAX_PLAYERS = 20;


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


// =====================================================
// ELEMENTS
// =====================================================

const boardsContainer =
    document.getElementById(
        "boardsContainer"
    );

const coinDisplay =
    document.getElementById(
        "coinDisplay"
    );

const playerCount =
    document.getElementById(
        "playerCount"
    );

const playerCountBtn =
    document.getElementById(
        "playerCountBtn"
    );

const roomNameElement =
    document.getElementById(
        "roomName"
    );

const roomStatusElement =
    document.getElementById(
        "roomStatus"
    );

const boardCountText =
    document.getElementById(
        "boardCountText"
    );

const buyBoardBtn =
    document.getElementById(
        "buyBoardBtn"
    );

const hostControls =
    document.getElementById(
        "hostControls"
    );

const startGameBtn =
    document.getElementById(
        "startGameBtn"
    );

const drawNumberBtn =
    document.getElementById(
        "drawNumberBtn"
    );

const drawResult =
    document.getElementById(
        "drawResult"
    );

const gameControls =
    document.getElementById(
        "gameControls"
    );

const readyBtn =
    document.getElementById(
        "readyBtn"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const chatSendBtn =
    document.getElementById(
        "chatSendBtn"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const latestDrawNumber =
    document.getElementById(
        "latestDrawNumber"
    );

const latestNumbersElement =
    document.getElementById(
        "latestNumbers"
    );

const playerModal =
    document.getElementById(
        "playerModal"
    );

const playerList =
    document.getElementById(
        "playerList"
    );

const closePlayerModalBtn =
    document.getElementById(
        "closePlayerModalBtn"
    );

const leaveRoomBtn =
    document.getElementById(
        "leaveRoomBtn"
    );

const leaveModal =
    document.getElementById(
        "leaveModal"
    );

const cancelLeaveBtn =
    document.getElementById(
        "cancelLeaveBtn"
    );

const confirmLeaveBtn =
    document.getElementById(
        "confirmLeaveBtn"
    );

const chatSection =
    document.getElementById(
        "chatSection"
    );

const chatModal =
    document.getElementById(
        "chatModal"
    );

const expandedChatMessages =
    document.getElementById(
        "expandedChatMessages"
    );

const closeChatModalBtn =
    document.getElementById(
        "closeChatModalBtn"
    );


// =====================================================
// BINGO LETTER
// =====================================================

function getBingoLetter(number) {

    if (number >= 1 && number <= 15) {
        return "B";
    }

    if (number >= 16 && number <= 30) {
        return "I";
    }

    if (number >= 31 && number <= 45) {
        return "N";
    }

    if (number >= 46 && number <= 60) {
        return "G";
    }

    if (number >= 61 && number <= 75) {
        return "O";
    }

    return "";

}


// =====================================================
// FORMAT NUMBER
// =====================================================

function formatBingoNumber(number) {

    if (
        typeof number !== "number"
    ) {

        return "-";

    }

    return (
        getBingoLetter(number) +
        number
    );

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

    if (!currentUser) {
        return;
    }

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

        }

        else {

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

            playerCoins =
                Number(
                    wallet.coins || 0
                );

        }

        else {

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

    if (!coinDisplay) {
        return;
    }

    coinDisplay.textContent =
        playerCoins.toLocaleString();

}


// =====================================================
// LOAD ROOM
// =====================================================

async function loadRoom() {

    if (!roomId) {

        alert(
            "ไม่พบ Room ID"
        );

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
// =====================================================

async function joinRoom() {

    if (
        !currentUser ||
        !roomId
    ) {
        return;
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
        room.players[
            currentUser.uid
        ]
    ) {

        return;

    }

    const currentCount =
        room.players
            ? Object.keys(
                room.players
            ).length
            : 0;

    if (
        currentCount >=
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

    const playerData = {

        uid:
            currentUser.uid,

        displayName:
            displayName,

        joinedAt:
            now,

        ready:
            false

    };

    await update(
        roomRef,
        {

            ["players/" +
            currentUser.uid]:
                playerData,

            playerCount:
                currentCount + 1,

            updatedAt:
                now

        }
    );

}


// =====================================================
// SUBSCRIBE ROOM
// =====================================================

function subscribeRoom() {

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

            roomData =
                snapshot.val();

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

            gameFinished =
                roomData.gameStatus ===
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

    if (!roomData) {
        return;
    }

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


    // =================================================
    // GAME STATUS
    // =================================================

    const status =
        roomData.gameStatus ||
        "waiting";

    if (roomStatusElement) {

        if (
            status === "finished"
        ) {

            roomStatusElement.textContent =
                "จบเกม";

        }

        else if (
            status === "playing"
        ) {

            roomStatusElement.textContent =
                "กำลังเล่น";

        }

        else if (
            status === "ready"
        ) {

            roomStatusElement.textContent =
                "พร้อมเริ่มเกม";

        }

        else {

            roomStatusElement.textContent =
                "รอผู้เล่น";

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

        if (startGameBtn) {

            const canStart =
                players.length > 0 &&
                status !== "playing" &&
                status !== "finished";

            startGameBtn.disabled =
                !canStart;

        }

        if (drawNumberBtn) {

            drawNumberBtn.disabled =
                status !== "playing" ||
                gameFinished;

        }

    }

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
                status === "playing" ||
                status === "finished";

        }

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

    if (!isRoomOwner) {
        return;
    }

    if (!currentUser || !roomId) {
        return;
    }

    if (players.length <= 0) {

        alert(
            "ต้องมีผู้เล่นเข้าห้องก่อน"
        );

        return;

    }

    if (
        roomData?.gameStatus ===
        "playing"
    ) {
        return;
    }

    if (
        roomData?.gameStatus ===
        "finished"
    ) {
        return;
    }

    const readyPlayers =
        players.filter(
            player =>
                player.ready === true
        );

    if (readyPlayers.length === 0) {

        alert(
            "ต้องมีผู้เล่นกดพร้อมก่อนเริ่มเกม"
        );

        return;

    }

    try {

        await update(
            ref(
                database,
                "bingoRooms/" +
                roomId
            ),
            {

                gameStatus:
                    "playing",

                gameStartedAt:
                    Date.now(),

                winnerUid:
                    null,

                winnerName:
                    null,

                updatedAt:
                    Date.now()

            }
        );

        addSystemMessage(
            "🎮 เปิดเกม Bingo แล้ว"
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

        if (isRoomOwner) {
            return;
        }

        if (
            !currentUser ||
            !roomId
        ) {
            return;
        }

        if (
            roomData?.gameStatus ===
            "playing"
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

        if (!myPlayer) {
            return;
        }

        const newReady =
            !myPlayer.ready;

        readyBtn.disabled = true;

        try {

            await set(
                ref(
                    database,
                    "bingoRooms/" +
                    roomId +
                    "/players/" +
                    currentUser.uid +
                    "/ready"
                ),
                newReady
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

    if (!playerCount) {
        return;
    }

    playerCount.textContent =
        players.length +
        "/" +
        MAX_PLAYERS;

}


// =====================================================
// PLAYER LIST
// =====================================================

function updatePlayerList() {

    if (!playerList) {
        return;
    }

    playerList.innerHTML = "";

    players.forEach(
        player => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "player-item";

            const icon =
                document.createElement(
                    "span"
                );

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
                document.createElement(
                    "span"
                );

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

        {
            min: 1,
            max: 15
        },

        {
            min: 16,
            max: 30
        },

        {
            min: 31,
            max: 45
        },

        {
            min: 46,
            max: 60
        },

        {
            min: 61,
            max: 75
        }

    ];

    const columnNumbers = [];

    columns.forEach(
        column => {

            const numbers = [];

            for (
                let number =
                    column.min;
                number <=
                    column.max;
                number++
            ) {

                numbers.push(number);

            }

            for (
                let i =
                    numbers.length - 1;
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
// INITIALIZE BOARDS
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

    if (!boardsContainer) {
        return;
    }

    boardsContainer.innerHTML = "";

    boardsContainer.className =
        "boards-container board-count-" +
        boards.length;

    boards.forEach(
        (board, boardIndex) => {

            const boardElement =
                document.createElement(
                    "div"
                );

            boardElement.className =
                "bingo-board";

            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "board-title";

            title.textContent =
                "BINGO #" +
                (boardIndex + 1);

            boardElement.appendChild(
                title
            );


            const letters =
                document.createElement(
                    "div"
                );

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
                        document.createElement(
                            "div"
                        );

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
                document.createElement(
                    "div"
                );

            grid.className =
                "bingo-grid";


            board.numbers.forEach(
                number => {

                    const cell =
                        document.createElement(
                            "button"
                        );

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

                    }

                    else if (
                        board.marked.has(
                            number
                        )
                    ) {

                        cell.classList.add(
                            "marked"
                        );

                        cell.disabled =
                            true;

                    }

                    else if (
                        isNumberDrawn(number) &&
                        !gameFinished
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

    if (gameFinished) {
        return;
    }

    const board =
        boards[boardIndex];

    if (!board) {
        return;
    }

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

    if (!board) {
        return false;
    }


    function complete(
        row,
        col
    ) {

        const index =
            row * 5 +
            col;

        const value =
            board.numbers[index];

        if (
            value ===
            "My Friend"
        ) {

            return true;

        }

        return board.marked.has(
            value
        );

    }


    // -------------------------------------------------
    // แนวนอน
    // -------------------------------------------------

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
                !complete(
                    row,
                    col
                )
            ) {

                completeRow =
                    false;

                break;

            }

        }

        if (completeRow) {
            return true;
        }

    }


    // -------------------------------------------------
    // แนวตั้ง
    // -------------------------------------------------

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
                !complete(
                    row,
                    col
                )
            ) {

                completeColumn =
                    false;

                break;

            }

        }

        if (completeColumn) {
            return true;
        }

    }


    // -------------------------------------------------
    // แนวทแยง \
    // -------------------------------------------------

    let diagonalOne = true;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            !complete(
                i,
                i
            )
        ) {

            diagonalOne =
                false;

            break;

        }

    }

    if (diagonalOne) {
        return true;
    }


    // -------------------------------------------------
    // แนวทแยง /
    // -------------------------------------------------

    let diagonalTwo = true;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            !complete(
                i,
                4 - i
            )
        ) {

            diagonalTwo =
                false;

            break;

        }

    }

    return diagonalTwo;

}


// =====================================================
// FINISH BINGO
// =====================================================

async function finishLocalBingo(
    boardIndex
) {

    if (gameFinished) {
        return;
    }

    gameFinished = true;

    const winnerName =
        currentUserData?.displayName ||
        "Player";

    if (drawNumberBtn) {
        drawNumberBtn.disabled =
            true;
    }

    if (readyBtn) {
        readyBtn.disabled =
            true;
    }

    renderBoards();

    addSystemMessage(
        "🎉 BINGO! " +
        winnerName +
        " ชนะด้วยกระดาน #" +
        (boardIndex + 1)
    );


    // -------------------------------------------------
    // แจ้งสถานะเกมไว้ใน Firebase
    // การตรวจสิทธิ์และการแจกเหรียญ
    // ต้องบังคับด้วย Rules / Backend
    // -------------------------------------------------

    if (
        currentUser &&
        roomId
    ) {

        try {

            await update(
                ref(
                    database,
                    "bingoRooms/" +
                    roomId
                ),
                {

                    gameStatus:
                        "finished",

                    winnerUid:
                        currentUser.uid,

                    winnerName:
                        winnerName,

                    winnerBoard:
                        boardIndex + 1,

                    finishedAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                }
            );

        }

        catch (error) {

            console.error(
                "FINISH BINGO ERROR:",
                error
            );

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

    if (!buyBoardBtn) {
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
// =====================================================

buyBoardBtn?.addEventListener(
    "click",
    () => {

        if (
            boards.length >=
            MAX_BOARDS
        ) {
            return;
        }

        if (
            playerCoins <
            BOARD_PRICE
        ) {

            alert(
                "เหรียญไม่เพียงพอ"
            );

            return;

        }


        // ------------------------------------------------
        // ตอนนี้เป็นการเพิ่มกระดานฝั่งหน้าจอเท่านั้น
        // การหัก Wallet จริงต้องทำด้วยระบบที่ปลอดภัย
        // ------------------------------------------------

        playerCoins -=
            BOARD_PRICE;

        boards.push(
            createBoard()
        );

        updateCoinDisplay();

        renderBoards();

    }
);


// =====================================================
// HOST DRAW
// =====================================================

drawNumberBtn?.addEventListener(
    "click",
    drawNumber
);


async function drawNumber() {

    if (!isRoomOwner) {
        return;
    }

    if (
        !currentUser ||
        !roomId
    ) {
        return;
    }

    if (
        roomData?.gameStatus !==
        "playing"
    ) {

        return;

    }

    if (gameFinished) {
        return;
    }


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
            room.gameStatus !==
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

    if (!latestDrawNumber) {
        return;
    }

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

    if (!latestNumbersElement) {
        return;
    }

    latestNumbersElement.innerHTML = "";

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

    if (!roomId) {
        return;
    }

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

            if (!chatMessages) {
                return;
            }

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

    chatModal.hidden =
        false;

    expandedChatMessages.scrollTop =
        expandedChatMessages.scrollHeight;

}


// =====================================================
// CLOSE CHAT
// =====================================================

function closeChatModal() {

    if (chatModal) {

        chatModal.hidden =
            true;

    }

}


// =====================================================
// CHAT EVENTS
// =====================================================

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

    if (!text) {
        return;
    }

    if (
        !currentUser ||
        !roomId
    ) {
        return;
    }


    if (
        roomData?.chatEnabled ===
        false
    ) {

        alert(
            "เจ้าของห้องปิดแชทอยู่"
        );

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

    if (!chatMessages) {
        return;
    }

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

    }

    else {

        element.classList.add(
            "other-message"
        );

    }


    const name =
        message.displayName ||
        "Player";


    const nameElement =
        document.createElement(
            "b"
        );

    nameElement.textContent =
        name;


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
// LEAVE ROOM
// =====================================================

leaveRoomBtn?.addEventListener(
    "click",
    () => {

        if (leaveModal) {
            leaveModal.hidden =
                false;
        }

    }
);


cancelLeaveBtn?.addEventListener(
    "click",
    () => {

        if (leaveModal) {
            leaveModal.hidden =
                true;
        }

    }
);


confirmLeaveBtn?.addEventListener(
    "click",
    async () => {

        if (leaveModal) {
            leaveModal.hidden =
                true;
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

            leaveModal.hidden =
                true;

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

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) {

            goBackToRoom();

            return;

        }

        const room =
            snapshot.val();

        const remainingPlayers = {
            ...(room.players || {})
        };

        delete remainingPlayers[
            currentUser.uid
        ];

        const remainingIds =
            Object.keys(
                remainingPlayers
            );


        if (
            remainingIds.length ===
            0
        ) {

            await remove(
                roomRef
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
                    remainingPlayers[
                        newHostUid
                    ].displayName ||
                    "Player";

            }


            await set(
                roomRef,
                {

                    ...room,

                    players:
                        remainingPlayers,

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