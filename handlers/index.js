var Drive =  require('./platforms/Drive');
 module.exports = {
    
    process(req,res,next){
        var drive = new Drive();
        drive.init();
        var oauth =  drive.connect();
        var authUrl = drive.getAuthUrl(oauth);
        res.redirect(authUrl);
    },
    token(req,res,next){
        if(!req.query.hasOwnProperty('code') && !req.query.code){
            res.send("No Token Key Provided");
        }

        res.cookie('token',req.query.code);
        var drive =  new Drive();
        drive.init();
        var oauth = drive.connect();
        oauth.getToken(req.query.code,(err,token)=>{
            if(err){
                console.log(err);
                return res.json(req.error("Some Error Occured"));
            }

            res.cookie('access_token',token);
            res.redirect('/');

        });
    },
    
}