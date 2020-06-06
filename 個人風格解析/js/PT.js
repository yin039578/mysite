/*測試區*/

/*測試區end*/

/*資料設定*/
var q1 = new Array("獨當一面", "綜整研判", "變化多元", "創新獨特", "規劃組織", "井然有序", "同理情感",
		"接觸人群");
var q2 = new Array("實事求是", "問題解析", "實驗嘗試", "規劃遠景", "掌控管理", "資料彙整", "支持輔導",
		"建立關係");
var q3 = new Array("追根究底", "邏輯思考", "創新研發", "無拘無束", "建立規則", "行政處理", "傾聽他人",
		"團隊合作");
var q4 = new Array("績效導向", "數據分析", "發揮想像", "推銷想法", "協調支援", "注重細節", "感性溫馨",
		"教育咨詢");
var q5 = new Array("明快決策", "分析推理", "創意設計", "新奇刺激", "執行計畫", "按部就班", "關懷弱勢",
		"協助他人");

var qAll = new Array(q1, q2, q3, q4, q5);

/* 依"問題步驟"取得對應的問題 */
function getQText() {
	var str1 = "請選出\"";
	var str2 = "\"個與您較符合的項目";
	switch (qstep) {
	case 0:
		return str1 + "4" + str2;
		break;
	case 1:
		return str1 + "2" + str2;
		break;
	case 2:
		return str1 + "1" + str2;
		break;
	default:
		return "";
		break;
	}
}

/* 依"問題步驟"取得對應的錯誤 */
function getErrMsg(isBigger) {
	var bigS = "只能選擇\"";
	var bigE = "\"個工作要素";
	var smallS = "請選足\"";
	var smallE = "\"個工作要素";
	switch (qstep) {
	case 0:
		if (isBigger) {
			return bigS + "4" + bigE;
		} else {
			return smallS + "4" + smallE;
		}
		break;
	case 1:
		if (isBigger) {
			return bigS + "2" + bigE;
		} else {
			return smallS + "2" + smallE;
		}
		break;
	case 2:
		if (isBigger) {
			return bigS + "1" + bigE;
		} else {
			return smallS + "1" + smallE;
		}
		break;
	default:
		return "";
		break;
	}
}

/* 取得特色 */
function getIdea(type) {
	switch (type) {
	case 1:
		return "您的個人風格比較偏向<font style=\"font-size: 130%;\"><b>「開創型」</b></font><ul><li><b>行為特徵</b><br/>想法鮮活多變，勇於嘗試，工作時強調創新與嘗試。但有時可能會因為過於求新求變，致使在工作執行時會不切實際、虎頭蛇尾。<li><b>優點</b>：創意思考,勇於嘗試<li><b>缺點</b>：天馬行空,不切實際</ul><br/>";
		break;
	case 2:
		return "您的個人風格比較偏向<font style=\"font-size: 130%;\"><b>「情感型」</b></font><ul><li><b>行為特徵</b><br/>人際互動特質強，樂於助人，工作時強調團隊的和諧與合作。但有時可能會因為太過人際考量，而較為優柔寡斷。<li><b>優點</b>：關懷可親,樂於助人<li><b>缺點</b>：感情用事,優柔寡斷</ul><br/>";
		break;
	case 3:
		return "您的個人風格比較偏向<font style=\"font-size: 130%;\"><b>「組織型」</b></font><ul><li><b>行為特徵</b><br/>事務管理特質強，工作時強調按部就班，任務執行謹慎可靠。但有時可能會因為太過強調條理組織，而欠缺彈性。<li><b>優點</b>：按部就班,組織條理<li><b>缺點</b>：較少彈性,不愛變通</ul><br/>";
		break;
	case 4:
		return "您的個人風格比較偏向<font style=\"font-size: 130%;\"><b>「理智型」</b></font><ul><li><b>行為特徵</b><br/>邏輯分析特質強，工作時重視證據、數據，行事重視追根究底。但有時會因為對事不對人，而影響人際相處的氣氛。<li><b>優點</b>：邏輯分析,就事論事<li><b>缺點</b>：義正嚴辭,心直口快</ul><br/>";
		break;
	default:
		return "";
		break;
	}
}

/* 資料設定end */

/* 變數宣告 */
var step = 0; // 大步驟
var qstep = 0; // 問題步驟
var countR = 0; // ↓積分
var countI = 0;
var countO = 0;
var countF = 0;
/* 變數宣告end */

// 下一步
// 主流程控制
function next() {
	switch (step) {
	case 0:
		// 初始
		resetVar();
		var home = document.getElementById("div_home");
		home.style.display = "none";
		var question = document.getElementById("div_question");
		question.style.display = "table-cell";
		setText(qAll[step]);
		step = step + 1;
		showCheckBox();
		clearCheckBox();
		setQuestion();
		loading();
		break;
	case 1:
		loading();
		countR = 0; 
		countI = 40;
		countF = 0;
		countO = 40;
		var question = document.getElementById("div_question");
		question.style.display = "none";
		var end = document.getElementById("div_end");
		end.style.display = "table-cell";
		var pic = document.getElementById("div_pic");
		pic.innerHTML = "<iframe style=\"overflow: hidden;\" width=\"400\" height=\"400\" src=\""
				+ getPicUrl()
				+ "\" frameborder=\"0\" allowfullscreen></iframe>";
		setIdea();
		setBackSize(true);
		// 才會回第一頁
		step = 6;
		break;
	case 2:
	case 3:
	case 4:
		if (responseErr(selectedCheck())) {
			calculateAndSet();
			qstep = qstep + 1;
			clearCheckBox();
			setQuestion();
			loading();
		}
		if (qstep > 2) {
			setText(qAll[step]);
			resetQVar();
			step = step + 1;
			clearCheckBox();
			showCheckBox();
			setQuestion();
			loading();
		}
		break;
	case 5:
		if (responseErr(selectedCheck())) {
			calculateAndSet();
			qstep = qstep + 1;
			clearCheckBox();
			setQuestion();
			loading();
		}
		if (qstep > 2) {
			// else顯示
			loading();

			var question = document.getElementById("div_question");
			question.style.display = "none";
			var end = document.getElementById("div_end");
			end.style.display = "table-cell";
			var pic = document.getElementById("div_pic");
			pic.innerHTML = "<iframe style=\"overflow: hidden;\" width=\"400\" height=\"400\" src=\""
					+ getPicUrl()
					+ "\" frameborder=\"0\" allowfullscreen></iframe>";
			setIdea();
			setBackSize(true);
			// 才會回第一頁
			step = step + 1;
		}
		break;
	default:
		// 初始
		setBackSize(false);
		resetVar();
		var end = document.getElementById("div_end");
		end.style.display = "none";
		var home = document.getElementById("div_home");
		home.style.display = "table-cell";
		// scrollbar拉到最上
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
		loading();
		break;
	}
}

// 重置測驗資料
function resetVar() {
	step = 0;
	qstep = 0;
	countR = 0;
	countI = 0;
	countO = 0;
	countF = 0;
}

// 重置單題變數
function resetQVar() {
	qstep = 0;
}

// 設定問題依步驟顯示 4 / 2 / 1
function setQuestion() {
	var text = document.getElementById("text_q");
	text.innerHTML = getQText();

}

// 計分與隱藏其餘項目
function calculateAndSet() {
	// 取得要算幾分 依回合分別+ 1 / 2 / 2
	var point = 0;
	switch (qstep) {
	case 0:
		point = 1;
		break;
	case 1:
		point = 2;
		break;
	case 2:
		point = 2;
		break;
	default:
		return "";
		break;
	}

	for ( var i = 1; i <= 8; i++) {
		var qTemp = document.getElementById("cb_q" + i);
		var textTemp = document.getElementById("text_q" + i);

		if (qTemp.checked) {
			/* 算分 */
			if (i <= 2) {
				countR = countR + point;
			} else if (i <= 4) {
				countI = countI + point;
			} else if (i <= 6) {
				countO = countO + point;
			} else {
				countF = countF + point;
			}
			/* 算分 */
		} else {

			/* 顯示控制-沒選到的隱藏 */

			qTemp.style.visibility = "hidden";
			textTemp.style.visibility = "hidden";
		}
	}
}

// 計算勾選數目
// 0:府合
// 1:大於
// 2:小於
function selectedCheck() {
	var num = 0;
	var count = 0;
	switch (qstep) {
	case 0:
		num = 4;
		break;
	case 1:
		num = 2;
		break;
	case 2:
		num = 1;
		break;
	default:
		return "";
		break;
	}

	for ( var i = 1; i <= 8; i++) {
		var qTemp = document.getElementById("cb_q" + i);
		if (qTemp.checked) {
			count = count + 1;
		}
	}

	if (count == num) {
		return 0;
	}
	if (count > num) {
		return 1;
	}
	if (count < num) {
		return 2;
	}
}

// 清除所有選取
function clearCheckBox() {
	for ( var i = 1; i <= 8; i++) {
		var qTemp = document.getElementById("cb_q" + i);
		qTemp.checked = false;
	}
}

// 顯示所有選項
function showCheckBox() {
	for ( var i = 1; i <= 8; i++) {
		var qTemp = document.getElementById("cb_q" + i);
		qTemp.style.visibility = "visible";
		var tTemp = document.getElementById("text_q" + i);
		tTemp.style.visibility = "visible";
	}
}

// 回應錯誤訊息，並傳回true/false使主流程判斷繼續工作還是return
// 簡單的說是將0.1.2的錯誤訊息轉為true or false
function responseErr(num) {
	switch (num) {
	case 0:
		return true;
		break;
	case 1:
		alert(getErrMsg(true));
		return false;
		break;
	case 2:
		alert(getErrMsg(false));
		return false;
		break;
	default:
		return "";
		break;
	}
}

// 將題目資料顯示於業面上
// 換題時呼叫
function setText(qText) {
	for ( var i = 1; i <= qText.length; i++) {
		var temp = document.getElementById("text_q" + i);
		temp.innerHTML = qText[i - 1];
	}
	;
}

//
function setBackSize(isBig) {
	var div_back = document.getElementById("div_back");
	if (isBig) {
		div_back.style.width = "810px";
	} else {
		div_back.style.width = "410px";
	}
}

// 取圖片的資料
function getPicUrl() {

	var str = "";
	str = str + "https://chart.apis.google.com/chart";
	str = str + "?chxl=0:||開創型 :" + countI + "||情感型 :" + countF + "||組織型 :"
			+ countO + "||理智型 :" + countR + "|1:|0|5|10|15|20|25|30|35|40";
	str = str + "&chxr=0,-5,100|1,0,40";
	str = str + "&chxt=x,y";
	str = str + "&chs=400x400";
	str = str + "&cht=r";
	str = str + "&chco=0000FF";
	str = str + "&chds=0,40";
	str = str + "&chd=t:" + cal(countR, countI) + "," + countI;
	str = str + "," + cal(countI, countF) + "," + countF;
	str = str + "," + cal(countF, countO) + "," + countO;
	str = str + "," + cal(countO, countR) + "," + countR;
	str = str + "," + cal(countR, countI);
	str = str + "&chma=|0,5";
	str = str + "&chm=B,3399CC34,0,0,0";
	return str;
}

// 計算中間點公式
function cal(x, y) {
	x = x || 1	
	y = y || 1
	return Math.sqrt(2) * ((x * y) / (parseInt(x) + parseInt(y)));
}

// 顯示評語判斷
function setIdea() {
	// 先取得最大數
	const numArr = [countF, countI, countR, countO];
	const lagest = Math.max(...numArr);
	// 顯示評語
	var text = document.getElementById("div_endText");
	// 須先清空，否則第二次做會一直累加
	text.innerHTML = "";
	if (countI == lagest) {
		text.innerHTML = text.innerHTML + getIdea(1);
	}
	if (countF == lagest) {
		text.innerHTML = text.innerHTML + getIdea(2);
	}
	if (countO == lagest) {
		text.innerHTML = text.innerHTML + getIdea(3);
	}
	if (countR == lagest) {
		text.innerHTML = text.innerHTML + getIdea(4);
	}

	// 全都給完後將最後一個br移除
	text.innerHTML = text.innerHTML.substr(0, text.innerHTML.lastIndexOf("<"));
}

function loading() {
	var loading = document.getElementById("loading");
	var load = document.getElementById("load");
	loading.style.display = "block";
	load.style.display = "none";
	setTimeout(showload, 200);
}

function showload() {
	var loading = document.getElementById("loading");
	var load = document.getElementById("load");
	loading.style.display = "none";
	load.style.display = "block";
}

function printout() {
	if (!window.print) {
		alert("列印功能暫時停用，請按 Ctrl-P 來列印");
		return;
	}
	window.print();
}
