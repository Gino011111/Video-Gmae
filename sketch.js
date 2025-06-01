let cam;
let showIntro = true;        // 新增：是否顯示說明畫面
let introStartTime = 0;      // 新增：說明畫面開始時間

// 題庫
let questions = [
  {
    text: "1.下列哪個不是淡江大學有的校區？",
    options: [
      "(A)淡水校園",
      "(B)台北校園",
      "(C)蘭陽校園",
      "(D)八里校區"
    ],
    answer: 3
  },
  {
    text: "2.下列哪個是教育科系的出路？",
    options: [
      "(A)教學設計師",
      "(B)教育訓練人員",
      "(C)動畫設計人員",
      "(D)以上皆是"
    ],
    answer: 3
  },
  {
    text: "3.淡江教育科技學系隸屬於哪個學院？",
    options: [
      "(A) 文學院",
      "(B) 理學院",
      "(C) 教育學院",
      "(D) 商學院"
    ],
    answer: 2
  },
  {
    text: "4.教育科系畢業學分是多少？",
    options: [
      "(A)127",
      "(B)128",
      "(C)129",
      "(D)130"
    ],
    answer: 1
  },
  {
    text: "5.下列何者不是教育科系的必修課程？",
    options: [
      "(A)心理學",
      "(B)社會創新",
      "(C)2D動畫製作",
      "(D)程式設計"
    ],
    answer: 1
  }
];

let currentQuestion = 0; // 當前題目索引
let showResult = false;
let resultText = "";
let hoverStartTimes = [null, null, null, null];
let hoverIndex = -1;
let finished = false;
let resultShowTime = 0; // 新增：顯示結果的開始時間
let finishShowTime = 0; // 新增：記錄完成顯示的時間

function setup() {
  createCanvas(500, 500); // 設定畫布大小
  cam = createCapture(VIDEO); // 創建鏡頭捕捉
  cam.size(400, 400); // 設定鏡頭大小
  cam.hide(); // 隱藏鏡頭預覽
  textSize(30); // 設定文字大小
  introStartTime = millis(); // 記錄說明畫面開始時間
}

function draw() {
  background(220);

  // 說明畫面
  if (showIntro) {
    fill(255, 255, 0);
    stroke(0);
    rect(50, 100, 400, 300, 30);
    fill(255, 0, 0);
    textSize(26);
    textAlign(CENTER, TOP);
    text("遊戲規則", width / 2, 130);
    textSize(18);
    fill(0);
    text(
      "1. 請拿藍色物體在鏡頭前操作\n" +
      "2. 藍色圓點停留在選項上3秒即可作答\n" +
      "3. 答對自動進入下一題\n" +
      "4. 答錯會顯示正確答案，5秒後自動進入下一題\n" +
      "5. 全部完成後自動跳轉",
      width / 2, 180
    );
    textAlign(LEFT, BASELINE);

    // 停留10秒後進入問答
    if (millis() - introStartTime > 10000) {
      showIntro = false;
    }
    return;
  }

  // 鏡像顯示鏡頭
  push();
  translate(width, 0);
  scale(-1, 1);
  image(cam, 0, 0, width, height);
  pop();

  if (finished) {
    // 第一次進入 finished 狀態時記錄時間
    if (finishShowTime === 0) {
      finishShowTime = millis();
    }
    fill(0, 200, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("恭喜你完成所有題目！", width / 2, height / 2);
    textAlign(LEFT, BASELINE);

    // 停留約5秒後自動跳轉
    if (millis() - finishShowTime > 5000) {
      window.location.href = "https://gino011111.github.io/Guardian/";
    }
    return;
  }

  let q = questions[currentQuestion];

  // 偵測藍色
  let bluePos = detectBlue(cam);

  // 顯示題目
  fill(255, 0, 0); // 題目紅色
  textSize(28);    // 題目字體大一點
  textStyle(BOLD); // 題目粗體
  text(q.text, 30, 280);
  textStyle(NORMAL); // 選項恢復正常字體

  // 顯示選項
  textSize(18);
  for (let i = 0; i < q.options.length; i++) {
    fill(255);
    stroke(0);
    rect(100 - 10, 320 + i * 50 - 25, 300, 40, 10);
    fill(255, 0, 0); // 選項紅色
    noStroke();
    text(q.options[i], 100, 320 + i * 50);
  }

  // 顯示藍色游標
  hoverIndex = -1;
  if (bluePos) {
    fill(0, 0, 255);
    noStroke();
    ellipse(bluePos.x, bluePos.y, 30, 30);

    // 檢查藍色圓點是否在某個選項上
    for (let i = 0; i < q.options.length; i++) {
      let x = 100, y = 320 + i * 50;
      if (
        bluePos.x > x - 10 &&
        bluePos.x < x + 290 &&
        bluePos.y > y - 25 &&
        bluePos.y < y + 15
      ) {
        hoverIndex = i;
        if (hoverStartTimes[i] === null) {
          hoverStartTimes[i] = millis();
        }
        // 停留超過3秒自動作答
        if (!showResult && millis() - hoverStartTimes[i] > 3000) {
          if (i === q.answer) {
            resultText = "恭喜答對！";
            showResult = true;
            resultShowTime = millis();
          } else {
            // 只取選項的英文 (A)、(B)...
            let correctOption = q.options[q.answer].match(/\([A-D]\)/)[0];
            resultText = "答錯了，正確答案是：" + correctOption;
            showResult = true;
            resultShowTime = millis();
          }
          hoverStartTimes = [null, null, null, null];
        }
      } else {
        hoverStartTimes[i] = null;
      }
    }
  } else {
    hoverStartTimes = [null, null, null, null];
  }

  // 顯示進度條
  for (let i = 0; i < q.options.length; i++) {
    let x = 100, y = 320 + i * 50;
    if (hoverStartTimes[i] !== null && !showResult) {
      let progress = constrain((millis() - hoverStartTimes[i]) / 3000, 0, 1);
      fill(0, 0, 255, 120);
      rect(x - 10, y + 20, 300 * progress, 5, 3);
    }
  }

  // 顯示結果
  if (showResult) {
    fill(255, 255, 0);
    stroke(0);
    rect(70, 90, 360, 80, 20); // 框加大
    fill(0);
    textSize(28);
    textAlign(CENTER, CENTER);
    text(resultText, width / 2, 130);
    textAlign(LEFT, BASELINE);

    // 答對自動進入下一題
    if (resultText === "恭喜答對！") {
      if (millis() - resultShowTime > 1200) {
        showResult = false;
        currentQuestion++;
        if (currentQuestion >= questions.length) {
          finished = true;
        }
      }
    } else {
      // 答錯自動5秒後進入下一題
      if (millis() - resultShowTime > 5000) {
        showResult = false;
        currentQuestion++;
        if (currentQuestion >= questions.length) {
          finished = true;
        }
      }
    }
  }
}

// 偵測鏡頭畫面中的藍色區域，回傳座標
function detectBlue(cam) {
  cam.loadPixels();
  let threshold = 80;
  let sumX = 0, sumY = 0, count = 0;
  for (let y = 0; y < cam.height; y += 5) {
    for (let x = 0; x < cam.width; x += 5) {
      let i = (x + y * cam.width) * 4;
      let r = cam.pixels[i];
      let g = cam.pixels[i + 1];
      let b = cam.pixels[i + 2];
      if (b - r > threshold && b - g > threshold && b > 100) {
        let canvasX = map(cam.width - x, 0, cam.width, 0, width);
        let canvasY = map(y, 0, cam.height, 0, height);
        sumX += canvasX;
        sumY += canvasY;
        count++;
      }
    }
  }
  if (count > 0) {
    return { x: sumX / count, y: sumY / count };
  } else {
    return null;
  }
}

function mousePressed() {
  // draw 裡會偵測 mouseIsPressed
}

// 在每次重新開始時重設 finishShowTime
function resetQuiz() {
  finished = false;
  finishShowTime = 0;
  currentQuestion = 0;
  showResult = false;
  resultText = "";
  hoverStartTimes = [null, null, null, null];
  hoverIndex = -1;
}
