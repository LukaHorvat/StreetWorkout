var express 	= require("express"),
	stylus 		= require("stylus"),
	nib 		= require("nib"),
	passport	= require("passport")
	GoogleStrat	= require("passport-google").Strategy;

//beginregion Ugly setup stuff
var app = express();
var compile = function (str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
};

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
	{ 
		src: __dirname + '/public', 
		compile: compile
  	}
));
app.configure(function() {
	app.use(express.static('public'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
 	done(null, obj);
});

passport.use(new GoogleStrat({
	returnURL: 'http://localhost:1000/return/google',
	realm: 'http://localhost:1000/'
},
function(identifier, profile, done) {
	profile.identifier = identifier;
	done(null, profile);
}));
//endregion

app.get("/login/google", passport.authenticate("google"));

app.get("/return/google", passport.authenticate("google", {
	successRedirect: "/",
	failureRedirect: "/login/failed" }));

app.get("/login/failed", function (req, res) {
	res.end("Failed to login");
});

app.get("/", function (req, res) {
	res.write("hello ");
	res.write(req.user.displayName);
	res.end();
});
app.listen(1000);
console.log("[log] server started");