/**
 * 請將此程式碼複製並貼上到 Google Sheets 的 Apps Script 編輯器中 (擴充功能 -> Apps Script)。
 * 部署步驟：
 * 1. 點擊右上角「部署」 -> 「新增部署作業」
 * 2. 選擇類型為「網頁應用程式 (Web App)」
 * 3. 執行身分選擇「我」，具有存取權的使用者選擇「所有人」
 * 4. 點擊「部署」，並授權應用程式。
 * 5. 將取得的「網頁應用程式網址」填入前端專案的 .env 檔案中的 VITE_GOOGLE_APP_SCRIPT_URL
 */

function doGet(e) {
  // 取得題目數量，預設為 5 題
  var limit = parseInt(e.parameter.limit) || 5; 
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "找不到「題目」工作表" })).setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1); // 略過標題列
  
  var questions = [];
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0]) { // 確保有題號
      questions.push({
        id: rows[i][0].toString(),
        question: rows[i][1].toString(),
        options: {
          A: rows[i][2].toString(),
          B: rows[i][3].toString(),
          C: rows[i][4].toString(),
          D: rows[i][5].toString()
        }
        // 解答不回傳至前端
      });
    }
  }
  
  // 隨機打亂題目並取前 limit 題
  questions.sort(function() { return 0.5 - Math.random() });
  var selected = questions.slice(0, limit);
  
  return ContentService.createTextOutput(JSON.stringify(selected))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // 解析前端傳來的 JSON (格式: { id: "player_id", answers: [{id: "1", answer: "A"}], passThreshold: 3 })
    var body = JSON.parse(e.postData.contents);
    var userId = body.id;
    var userAnswers = body.answers; 
    var passThreshold = parseInt(body.passThreshold) || 3;
    
    // 1. 計算成績
    var qSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
    if (!qSheet) throw new Error("找不到「題目」工作表");
    var qData = qSheet.getDataRange().getValues();
    
    var qDict = {};
    for (var i = 1; i < qData.length; i++) {
      if (qData[i][0]) {
        qDict[qData[i][0].toString()] = qData[i][6].toString(); // 儲存正確解答
      }
    }
    
    var score = 0;
    for (var j = 0; j < userAnswers.length; j++) {
      var ansObj = userAnswers[j];
      var correctAns = qDict[ansObj.id.toString()];
      if (correctAns && correctAns.toUpperCase() === ansObj.answer.toString().toUpperCase()) {
        score += 1;
      }
    }
    
    var isPassed = (score >= passThreshold);
    
    // 2. 紀錄成績到 "回答" 工作表
    var aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("回答");
    if (!aSheet) throw new Error("找不到「回答」工作表");
    var aData = aSheet.getDataRange().getValues();
    
    var foundObj = null;
    var foundIndex = -1;
    // 尋找是否已有相同 ID (略過標題列)
    for (var k = 1; k < aData.length; k++) {
      if (aData[k][0] && aData[k][0].toString() === userId.toString()) {
        foundObj = {
          id: aData[k][0],
          playCount: parseInt(aData[k][1]) || 0,
          currentScore: parseInt(aData[k][2]) || 0, // 雖名為總分欄位，依需求通常為本次得分
          highestScore: parseInt(aData[k][3]) || 0,
          firstPassScore: aData[k][4] === "" ? null : parseInt(aData[k][4]),
          attemptsToPass: aData[k][5] === "" ? null : parseInt(aData[k][5]),
        };
        foundIndex = k + 1; // getRange 使用 1-based index
        break;
      }
    }
    
    var timestamp = new Date();
    
    // 更新或新增資料
    if (foundIndex !== -1) {
      // 已經玩過
      var newPlayCount = foundObj.playCount + 1;
      var newHighestScore = Math.max(foundObj.highestScore, score);
      var newFirstPassScore = foundObj.firstPassScore;
      var newAttemptsToPass = foundObj.attemptsToPass;
      
      // 若本次通關，且為「第一次通關」
      if (isPassed && newFirstPassScore === null) {
        newFirstPassScore = score;
        newAttemptsToPass = newPlayCount;
      }
      
      aSheet.getRange(foundIndex, 2).setValue(newPlayCount);        // 闖關次數
      aSheet.getRange(foundIndex, 3).setValue(score);               // 當次得分 (總分)
      aSheet.getRange(foundIndex, 4).setValue(newHighestScore);     // 最高分
      if (newFirstPassScore !== null) {
        aSheet.getRange(foundIndex, 5).setValue(newFirstPassScore); // 第一次通關分數
        aSheet.getRange(foundIndex, 6).setValue(newAttemptsToPass); // 花了幾次通關
      }
      aSheet.getRange(foundIndex, 7).setValue(timestamp);           // 最近遊玩時間
    } else {
      // 第一次玩
      var initPlayCount = 1;
      var initFirstPassScore = isPassed ? score : "";
      var initAttemptsToPass = isPassed ? 1 : "";
      
      aSheet.appendRow([
        userId,
        initPlayCount,
        score,
        score, // 最高分 (第一次即最高分)
        initFirstPassScore,
        initAttemptsToPass,
        timestamp
      ]);
    }
    
    // 3. 回傳結果給前端
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      score: score,
      isPassed: isPassed
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
