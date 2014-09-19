
var express=require('express')

    ,http=require('http')

    ,OAuth= require('oauth').OAuth

    ,session = require('express-session')

    ,qs=require('querystring')
     
    ,routes=require('./routes')

    ,config=require('./config');




var app=module.exports=express()
   ,env = process.env.NODE_ENV || 'development';

if ('development' == env) {

   	app.set('trust proxy', 1) // trust first proxy   
  	app.set('views', __dirname + '/views');
  	app.set('view engine', 'jade'); 	
	app.use(
		session({secret: '1234754er22rrd14vc5'})
	);
}

var oa= new OAuth(
		    "https://twitter.com/oauth/request_token"
		    ,"https://twitter.com/oauth/access_token"
		    ,config.keys.twitterConsumerKey
		    ,config.keys.twitterConsumerSecret
		    ,"1.0A"
		    ,config.domain+'/callback'
		    ,"HMAC-SHA1" 
		    );  

	/*app.get('/'	,		
		function(req, res,next) {
			


		
		}
	);*/

	app.get('/connect',
	    function(req, res) {		    	
		    if(typeof req.session.oauthRequestToken=='undefined') {
		    	console.log('dd');
		    	oa.getOAuthRequestToken(
		  			function(error, oauthToken, oauthTokenSecret, results){
					    
					    if (!error) {
						  req.session.oauthRequestToken = oauthToken;
	      				  req.session.oauthRequestTokenSecret = oauthTokenSecret;			
	      				  res.redirect(config.urls.AccessToken+req.session.oauthRequestToken);		  	
		      
					    }
					    else
					    	console.log(error);
		 			}
	 			);
		    }
		    else		    	
		   res.redirect(config.domain+'/callback');  	
		}
	);

	app.get('/callback',
	    function(req, res) {
	    		if(typeof req.session.oauthAccessToken=='undefined'){
	    			console.log('dd');
	    			oa.getOAuthAccessToken(
					 req.session.oauthRequestToken
				    ,req.session.oauthRequestTokenSecret
				    ,req.query.oauth_verifier	        
				    ,function(error, oauthAccessToken, oauthAccessTokenSecret, results){
				        
				        if(!error){
				            req.session.oauthAccessToken = oauthAccessToken;
				            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;	
				            getInfo(req, res);		
				        }
				        else			            
				            console.log(error);	 
					}
				);
	    		}
	    		else

	    		getInfo(req, res);
				
		}	
	);
	
	app.get('/tweet',
		function(req, res) {

            var params=qs.parse(req.url);
            switch (req.query.op){
        
            	case 'sendTweet':{
            		if(params['status']!=null){               			 	
            			oa.post(
							config.urls.StatusUpdate
							,req.session.oauthAccessToken
							,req.session.oauthAccessTokenSecret
							,{ "status": params['status']+' FROM @erdidrsun'},
						    function (error, data){
										
								if(!error)
									res.send(data);
								else
									res.send(error);
							}
						);	
            		}
            		
            	}
            }    
		}
	);					 

function getInfo(req,res){
	oa.get(
			config.urls.Verification
		   ,req.session.oauthAccessToken
		   ,req.session.oauthAccessTokenSecret
		   ,function(error, data, response){
						        
				if (!error){
					data=JSON.parse(data);
					req.session.twitterScreenName = data['screen_name'];   
					req.session.twitterName= data['description'];											    			
					res.render('callback', { title: 'Anasayfa',Name:data['name'],profile_image:data['profile_image_url']});
				}
				else
					console.log(error); 
			}
		);
}
app.listen(1213);