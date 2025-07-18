let listing=require('./models/listing');
const review = require('./models/review');
const { reviewSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');

module.exports.LogedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectURL=req.originalUrl;
        req.flash('error','Login Your Account');
        return res.redirect('/login');
    }
    else{
        next();
    }
}
module.exports.SaveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectURL){
        res.locals.redirectUrl=req.session.redirectURL;
    }
    next();
}
module.exports.Owner=async(req,res,next)=>{
    let {id}=req.params;
    let list=await listing.findById(id).populate('owner');
    if(!req.user._id.equals(list.owner._id)){
        req.flash('error','Your Are Not the Creater of this list');
        return res.redirect(`/listings/${id}`);    
    }
    next();
};

module.exports.isAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let currreview=await review.findById(reviewId);
    if(currreview.owner.equals(req.user._id)){
        next();
    }
    else{
        req.flash('error','Your Are Not the Author of this Review');
        return res.redirect(`/listings/${id}`);
    }
}

const validateReview = (req, res, next) => {
    console.log("REQ.BODY:", req.body); // 👈 Add this
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log("VALIDATION ERROR:", error); // 👈 Add this
        throw new ExpressError(400, error);
    } else {
        next();
    }
}
module.exports.validateReview=validateReview;