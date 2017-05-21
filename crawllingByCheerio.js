/**
 * Created by eunchul on 2017-05-20.
 */
/**
 * Created by T on 2017-05-19.
 */
var unirest = require('unirest');
var cheerio = require('cheerio');
//결과를 csv파일로 보낸다.
var json2csv = require('json2csv');
var csv2json = require('csvtojson');
var fs = require('fs');
var fields = ['questions','anwsers'];

var urlArray = [];
var nameArray = [];
var questions = [];
var anwsers = [];
var result = [];
var buffer;
var cnt = 0;

const csv=require('csvtojson')
csv()
    .fromFile('url.csv')
    .on('json',(jsonObj)=>{
    // combine csv header row and csv line to a json object
    nameArray.push(jsonObj.subjects);
    urlArray.push(jsonObj.urls);
})
.on('done',(error)=>{
    parseResult();
})
function parseResult() {
    for (var idx = 0; idx < urlArray.length; idx++) {
        unirest.get(urlArray[idx])
            .headers({'Content-Type': 'text/html charset=utf-8'})
            .end(function (res) {
                subject = cheerio.load(res.body, {decodeEntities: false});
                // 길이 구하기 aws의 경우 1~n-1까지
                var subjectLength = subject('.aws-text-box').length;
                // 반복해서 단위별 얻기
                for (var i = 1; i < subjectLength - 1; i++) {
                    var faq = subject('.aws-text-box').eq(i).html();
                    QNA = cheerio.load(faq, {decodeEntities: false});
                    //질문길이
                    faqLength = QNA('p').length;
                    // 질문과 답 구별
                    for (var j = 0; j < faqLength; j++) {
                        if (QNA('p').eq(j).text().trim().charAt(0) == 'Q') {
                            //console.log(QNA('p').eq(j).children('b').text());
                            if (buffer != null)
                                anwsers.push(buffer);
                            // 질문지 넎기
                            buffer = "";
                            questions.push(QNA('p').eq(j).children('b').text().trim());
                            // 질문지와 같이 있는 대답 넣기
                            if (QNA('p').eq(j).children().length != 1) {
                                var temp = cheerio.load(QNA('p').eq(j).html(), {decodeEntities: false});
                                temp('b').remove();
                                //console.log(temp.html());
                                buffer = buffer + temp.text().trim();
                            }
                        }
                        // 대답 인 경우
                        else {
                            buffer = buffer + QNA('p').eq(j).text().trim();
                        }
                    }
                }
                anwsers.push(buffer);
                for (var i = 0; i < questions.length; i++) {
                    result.push({"questions": questions[i], "anwsers": anwsers[i]});
                    //console.log(questions[i]);
                    //console.log(anwsers[i]);
                }
                var csv = json2csv({data: result, fields: fields}, function (err, csv) {
                    if (err) console.log(err);
                    //console.log(csv);
                    fs.writeFile('./result/'+nameArray[cnt++] + '.csv', csv, function (err) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                });

                questions = [];
                anwsers = [];
                result = [];
                buffer = null;
            });
    }
}

