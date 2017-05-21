/**
 * Created by eunchul on 2017-05-21.
 */
var unirest = require('unirest');
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var fs = require('fs');

var fields = ['subjects','urls'];
var result = [];

var url = "https://aws.amazon.com/ko/faqs/";
var address = [];
unirest.get(url)
    .headers({'Content-Type': 'text/html charset=utf-8'})
    .end(function (res) {
        var site = cheerio.load(res.body, { decodeEntities: false });
        var qnaLength =  site('.aws-text-box').length;
        for (var i = 1 ; i < qnaLength-1 ; i++){
            var url = cheerio.load(site('.aws-text-box').eq(i).html(), { decodeEntities: false });
            var urls;
            if(url('a').attr('href').trim().charAt(0)!='h')
                urls = 'https://aws.amazon.com' + url('a').attr('href').trim();
            else
                urls = url('a').attr('href').trim();
             result.push({subjects:url('a').text().trim(),urls:urls});
             //console.log(url('a').attr('href'));
        }
        var csv = json2csv({data:result,fields:fields},function (err,csv) {
            if(err) console.log(err);
            fs.writeFile('url.csv',csv,function (err) {
                if(err) throw err;
                console.log('file saved');
            });
        });
    });