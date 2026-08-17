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
// ROOM ID
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

let hasJoinedRoom = false;


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

const boardCountText =
    document.getElementById(
        "boardCountText"
    );

const buyBoardBtn =
    document.getElementById(
        "buyBoardBtn"
    );

const drawNumberBtn =
    document.getElementById(
        "drawNumberBtn"
    );

const drawResult =
    document.getElementById(
        "drawResult"
    );

const hostControls =
    document.getElementById(
        "hostControls"
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


        currentUser =
            user;


        await loadCurrentUserData();

        await loadPlayerCoins();

        await loadRoom();

    }
);


// =====================================================
// LOAD USER DATA
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

                displayName:
                    "Player"

            };

        }

    }
    catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

        currentUserData = {

            displayName:
                "Player"

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

            playerCoins =
                0;

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
// UPDATE COIN DISPLAY
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


        // =============================================
        // เข้าห้องจริง
        // =============================================

        await joinRoom();


        // =============================================
        // สร้างกระดานฟรี
        // =============================================

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
// JOIN ROOM FOR REAL FIREBASE
// ใช้ GET + UPDATE แทน runTransaction
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


    try {

        // =============================================
        // อ่านห้องล่าสุดจาก Firebase
        // =============================================

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


        // =============================================
        // ผู้เล่นอยู่ในห้องแล้ว
        // =============================================

        if (
            room.players &&
            room.players[
                currentUser.uid
            ]
        ) {

            hasJoinedRoom =
                true;

            return;

        }


        // =============================================
        // ตรวจจำนวนผู้เล่น
        // =============================================

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


        // =============================================
        // ข้อมูลผู้เล่น
        // =============================================

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


        // =============================================
        // UPDATE Firebase
        // =============================================

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


        hasJoinedRoom =
            true;


        console.log(
            "JOIN ROOM SUCCESS:",
            roomId
        );

    }
    catch (error) {

        console.error(
            "JOIN ROOM ERROR:",
            error
        );

        throw new Error(
            "[" +
            (error.code || "no-code") +
            "] " +
            error.message
        );

    }

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


            // =========================================
            // อ่านเลขจาก Firebase
            // =========================================

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


            updateRoomInfo();

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


    // =================================================
    // ROOM NAME
    // =================================================

    const roomNameElement =
        document.querySelector(
            ".room-name"
        );


    if (roomNameElement) {

        roomNameElement.textContent =
            roomData.name ||
            "ห้อง Bingo";

    }


    // =================================================
    // STATUS
    // =================================================

    const roomStatusElement =
        document.querySelector(
            ".room-status"
        );


    if (roomStatusElement) {

        // ไม่มีขั้นตอนกด Start แล้ว

        roomStatusElement.textContent =
            "กำลังเล่น";

    }


    // =================================================
    // PLAYERS
    // =================================================

    players = [];


    if (roomData.players) {

        Object.values(
            roomData.players
        ).forEach(
            player => {

                players.push(
                    player
                );

            }
        );

    }


    updatePlayerCount();

    updatePlayerList();


    // =================================================
    // HOST / PLAYER CONTROLS
    // =================================================

    if (isRoomOwner) {

        // -------------------------------------------
        // เจ้าของห้อง → โชว์ปุ่มสุ่ม
        // -------------------------------------------

        if (hostControls) {

            hostControls.style.display =
                "";

        }

        if (gameControls) {

            gameControls.style.display =
                "none";

        }

    }
    else {

        // -------------------------------------------
        // ผู้เล่นทั่วไป → โชว์ปุ่มพร้อม
        // -------------------------------------------

        if (hostControls) {

            hostControls.style.display =
                "none";

        }

        if (gameControls) {

            gameControls.style.display =
                "";

        }


        if (readyBtn) {

            readyBtn.style.display =
                "";


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


            readyBtn.textContent =
                isReady
                    ? "✅ พร้อมแล้ว"
                    : "พร้อม";


            readyBtn.classList.toggle(
                "ready-active",
                isReady
            );

        }

    }

}


// =====================================================
// READY BUTTON
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


        const myPlayer =
            roomData?.players
                ? roomData.players[
                    currentUser.uid
                ]
                : null;


        const newReady =
            !(
                myPlayer &&
                myPlayer.ready
            );


        readyBtn.disabled =
            true;


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


    playerList.innerHTML =
        "";


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


            playerList.appendChild(
                item
            );

        }
    );

}


// =====================================================
// PLAYER MODAL
// =====================================================

playerCountBtn?.addEventListener(
    "click",
    () => {

        if (!playerModal) {
            return;
        }

        playerModal.hidden =
            false;

    }
);


closePlayerModalBtn?.addEventListener(
    "click",
    () => {

        if (playerModal) {

            playerModal.hidden =
                true;

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

            playerModal.hidden =
                true;

        }

    }
);


// =====================================================
// BOARD NUMBER GENERATOR
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


    const result = [];


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

                numbers.push(
                    number
                );

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


            result.push(
                ...numbers.slice(
                    0,
                    5
                )
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

            const index =
                col * 5 +
                row;


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
                    result[index]
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


    boardsContainer.innerHTML =
        "";


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
                        isNumberDrawn(
                            number
                        )
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

    const board =
        boards[boardIndex];


    if (!board) {
        return;
    }


    if (
        !isNumberDrawn(number)
    ) {
        return;
    }


    if (
        board.marked.has(number)
    ) {
        return;
    }


    board.marked.add(
        number
    );


    if (
        checkBoardForBingo(
            boardIndex
        )
    ) {

        addSystemMessage(
            "🎉 BINGO!"
        );

    }


    renderBoards();

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


    // Horizontal

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        let ok = true;


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

                ok = false;

                break;

            }

        }


        if (ok) {
            return true;
        }

    }


    // Vertical

    for (
        let col = 0;
        col < 5;
        col++
    ) {

        let ok = true;


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

                ok = false;

                break;

            }

        }


        if (ok) {
            return true;
        }

    }


    // Diagonal \

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

            diagonalOne = false;

            break;

        }

    }


    if (diagonalOne) {
        return true;
    }


    // Diagonal /

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

            diagonalTwo = false;

            break;

        }

    }


    return diagonalTwo;

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

    }
    else {

        buyBoardBtn.disabled =
            playerCoins <
            BOARD_PRICE;

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


        // ตอนนี้ยังหักเฉพาะหน้าจอ
        // ระบบ Wallet จริงจะทำในขั้นตอนถัดไป

        playerCoins -=
            BOARD_PRICE;


        boards.push(
            createBoard()
        );


        updateCoinDisplay();

        renderBoards();


        addSystemMessage(
            "ซื้อกระดานเพิ่มสำเร็จ"
        );

    }
);


// =====================================================
// HOST DRAW REAL FIREBASE
// ใช้ GET + UPDATE แทน runTransaction
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


    const roomRef =
        ref(
            database,
            "bingoRooms/" +
            roomId
        );


    try {

        // =============================================
        // อ่านห้องล่าสุดจาก Firebase
        // =============================================

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


        // =============================================
        // ตรวจว่าเป็น Host จริงหรือไม่
        // =============================================

        if (
            room.hostUid !==
            currentUser.uid
        ) {

            throw new Error(
                "คุณไม่มีสิทธิ์สุ่มเลข"
            );

        }


        // =============================================
        // อ่านเลขที่ออกไปแล้ว
        // =============================================

        const numbers =
            Array.isArray(
                room.drawnNumbers
            )
                ? room.drawnNumbers
                : Object.values(
                    room.drawnNumbers || {}
                );


        // =============================================
        // หาเลขที่ยังไม่ออก
        // =============================================

        const availableNumbers =
            [];


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


        // =============================================
        // เลขออกครบ 75 แล้ว
        // =============================================

        if (
            availableNumbers.length ===
            0
        ) {

            alert(
                "เลข Bingo ออกครบทั้ง 75 เลขแล้ว"
            );

            return;

        }


        // =============================================
        // สุ่มเลข
        // =============================================

        const randomIndex =
            Math.floor(
                Math.random() *
                availableNumbers.length
            );


        const number =
            availableNumbers[
                randomIndex
            ];


        // =============================================
        // สร้างรายการเลขใหม่
        // =============================================

        const newNumbers =
            [
                ...numbers,
                number
            ];


        // =============================================
        // Latest 5 numbers
        // =============================================

        let newLatest =
            Array.isArray(
                room.latestNumbers
            )
                ? room.latestNumbers
                : Object.values(
                    room.latestNumbers || {}
                );


        newLatest = [
            number,
            ...newLatest
        ].slice(
            0,
            5
        );


        const now =
            Date.now();


        // =============================================
        // UPDATE Firebase
        // =============================================

        await update(
            roomRef,
            {

                drawnNumbers:
                    newNumbers,

                latestNumbers:
                    newLatest,

                updatedAt:
                    now

            }
        );


        // =============================================
        // อัปเดตหน้าจอ Host ทันที
        // =============================================

        if (drawResult) {

            drawResult.textContent =
                getBingoLetter(number) +
                number;

        }


        addSystemMessage(
            "🎲 ออกเลข " +
            getBingoLetter(number) +
            number
        );


        console.log(
            "DRAW NUMBER SUCCESS:",
            getBingoLetter(number) +
            number
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
// LATEST NUMBERS
// =====================================================

function updateLatestNumbers() {

    if (!latestNumbersElement) {
        return;
    }


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


        if (
            latestNumbers[i] ===
            undefined
        ) {

            span.textContent =
                "-";

            span.classList.add(
                "latest-empty"
            );

        }
        else {

            const number =
                latestNumbers[i];


            const letter =
                getBingoLetter(
                    number
                );


            span.textContent =
                letter +
                number;


            span.classList.add(
                "latest-" +
                letter.toLowerCase()
            );


            if (
                i === 0
            ) {

                span.classList.add(
                    "latest-current"
                );

            }

        }


        latestNumbersElement.appendChild(
            span
        );

    }

}


// =====================================================
// CHAT REAL FIREBASE
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


            chatMessages.innerHTML =
                "";


            if (!snapshot.exists()) {
                return;
            }


            const messages =
                Object.values(
                    snapshot.val()
                );


            const latest =
                messages.slice(
                    -3
                );


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
                "CHAT ERROR:",
                error
            );

        }
    );

}


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


    if (!currentUser || !roomId) {
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


        if (chatInput) {
            chatInput.value = "";
        }

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


    const name =
        message.displayName ||
        "Player";


    element.innerHTML =
        "<b>" +
        escapeHtml(name) +
        ":</b> " +
        escapeHtml(
            message.text || ""
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

    if (!currentUser || !roomId) {
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

    }
    catch (error) {

        console.error(
            "SYSTEM MESSAGE ERROR:",
            error
        );

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

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
// LEAVE ROOM REAL FIREBASE
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
            await get(
                roomRef
            );


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
            remainingIds.length === 0
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


            // =========================================
            // ถ้า Host ออก
            // ให้ผู้เล่นคนแรกเป็น Host คนใหม่
            // =========================================

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
// GO BACK TO ROOM
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