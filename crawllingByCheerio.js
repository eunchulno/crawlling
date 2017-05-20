/**
 * Created by eunchul on 2017-05-20.
 */
/**
 * Created by T on 2017-05-19.
 */
var unirest = require('unirest');
var cheerio = require('cheerio');

//var url = "https://aws.amazon.com/ko/lambda/faqs/?nc1=h_ls";
var url = "https://aws.amazon.com/ko/s3/faqs/";
var questions = [];
var anwser = [];
var buffer;
unirest.get(url)
    .headers({'Content-Type': 'text/html charset=utf-8'})
    .end(function (res) {
        subject = cheerio.load(res.body, { decodeEntities: false });
        // 길이 구하기 aws의 경우 1~n-1까지
        var subjectLength = subject('.aws-text-box').length;
        // 반복해서 단위별 얻기
        for(var i = 1 ; i<subjectLength-1;i++){
            var faq = subject('.aws-text-box').eq(i).html();
            QNA = cheerio.load(faq, { decodeEntities: false });
            //질문길이
            faqLength = QNA('p').length;
            // 질문과 답 구별
            for(var j = 0; j< faqLength ; j++){
                if(QNA('p').eq(j).text().trim().charAt(0)=='Q'){
                    //console.log(QNA('p').eq(j).children('b').text());
                    if(buffer!=null)
                        anwser.push(buffer);
                    // 질문지 넎기
                    buffer = "";
                    questions.push(QNA('p').eq(j).children('b').text());
                    // 질문지와 같이 있는 대답 넣기
                    if(QNA('p').eq(j).children().length!=1){
                        var temp = cheerio.load(QNA('p').eq(j).html(),{ decodeEntities: false });
                        temp('b').remove();
                        //console.log(temp.html());
                        buffer = buffer +temp.text();
                    }
                }
                // 대답 인 경우
                else{
                    buffer = buffer + QNA('p').eq(j).text();
                }
            }
        }
        anwser.push(buffer);
        for(var i = 0 ; i < questions.length ; i++){
            console.log(questions[i]);
            console.log(anwser[i]);
        }

    });
