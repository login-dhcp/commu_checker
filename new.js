function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


var replaceBlankTo = '_';
var idSeperator = '-';
const config = {
    'Icons': {
        '사쿠라기 마노': 'ManoIcon.webp',
        '카자노 히오리': 'HioriIcon.webp',
        'None': 'PIcon.webp',
        '시나리오': 'PIcon.webp',
        '페스': 'PIcon.webp',
    },
}

$(document).ready(function(e) {
    init();
});

async function init() {
    const text = `아이돌,사쿠라기 마노,Icon Mano P SSR 01.png,【ほわっとスマイル】櫻木真乃,커뮤니케이션:사쿠라기 마노/P/SSR-1,ほわほわアイドル,真乃ならできる,成長の証,いつかの気持ち,ずっと続く夢の先へ,,
이벤트,시나리오,Light up the illumination.jpg,Light up the illumination,커뮤니케이션:Light up the illumination,輝きの始まり,チカチカ、小さく瞬くみたいな,翳る前に、曇る前に,もう１度、ここから,１番輝く、そのために,,
이벤트,시나리오,廻る歯車、運命の瞬間.png,廻る歯車、運命の瞬間,運命の鍵・プレリュード,走り続けるために,別腹☆カラオケタイムばい！,凛と咲く、そのために,you/i/we,心、揃えたいから……,『L'Antica』,運命の鍵・シンフォニー
아이돌,카자노 히오리,Icon Hiori S SR 01.png,【克服の特訓】風野灯織,커뮤니케이션카자노 히오리/P/SR-1,困難だって超えられる,めぐるのダンス教室,にぎやかな日常,,,,
`
    // $.ajax({
    //     type: "GET",
    //     url: "./commu_list2.csv?version=210815",
    //     dataType: "text",
    //     success: function(data) { buildHTMLWithDataset(data, ','); }
    // });



    var parsed_data = csvToArray(text);
    datasetToHTML(parsed_data);

    await sleep(1000);
    getStateFromUrl();

}

function csvToArray(data) {
    // csv Description:
    // 0열: 커뮤 대분류
    // 1열: 커뮤 소분류
    // 2열: 커뮤 아이콘
    // 3열: 아이콘 하단 텍스트(=위키 문서 제목)
    // 4열: 위키 커뮤 데이터 구분자
    // 5열~: 커뮤 이름
    var textLines = data.split(/\r\n|\n/);
    var lines = [];
    var categories = {};
    var subCategories = {};

    for (var i = 0; i < textLines.length; i++) {
        var line = textLines[i].replaceAll(' ', replaceBlankTo).split(',');

        if (line[0].length > 0) {
            lines.push(line);
            var commuCategory = line[0];
            if (!(commuCategory in categories)) {
                categories[commuCategory] = {};
            }

            var commuSubCategory = line[1];
            if (!(commuSubCategory in categories[commuCategory])) {
                categories[commuCategory][commuSubCategory] = [];
            }
            categories[commuCategory][commuSubCategory].push(i);
        }
    }

    var returnData = {
        'lines': lines,
        'categories': categories,
    }
    return returnData;
}

function commuItemToHTML(item) {
    var category = item[0];
    var subcategory = item[1];
    var iconPath = item[2];
    var commuName = item[3];
    var header = item[4];
    var smallCommus = [];
    for (var i = 5; i < item.length; i++) {
        smallCommus.push(item[i]);
    }
    var commuHTML = '';
    commuHTML += `<div class="commuItem">\n`;
    commuHTML += `<div class="commuIcon" id="div${idSeperator}${commuName}" data-visible=false>\n`;
    commuHTML += `<img id="icon${idSeperator}${commuName}" alt="${iconPath}" src="https://shinycolors.info/wiki/특수:넘겨주기/file/${iconPath}" height="96"><br>`;
    commuHTML += `<span id="desc${idSeperator}${commuName}">0/n</span>`
    commuHTML += `<dialog id="dialog${idSeperator}${commuName}" class="commudialog">`;
    commuHTML += `<a href="https://shinycolors.info/wiki/${commuName}" target="_blank">${commuName}<br></a>`;
    for (commu of smallCommus) {
        if (commu.length > 0) {
            commuHTML += `<label><input type="checkbox" id="btn${idSeperator}${commuName}${idSeperator}${commu}">${commu}</label>`;
            commuHTML += `&nbsp;<a href="https://shinycolors.info/wiki/${header}/${commu}" target="_blank">링크<br></a>`
        }
    }

    commuHTML += `</dialog>`;
    commuHTML += `</div>`;
    commuHTML += `</div>`;

    return commuHTML;

}

function datasetToHTML(data) {
    // 1. build Categories Icons first
    const categoryKeys = Object.keys(data['categories']);
    for (var i = 0; i < categoryKeys.length; i++) {
        // 1.1. make button
        // 1.2. make dialog
        var category = categoryKeys[i];
        var buttonHTML = '';
        var buttonID = `btn${idSeperator}${category}`;

        var categoryDialogHTML = '';
        var dialogID = `dialog${idSeperator}${category}`;
        categoryDialogHTML += `<input type="image" id="${buttonID}" value="${category}" src="./src/${category}.png" height="40">`;
        categoryDialogHTML += `<br>`;
        categoryDialogHTML += `<dialog id="${dialogID}" class="categoryWindow">`;
        categoryDialogHTML += `<span>category: ${category}<br></span>`;
        categoryDialogHTML += `</dialog>`;
        document.getElementById('commu_list').insertAdjacentHTML('beforeend', categoryDialogHTML);
        // 1.2.3. add eventlistener to show dialogs
        document.getElementById(buttonID).addEventListener('click', function(e) {
            document.getElementById(this.id.replace('btn', 'dialog')).showModal();
        });


        // 1.2.1. add subcategory Dialog
        var subCategoryKeys = Object.keys(data['categories'][category]);
        for (var j = 0; j < subCategoryKeys.length; j++) {
            var subCategory = subCategoryKeys[j];
            var subCategoryDialogHTML = ``;
            var subCategoryDialogID = `${dialogID}${idSeperator}${subCategory}`;

            var buttonID_ = `${buttonID}${idSeperator}${subCategory}`;
            var subCategoryIcon = config['Icons'][subCategory.replace(replaceBlankTo, ' ')];
            subCategoryDialogHTML += `<input type="image" id="${buttonID_}" value="${subCategory}" src="https://shinycolors.info/wiki/특수:넘겨주기/file/${subCategoryIcon}" height="96">`;
            subCategoryDialogHTML += `<br>`;
            subCategoryDialogHTML += `${subCategory}`;
            subCategoryDialogHTML += `<br>`;
            subCategoryDialogHTML += `<dialog id=${subCategoryDialogID} class="categoryWindow">`;
            subCategoryDialogHTML += `<span> category: ${subCategory}<br></span>`;
            subCategoryDialogHTML += `</dialog>`;
            document.getElementById(dialogID).insertAdjacentHTML('beforeend', subCategoryDialogHTML);

            document.getElementById(buttonID_).addEventListener('click', function(e) {
                document.getElementById(this.id.replace('btn', 'dialog')).showModal();
            });

            // 1.2.2. add commu Items
            var commuList = data['categories'][category][subCategory];
            for (commuID of commuList) {
                var item_ = data['lines'][commuID];
                var commuIconHTML = commuItemToHTML(item_);
                document.getElementById(subCategoryDialogID).insertAdjacentHTML('beforeend', commuIconHTML);

                var commuName_ = item_[3];
                var commuIconID = `icon${idSeperator}${commuName_}`;
                document.getElementById(commuIconID).addEventListener('click', function(e) {
                    document.getElementById(this.id.replace('icon', 'dialog')).showModal();
                });

                var smallCommus = [];
                for (var k = 5; k < item_.length; k++) {
                    smallCommus.push(item_[k]);
                }

                for (smallCommu of smallCommus) {
                    if (smallCommu.length > 0) {
                        document.getElementById(`btn${idSeperator}${commuName_}${idSeperator}${smallCommu}`).addEventListener('change', function() {
                            var commuName__ = this.id.split(`${idSeperator}`)[1];
                            var divID__ = `div${idSeperator}${commuName__}`;

                            // 2.2.1. 각 commu checkbox에 img opacity 설정
                            var checked = document.querySelectorAll(`input[id^=btn${idSeperator}${commuName__}]:checked`).length;
                            var all = document.querySelectorAll(`input[id^=btn${idSeperator}${commuName__}]`).length;
                            if (checked === all) {
                                document.getElementById(divID__).dataset.visible = true;
                            } else {
                                document.getElementById(divID__).dataset.visible = false;
                            }

                            // 2.2.2. 각 icon에 selected된 commu 수 체크, visualize
                            var span_ID_ = `desc${idSeperator}${commuName__}`;
                            document.getElementById(span_ID_).innerHTML = `${checked}/${all}`;
                        })
                    }
                }
            }
        }
    }
}


function generateUrl() {
    // 1. 쿼리 파라미터를 제외한 현재 URL만 취득
    var url = document.location.href;
    if (url.indexOf("?") != -1) {
        url = url.substring(0, url.indexOf("?"));
    }

    // 2. 파라미터를 URL에 추가
    url += `?state=`
    var selected = document.querySelectorAll('input[type="checkbox"]:checked');
    for (let i = 0; i < selected.length; i++) {
        var key = selected[i].getAttribute('id');
        url += `${key}&`
    }
    // 4. URL의 마지막에 「&」가 있는 경우 마지막의 「&」를 삭제
    if (url.slice(-1) == "&") {
        url = url.substr(0, url.length - 1);
    }
    // 5. URL을 표시
    // $(labelId).text(url);
    console.log(url);
    alert(url);
}

function getStateFromUrl() {
    var url = document.location.href;
    if (url.includes('?state=')) {
        var states = url.split('?state=')[1];
        states = states.split('?')[0];
        if (states.length > 0) {
            var checkboxesToCheck = states.split('&');
            for (var i = 0; i < checkboxesToCheck.length; i++) {
                var key = checkboxesToCheck[i];
                key = decodeURIComponent(key);
                var val = document.getElementById(key);
                console.log(i,key, val);
                $(val).prop('checked', false).click();
            }
        }
    }
}