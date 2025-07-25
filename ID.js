javascript:(function() {
    // 臺灣身分證字號產生器書籤小工具
    // 功能：支援多條件組合生成、地區/性別/組數同一行顯示、Toast 通知、單獨及全部複製。

    // 模組一：資料定義與工具函數
    // ----------------------------------------------------
    const areaCodes = {
        'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 34,
        'J': 18, 'K': 19, 'M': 21, 'N': 22, 'O': 35, 'P': 23, 'Q': 24, 'R': 25, 'S': 26,
        'T': 27, 'U': 28, 'V': 29, 'X': 30, 'Y': 31, 'W': 32, 'Z': 33
    };

    const taiwanAreaMapping = {
        'A': '臺北市', 'B': '臺中市', 'C': '基隆市', 'D': '臺南市', 'E': '高雄市',
        'F': '新北市', 'G': '宜蘭縣', 'H': '桃園市', 'I': '嘉義市', 'J': '新竹縣',
        'K': '苗栗縣', 'M': '南投縣', 'N': '彰化縣', 'O': '新竹市', 'P': '雲林縣',
        'Q': '嘉義縣', 'R': '臺南縣', 'S': '高雄縣', 'T': '屏東縣', 'U': '花蓮縣',
        'V': '臺東縣', 'W': '金門縣', 'X': '澎湖縣', 'Y': '陽明山 (已廢止)', 'Z': '連江縣'
    };

    const allAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYX'; // 排除I和O

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomLetter() {
        return allAlphabet.charAt(getRandomNumber(0, allAlphabet.length - 1));
    }

    function calculateCheckDigit(idWithoutCheckDigit) {
        let sum = 0;
        const firstLetter = idWithoutCheckDigit.charAt(0).toUpperCase();
        const firstLetterValue = areaCodes[firstLetter];

        if (!firstLetterValue) {
            console.error('無效的第一碼字母:', firstLetter);
            return -1;
        }

        sum += Math.floor(firstLetterValue / 10) * 1;
        sum += (firstLetterValue % 10) * 9;

        for (let i = 1; i < 9; i++) {
            sum += parseInt(idWithoutCheckDigit.charAt(i), 10) * (9 - i);
        }

        let checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit;
    }

    // 模組二：身分證字號生成邏輯
    // ----------------------------------------------------
    function generateTaiwanID(areaChar, gender) {
        const firstChar = areaChar ? areaChar.toUpperCase() : getRandomLetter();
        const secondChar = gender ? gender : getRandomNumber(1, 2);
        let middleDigits = '';
        for (let i = 0; i < 7; i++) {
            middleDigits += getRandomNumber(0, 9);
        }
        const idWithoutCheckDigit = `${firstChar}${secondChar}${middleDigits}`;
        const checkDigit = calculateCheckDigit(idWithoutCheckDigit);
        return `${idWithoutCheckDigit}${checkDigit}`;
    }

    // 模組三：UI 呈現與事件處理
    // ----------------------------------------------------
    const panelId = 'taiwan-id-generator-panel';
    let panel = document.getElementById(panelId);

    if (!panel) {
        panel = document.createElement('div');
        panel.id = panelId;
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 350px;
            max-height: 90vh;
            overflow-y: auto;
            color: #333;
        `;
        document.body.appendChild(panel);
    } else {
        panel.innerHTML = '';
        panel.style.display = 'flex';
    }

    // --- Toast 通知模組 ---
    function showToast(message, type = 'info') {
        let toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            font-size: 0.9em;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        if (type === 'success') {
            toast.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            toast.style.backgroundColor = '#dc3545';
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = 1;
        }, 50);

        setTimeout(() => {
            toast.style.opacity = 0;
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000); // 3秒後消失
    }

    // 標題
    const title = document.createElement('h3');
    title.textContent = '臺灣身分證字號產生器';
    title.style.cssText = `
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.3em;
        text-align: center;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    `;
    panel.appendChild(title);

    // --- 條件列容器 ---
    const conditionsContainer = document.createElement('div');
    conditionsContainer.id = 'conditions-container';
    conditionsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;
        padding-right: 5px; /* 留一點空間給滾動條 */
        max-height: 200px; /* 限制高度 */
        overflow-y: auto; /* 超過高度時滾動 */
    `;
    panel.appendChild(conditionsContainer);

    // 創建一個新的條件列的函數
    function createConditionRow() {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #f0f0f0;
            padding: 8px;
            border-radius: 5px;
            box-shadow: inset 0 0 3px rgba(0,0,0,0.05);
            flex-wrap: wrap; /* 內容多時換行 */
        `;

        // 地區選擇
        const areaSelect = document.createElement('select');
        areaSelect.style.cssText = `
            padding: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            flex-grow: 1; /* 彈性佔用空間 */
            min-width: 90px;
        `;
        let optionRandomArea = document.createElement('option');
        optionRandomArea.value = '';
        optionRandomArea.textContent = '地區 (隨機)';
        areaSelect.appendChild(optionRandomArea);
        for (const char in taiwanAreaMapping) {
            const option = document.createElement('option');
            option.value = char;
            option.textContent = `${char} (${taiwanAreaMapping[char]})`;
            areaSelect.appendChild(option);
        }
        row.appendChild(areaSelect);

        // 性別選擇
        const genderSelect = document.createElement('select');
        genderSelect.style.cssText = `
            padding: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            flex-grow: 1;
            min-width: 80px;
        `;
        const optionRandomGender = document.createElement('option');
        optionRandomGender.value = '';
        optionRandomGender.textContent = '性別 (隨機)';
        genderSelect.appendChild(optionRandomGender);
        const optionMale = document.createElement('option');
        optionMale.value = '1';
        optionMale.textContent = '男';
        genderSelect.appendChild(optionMale);
        const optionFemale = document.createElement('option');
        optionFemale.value = '2';
        optionFemale.textContent = '女';
        genderSelect.appendChild(optionFemale);
        row.appendChild(genderSelect);

        // 組數輸入
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.min = '1';
        countInput.max = '50'; // 每列最大允許50組，避免單列產生過多
        countInput.value = '1';
        countInput.style.cssText = `
            padding: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 50px; /* 固定寬度 */
            text-align: center;
        `;
        row.appendChild(countInput);

        // 刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.style.cssText = `
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        `;
        deleteBtn.onmouseover = function() { this.style.backgroundColor = '#c82333'; };
        deleteBtn.onmouseout = function() { this.style.backgroundColor = '#dc3545'; };
        deleteBtn.onclick = function() {
            row.remove(); // 移除整個條件列
        };
        row.appendChild(deleteBtn);

        conditionsContainer.appendChild(row);
    }

    // 初始添加一列條件
    createConditionRow();

    // 增加一列按鈕
    const addRowButton = document.createElement('button');
    addRowButton.textContent = '增加一列查詢條件';
    addRowButton.style.cssText = `
        padding: 8px 15px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.2s ease;
        margin-bottom: 10px;
    `;
    addRowButton.onmouseover = function() { this.style.backgroundColor = '#5a6268'; };
    addRowButton.onmouseout = function() { this.style.backgroundColor = '#6c757d'; };
    addRowButton.onclick = createConditionRow;
    panel.appendChild(addRowButton);

    // 生成身分證字號按鈕
    const generateButton = document.createElement('button');
    generateButton.textContent = '生成身分證字號';
    generateButton.style.cssText = `
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.2s ease;
    `;
    generateButton.onmouseover = function() { this.style.backgroundColor = '#0056b3'; };
    generateButton.onmouseout = function() { this.style.backgroundColor = '#007bff'; };
    panel.appendChild(generateButton);

    // 結果顯示區塊
    const resultsDiv = document.createElement('div');
    resultsDiv.style.cssText = `
        margin-top: 15px;
        border-top: 1px solid #eee;
        padding-top: 10px;
        max-height: 250px;
        overflow-y: auto;
        background-color: #fefefe;
        border-radius: 5px;
        padding: 8px;
        border: 1px solid #eee;
        min-height: 50px;
    `;
    panel.appendChild(resultsDiv);

    // 複製所有按鈕
    const copyAllButton = document.createElement('button');
    copyAllButton.textContent = '複製所有結果';
    copyAllButton.style.cssText = `
        padding: 8px 15px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        margin-top: 10px;
        transition: background-color 0.2s ease;
        width: 100%;
    `;
    copyAllButton.onmouseover = function() { this.style.backgroundColor = '#218838'; };
    copyAllButton.onmouseout = function() { this.style.backgroundColor = '#28a745'; };
    copyAllButton.style.display = 'none'; // 初始隱藏
    panel.appendChild(copyAllButton);

    // 關閉按鈕
    const closeButton = document.createElement('button');
    closeButton.textContent = '關閉';
    closeButton.style.cssText = `
        width: 100%;
        padding: 8px 15px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        margin-top: 10px;
        transition: background-color 0.2s ease;
    `;
    closeButton.onmouseover = function() { this.style.backgroundColor = '#c82333'; };
    closeButton.onmouseout = function() { this.style.backgroundColor = '#dc3545'; };
    closeButton.onclick = function() {
        panel.style.display = 'none';
    };
    panel.appendChild(closeButton);

    // --- 事件綁定 ---
    generateButton.onclick = function() {
        resultsDiv.innerHTML = ''; // 清空之前的結果
        const allGeneratedIDs = [];

        // 遍歷所有條件列
        conditionsContainer.querySelectorAll('.row').forEach(row => { // 這裡需要一個class來選取每個row
            // 因為我是在createConditionRow裡直接appendChild，所以每個row沒有class，
            // 這裡改成直接取得conditionsContainer的所有子元素即可
        });

        Array.from(conditionsContainer.children).forEach(row => {
            const areaSelect = row.querySelector('select:nth-of-type(1)');
            const genderSelect = row.querySelector('select:nth-of-type(2)');
            const countInput = row.querySelector('input[type="number"]');

            const selectedArea = areaSelect.value;
            const selectedGender = genderSelect.value ? parseInt(genderSelect.value, 10) : undefined;
            const count = parseInt(countInput.value, 10);

            if (isNaN(count) || count < 1) {
                showToast('組數必須是有效數字且大於等於1', 'error');
                return;
            }

            for (let i = 0; i < count; i++) {
                const id = generateTaiwanID(selectedArea, selectedGender);
                allGeneratedIDs.push(id);

                const idDisplay = document.createElement('div');
                idDisplay.textContent = id;
                idDisplay.style.cssText = `
                    padding: 5px;
                    border-bottom: 1px dotted #eee;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    color: #444;
                    text-align: center;
                    cursor: pointer;
                    transition: background-color 0.1s ease;
                `;
                idDisplay.title = '點擊複製';
                idDisplay.onmouseover = function() { this.style.backgroundColor = '#e9e9e9'; };
                idDisplay.onmouseout = function() { this.style.backgroundColor = '#fefefe'; };
                idDisplay.onclick = function() {
                    navigator.clipboard.writeText(this.textContent)
                        .then(() => showToast(`已複製：${this.textContent}`, 'success'))
                        .catch(err => showToast('複製失敗！', 'error'));
                };
                resultsDiv.appendChild(idDisplay);
            }
        });

        if (allGeneratedIDs.length > 0) {
            copyAllButton.style.display = 'block';
            copyAllButton.onclick = function() {
                const allIDsText = allGeneratedIDs.join('\n');
                navigator.clipboard.writeText(allIDsText)
                    .then(() => showToast(`已複製所有 ${allGeneratedIDs.length} 組身分證字號！`, 'success'))
                    .catch(err => showToast('複製所有失敗！', 'error'));
            };
        } else {
            copyAllButton.style.display = 'none';
        }
    };

    // 讓面板可拖曳
    let isDragging = false;
    let offsetX, offsetY;

    panel.onmousedown = function(e) {
        // 檢查是否點擊在互動元素上
        const target = e.target;
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('#' + resultsDiv.id)) {
            return;
        }
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = 'grabbing';
    };

    document.onmousemove = function(e) {
        if (!isDragging) return;
        panel.style.left = (e.clientX - offsetX) + 'px';
        panel.style.top = (e.clientY - offsetY) + 'px';
    };

    document.onmouseup = function() {
        isDragging = false;
        panel.style.cursor = 'grab';
    };

    // 初始設置面板可拖曳的樣式
    panel.style.cursor = 'grab';

})();