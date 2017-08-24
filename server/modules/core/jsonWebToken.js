var jwt = require("jsonwebtoken");

var content ={msg:"today  is  a  good  day",k:3333}; // 要生成token的主题信息
var secretOrPrivateKey="I am a goog man!" // 这是加密的key（密钥）
var token = jwt.sign(content, secretOrPrivateKey);
console.log("token ：" +token );
jwt.verify(token, secretOrPrivateKey, function (err, decode) {
    if (err) {  //  时间失效的时候/ 伪造的token
        console.log(err,'====error')
    } else {
        console.log(decode);   // today  is  a  good  day
    }
})

